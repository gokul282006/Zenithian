import asyncio
import httpx
import re
import xml.etree.ElementTree as ET
import email.utils
from urllib.parse import quote_plus
from datetime import datetime, timezone
from typing import List, Dict, Any
from config import settings

class RetrievalService:
    def __init__(self):
        self.headers = {
            "User-Agent": "ZenithianAI/1.0 (Location Content Transformation Platform; contact@zenithian.ai)"
        }

    def clean_text(self, text: str) -> str:
        if not text:
            return ""
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def format_pub_date(self, pub_date_raw: str) -> str:
        if not pub_date_raw:
            return "Recent"
        try:
            parsed_tuple = email.utils.parsedate_tz(pub_date_raw)
            if parsed_tuple:
                dt = datetime.fromtimestamp(email.utils.mktime_tz(parsed_tuple), tz=timezone.utc)
                return dt.strftime("%b %d, %Y")
        except Exception:
            pass
        return "Recent"

    def _contains_location(self, text: str, location: str) -> bool:
        normalized_text = re.sub(r"\s+", " ", (text or "")).strip().casefold()
        normalized_location = re.sub(r"\s+", " ", (location or "")).strip().casefold()
        if not normalized_text or not normalized_location:
            return False
        if " " in normalized_location:
            return normalized_location in normalized_text
        return re.search(rf"\b{re.escape(normalized_location)}\b", normalized_text) is not None

    def _twitter_query(self, location: str, state: str, country: str, timeframe: str, topic: str) -> str:
        time_days = {"48h": 2, "2d": 2, "7d": 7, "30d": 30, "6m": 180}
        since = datetime.now(timezone.utc).date()
        since = since.fromordinal(since.toordinal() - time_days.get(timeframe, 7))
        parts = [f'"{location}"']
        if state:
            parts.append(f'"{state}"')
        elif country:
            parts.append(f'"{country}"')
        if topic:
            parts.append(topic.strip())
        parts.extend([f"since:{since.isoformat()}", "-is:retweet"])
        return " ".join(parts)

    def _normalize_twitter_event(self, tweet: Dict[str, Any], location: str, state: str, timeframe: str) -> Dict[str, Any] | None:
        text = self.clean_text(tweet.get("text") or tweet.get("fullText") or tweet.get("content", ""))
        if not text or not self._contains_location(text, location):
            return None

        created_at = tweet.get("createdAt") or tweet.get("created_at") or ""
        pub_date = self.format_pub_date(created_at)
        tweet_id = tweet.get("id") or tweet.get("tweetId")
        url = tweet.get("url") or tweet.get("twitterUrl")
        if not url and tweet_id:
            author = tweet.get("author", {}) or {}
            username = author.get("userName") or author.get("username") or "i"
            url = f"https://x.com/{username}/status/{tweet_id}"
        if not url:
            return None

        author = tweet.get("author", {}) or {}
        publisher = author.get("name") or author.get("userName") or "X / Twitter"
        return {
            "title": text[:180] + ("..." if len(text) > 180 else ""),
            "publisher": f"X / Twitter - {publisher}",
            "pub_date": pub_date,
            "snippet": text,
            "url": url,
            "source_name": f"X / Twitter ({pub_date})",
            "timeframe": timeframe,
            "location_match": location,
            "state_match": bool(state and self._contains_location(text, state))
        }

    async def fetch_twitter_events(
        self,
        location: str,
        timeframe: str = "7d",
        topic: str = "",
        state: str = "",
        country: str = ""
    ) -> List[Dict[str, Any]]:
        """Fetch latest location-matched posts from Twitterapi.io."""
        if not settings.TWITTER_API_KEY or not location.strip():
            return []

        params = {
            "query": self._twitter_query(location.strip(), state.strip(), country.strip(), timeframe, topic),
            "queryType": "Latest"
        }
        headers = {**self.headers, "X-API-Key": settings.TWITTER_API_KEY}
        try:
            async with httpx.AsyncClient(timeout=12.0, headers=headers, follow_redirects=True) as client:
                res = await client.get(settings.TWITTER_API_URL, params=params)
                if res.status_code != 200:
                    print(f"[Retrieval] Twitter API returned HTTP {res.status_code}")
                    return []
                payload = res.json()
                tweets = payload.get("tweets") or payload.get("data") or []
                events = []
                for tweet in tweets:
                    if isinstance(tweet, dict):
                        event = self._normalize_twitter_event(tweet, location, state, timeframe)
                        if event:
                            events.append(event)
                return events[:5]
        except Exception as e:
            print(f"[Retrieval] Twitter API fetch error for {location}: {e}")
            return []

    async def fetch_wikimedia_images(
        self,
        location: str,
        state: str = "",
        country: str = ""
    ) -> List[Dict[str, Any]]:
        """
        Fetch real, verified high-resolution public domain / Creative Commons images for a location.
        Uses Wikipedia PageImages API + Wikimedia REST API.
        Returns 2-5 clean objects: {"url": str, "thumbnail": str, "title": str, "source": str}.
        """
        if not location or not location.strip():
            return []

        images = []
        seen_urls = set()
        query = location.strip()
        encoded = quote_plus(query)

        # 1. Wikipedia Summary REST API for primary image
        summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}"
        try:
            async with httpx.AsyncClient(timeout=8.0, headers=self.headers, follow_redirects=True) as client:
                res = await client.get(summary_url)
                if res.status_code == 200:
                    data = res.json()
                    orig = data.get("originalimage", {})
                    thumb = data.get("thumbnail", {})
                    orig_url = orig.get("source") or thumb.get("source")
                    if orig_url and orig_url not in seen_urls:
                        seen_urls.add(orig_url)
                        images.append({
                            "url": orig_url,
                            "thumbnail": thumb.get("source") or orig_url,
                            "title": f"{data.get('title', location)} Overview",
                            "source": "Wikimedia Commons",
                            "description": data.get("description", f"Main view of {location}")
                        })
        except Exception as e:
            print(f"[Retrieval] Wikipedia summary image error for {query}: {e}")

        # 2. Query Wikipedia Search API for related pages and fetch their PageImages
        search_url = "https://en.wikipedia.org/w/api.php"
        search_params = {
            "action": "query",
            "generator": "search",
            "gsrsearch": f"{location} {state}".strip(),
            "gsrlimit": 5,
            "prop": "pageimages|pageterms",
            "pithumbsize": 800,
            "format": "json"
        }
        try:
            async with httpx.AsyncClient(timeout=8.0, headers=self.headers) as client:
                res = await client.get(search_url, params=search_params)
                if res.status_code == 200:
                    pages = res.json().get("query", {}).get("pages", {})
                    for page_id, page_data in pages.items():
                        thumbnail_info = page_data.get("thumbnail", {})
                        img_url = thumbnail_info.get("source")
                        title = page_data.get("title", location)
                        terms = page_data.get("terms", {}).get("description", [""])[0]
                        if img_url and img_url not in seen_urls:
                            seen_urls.add(img_url)
                            images.append({
                                "url": img_url,
                                "thumbnail": img_url,
                                "title": f"{title}",
                                "source": "Wikimedia Commons",
                                "description": terms or f"Verified image of {title}"
                            })
        except Exception as e:
            print(f"[Retrieval] Wikipedia search images error for {query}: {e}")

        return images[:5]

    async def fetch_recent_events(
        self,
        location: str,
        timeframe: str = "7d",
        topic: str = "",
        state: str = "",
        country: str = ""
    ) -> List[Dict[str, Any]]:
        """
        Fetch live recent news articles & events for a location/topic within a specified timeframe.
        Timeframe options: '7d' (Last 7 Days), '30d' (Last 30 Days), '6m' (Last 6 Months).
        Uses Google News RSS + Google Custom Search API as fallbacks.
        Returns clean items with: title, publisher, pub_date, snippet, url, source_name.
        """
        if not location or not location.strip():
            return []

        loc_str = f"{location} {state}".strip()
        query_topic = f"{loc_str} {topic}".strip() if topic else loc_str

        time_query_map = {
            "48h": "when:2d",
            "2d": "when:2d",
            "7d": "when:7d",
            "30d": "when:30d",
            "6m": "when:6m"
        }
        time_modifier = time_query_map.get(timeframe, "when:7d")

        rss_query = f"{query_topic} {time_modifier}"
        encoded_query = quote_plus(rss_query)
        rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"

        events = []

        twitter_events = await self.fetch_twitter_events(
            location=location,
            timeframe=timeframe,
            topic=topic,
            state=state,
            country=country
        )
        events.extend(twitter_events)

        try:
            async with httpx.AsyncClient(timeout=10.0, headers=self.headers, follow_redirects=True) as client:
                res = await client.get(rss_url)
                if res.status_code == 200:
                    root = ET.fromstring(res.text)
                    channel = root.find("channel")
                    if channel is not None:
                        items = channel.findall("item")
                        for item in items[:8]:
                            title_raw = item.findtext("title", "")
                            link = item.findtext("link", "")
                            pub_date_raw = item.findtext("pubDate", "")
                            description_raw = item.findtext("description", "")
                            source_elem = item.find("source")
                            publisher = source_elem.text if source_elem is not None and source_elem.text else ""

                            if not publisher and " - " in title_raw:
                                parts = title_raw.rsplit(" - ", 1)
                                title = parts[0].strip()
                                publisher = parts[1].strip()
                            else:
                                title = title_raw.strip()

                            if not publisher:
                                publisher = "News Source"

                            formatted_date = self.format_pub_date(pub_date_raw)
                            snippet = self.clean_text(description_raw)
                            if len(snippet) > 220:
                                snippet = snippet[:217] + "..."

                            combined_text = f"{title} {snippet}"
                            if title and link and self._contains_location(combined_text, location):
                                events.append({
                                    "title": title,
                                    "publisher": publisher,
                                    "pub_date": formatted_date,
                                    "snippet": snippet or title,
                                    "url": link,
                                    "source_name": f"{publisher} ({formatted_date})",
                                    "timeframe": timeframe
                                })
        except Exception as e:
            print(f"[Retrieval] Google News RSS fetch error for {rss_query}: {e}")

        # Fallback to Google Search API if configured and events < 3
        api_key = settings.GOOGLE_SEARCH_API_KEY or settings.GEMINI_API_KEY
        cx = settings.GOOGLE_SEARCH_CX
        if len(events) < 3 and api_key and cx:
            date_restrict_map = {"48h": "d2", "2d": "d2", "7d": "d7", "30d": "m1", "6m": "m6"}
            dr = date_restrict_map.get(timeframe, "d7")
            search_query = f"{query_topic} news"
            url = "https://www.googleapis.com/customsearch/v1"
            params = {
                "key": api_key,
                "cx": cx,
                "q": search_query,
                "dateRestrict": dr,
                "num": 3
            }
            try:
                async with httpx.AsyncClient(timeout=10.0, headers=self.headers) as client:
                    res = await client.get(url, params=params)
                    if res.status_code == 200:
                        items = res.json().get("items", [])
                        for item in items:
                            t = item.get("title", "")
                            snip = self.clean_text(item.get("snippet", ""))
                            lnk = item.get("link", "")
                            if t and lnk and not any(e["url"] == lnk for e in events):
                                pub = "Google Search"
                                if " - " in t:
                                    parts = t.rsplit(" - ", 1)
                                    t = parts[0].strip()
                                    pub = parts[1].strip()
                                events.append({
                                    "title": t,
                                    "publisher": pub,
                                    "pub_date": "Recent",
                                    "snippet": snip,
                                    "url": lnk,
                                    "source_name": f"{pub} (Recent)",
                                    "timeframe": timeframe
                                })
            except Exception as e:
                print(f"[Retrieval] Google Search news fallback error: {e}")

        unique_events = []
        seen_event_keys = set()
        for event in events:
            event_key = event.get("url") or event.get("title", "").casefold()
            if event_key and event_key not in seen_event_keys:
                seen_event_keys.add(event_key)
                unique_events.append(event)

        return unique_events[:5]

    async def fetch_google_search(self, query: str) -> List[Dict[str, Any]]:
        """
        Fetch live search results from Google Custom Search Engine API.
        Requires GOOGLE_SEARCH_API_KEY (or GEMINI_API_KEY) and GOOGLE_SEARCH_CX in backend/.env.
        """
        api_key = settings.GOOGLE_SEARCH_API_KEY or settings.GEMINI_API_KEY
        cx = settings.GOOGLE_SEARCH_CX

        if not api_key or not cx:
            return []

        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": api_key,
            "cx": cx,
            "q": query,
            "num": 3
        }

        results = []
        try:
            async with httpx.AsyncClient(timeout=10.0, headers=self.headers) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    items = res.json().get("items", [])
                    for item in items:
                        title = item.get("title")
                        snippet = self.clean_text(item.get("snippet", ""))
                        link = item.get("link")
                        if title and snippet:
                            results.append({
                                "title": title,
                                "snippet": snippet,
                                "url": link,
                                "source_name": f"Google Search - {title}"
                            })
        except Exception as e:
            print(f"[Retrieval] Google Search API error for {query}: {e}")
        return results

    async def fetch_nominatim_geo(self, location: str, state: str, country: str) -> Dict[str, Any]:
        """Fetch geographical details from OpenStreetMap Nominatim."""
        query = f"{location}, {state}, {country}".strip(", ")
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": query,
            "format": "json",
            "addressdetails": 1,
            "limit": 1
        }
        try:
            async with httpx.AsyncClient(timeout=10.0, headers=self.headers) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200 and len(res.json()) > 0:
                    data = res.json()[0]
                    address = data.get("address", {})
                    return {
                        "source": "OpenStreetMap Nominatim",
                        "url": f"https://www.openstreetmap.org/search?query={query}",
                        "lat": data.get("lat"),
                        "lon": data.get("lon"),
                        "display_name": data.get("display_name"),
                        "type": data.get("type"),
                        "place_type": address.get("type") or data.get("class"),
                        "county": address.get("county") or address.get("state_district"),
                        "state": address.get("state"),
                        "country": address.get("country"),
                        "postcode": address.get("postcode")
                    }
        except Exception as e:
            print(f"[Retrieval] Nominatim fetch error for {query}: {e}")
        return {}

    async def fetch_wikipedia_summary(self, title: str) -> Dict[str, Any]:
        """Fetch summary extract from Wikipedia API."""
        encoded_title = title.replace(" ", "_")
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded_title}"
        try:
            async with httpx.AsyncClient(timeout=10.0, headers=self.headers) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    extract = data.get("extract", "")
                    if extract:
                        return {
                            "title": data.get("title"),
                            "extract": self.clean_text(extract),
                            "url": data.get("content_urls", {}).get("desktop", {}).get("page", f"https://en.wikipedia.org/wiki/{encoded_title}"),
                            "description": data.get("description", "")
                        }
        except Exception as e:
            print(f"[Retrieval] Wikipedia fetch error for {title}: {e}")
        return {}

    async def search_wikipedia(self, query: str) -> List[Dict[str, Any]]:
        """Search Wikipedia for specific keywords related to location & category."""
        url = "https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "srlimit": 3
        }
        results = []
        try:
            async with httpx.AsyncClient(timeout=10.0, headers=self.headers) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    search_items = res.json().get("query", {}).get("search", [])
                    for item in search_items:
                        title = item.get("title")
                        snippet = self.clean_text(item.get("snippet", ""))
                        if title and snippet:
                            results.append({
                                "title": title,
                                "snippet": snippet,
                                "pageid": item.get("pageid"),
                                "url": f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
                            })
        except Exception as e:
            print(f"[Retrieval] Wikipedia search error for {query}: {e}")
        return results

    async def fetch_crime_and_drug_stats(self, location: str, state: str) -> Dict[str, Any]:
        """Query for verified crime rate, traffic accidents, drug seizures, missing persons, and assault statistics."""
        q1 = f"{location} {state} road traffic accidents statistics news"
        q2 = f"{location} {state} drug busts seizures substance abuse statistics"
        q3 = f"{location} {state} missing girls missing persons reports statistics"
        q4 = f"{location} {state} rape sexual assault crime rates police reports"

        r1, r2, r3, r4 = await asyncio.gather(
            self.search_wikipedia(q1),
            self.search_wikipedia(q2),
            self.search_wikipedia(q3),
            self.search_wikipedia(q4),
            return_exceptions=True
        )

        snippets = []
        sources = []

        metrics_map = [
            ("Accidents", r1),
            ("Drug Cases", r2),
            ("Missing Girls", r3),
            ("Assaults/Rapes", r4)
        ]

        for label, res in metrics_map:
            if isinstance(res, list) and res:
                for item in res:
                    snippets.append(f"{label} Stats ({item['title']}): {item['snippet']}")
                    sources.append({
                        "source_name": f"Wikipedia - {item['title']}",
                        "url": item['url'],
                        "status": "Available",
                        "category": "crime_and_safety"
                    })

        return {
            "summary": "\n".join(snippets) if snippets else "",
            "sources": sources
        }

    async def fetch_mla_and_tourism_details(self, location: str, state: str) -> Dict[str, Any]:
        """Fetch current MLA details, top tourist spots, hidden gems, and unique local charm."""
        q_mla = f"{location} {state} current MLA name and political experience"
        q_tourist = f"{location} {state} top tourist spots and hidden places to visit"
        q_culture = f"{location} {state} unique local culture and why it is famous"

        r_mla_g, r_mla_w, r_tourist_g, r_tourist_w, r_culture_g, r_culture_w = await asyncio.gather(
            self.fetch_google_search(q_mla),
            self.search_wikipedia(q_mla),
            self.fetch_google_search(q_tourist),
            self.search_wikipedia(q_tourist),
            self.fetch_google_search(q_culture),
            self.search_wikipedia(q_culture),
            return_exceptions=True
        )

        snippets = []
        sources = []

        mapping = [
            ("Local Leadership (MLA)", [r_mla_g, r_mla_w]),
            ("Tourism & Hidden Gems", [r_tourist_g, r_tourist_w]),
            ("Local Culture & Significance", [r_culture_g, r_culture_w]),
        ]

        for topic, results_pair in mapping:
            for res in results_pair:
                if isinstance(res, list) and res:
                    for item in res:
                        t = item.get("title") or item.get("source_name", "Source")
                        snip = item.get("snippet", "")
                        url = item.get("url")
                        if snip:
                            snippets.append(f"{topic} ({t}): {snip}")
                            if url:
                                sources.append({
                                    "source_name": f"{topic} - {t}",
                                    "url": url,
                                    "status": "Available",
                                    "category": "leadership_and_tourism"
                                })

        return {
            "summary": "\n".join(snippets) if snippets else "",
            "sources": sources
        }

    async def retrieve_location_data(
        self,
        location: str,
        state: str = "",
        country: str = "",
        categories: List[str] = None,
        include_recent_events: bool = False,
        recent_events_timeframe: str = "7d"
    ) -> Dict[str, Any]:
        """
        Main retrieval method fetching verified location information across requested categories.
        Combines Google Search API (when configured), Wikipedia API, OpenStreetMap Nominatim,
        and live Google News RSS for real-time recent events & local developments.
        """
        if not location or not location.strip():
            return {
                "success": False,
                "error": "Location name is required for retrieval.",
                "retrieved_at": datetime.now(timezone.utc).isoformat()
            }

        location = location.strip()
        state = state.strip() if state else ""
        country = country.strip() if country else ""
        categories = categories or ["history", "geography"]

        retrieved_timestamp = datetime.now(timezone.utc).isoformat()
        sources_used = []
        category_data = {}
        unavailable_categories = []

        # Define category fetch helper for parallel execution
        async def fetch_cat(category: str):
            cat_key = category.lower()
            if cat_key == "recent_events":
                return cat_key, category, None, []

            if cat_key == "trending":
                t_events = await self.fetch_recent_events(
                    location=location,
                    timeframe="48h",
                    state=state,
                    country=country
                )
                if t_events:
                    t_lines = ["Live Trending Highlights (Last 48 Hours):"]
                    cat_sources = []
                    for ev in t_events:
                        t_lines.append(f"• [{ev['publisher']} | {ev['pub_date']}] {ev['title']} - {ev['snippet']}")
                        cat_sources.append({
                            "source_name": f"Trending Citation - {ev['publisher']} ({ev['pub_date']})",
                            "url": ev['url'],
                            "retrieved_at": retrieved_timestamp,
                            "status": "Available",
                            "category": "trending",
                            "title": ev['title'],
                            "pub_date": ev['pub_date'],
                            "publisher": ev['publisher']
                        })
                    return cat_key, category, "\n".join(t_lines), cat_sources
                else:
                    return cat_key, category, f"No major breaking updates reported for {location} in the last 48 hours.", []

            cat_query = f"{location} {state} {cat_key}"
            cat_snippets = []
            cat_sources = []

            google_res, wiki_res = await asyncio.gather(
                self.fetch_google_search(cat_query),
                self.search_wikipedia(cat_query),
                return_exceptions=True
            )

            if isinstance(google_res, list) and google_res:
                for g_item in google_res:
                    cat_snippets.append(f"Google Search ({g_item['title']}): {g_item['snippet']}")
                    cat_sources.append({
                        "source_name": g_item['source_name'],
                        "url": g_item['url'],
                        "retrieved_at": retrieved_timestamp,
                        "status": "Available",
                        "category": cat_key
                    })

            if isinstance(wiki_res, list) and wiki_res:
                for item in wiki_res:
                    cat_snippets.append(f"Wikipedia ({item['title']}): {item['snippet']}")
                    cat_sources.append({
                        "source_name": f"Wikipedia - {item['title']}",
                        "url": item['url'],
                        "retrieved_at": retrieved_timestamp,
                        "status": "Available",
                        "category": cat_key
                    })

            if cat_snippets:
                unique = list(dict.fromkeys(cat_snippets))
                return cat_key, category, "\n".join(unique[:4]), cat_sources
            else:
                return cat_key, category, None, []

        # Run primary tasks concurrently
        recent_events_task = self.fetch_recent_events(location=location, timeframe=recent_events_timeframe, state=state, country=country) if include_recent_events else asyncio.sleep(0)
        geo_task = self.fetch_nominatim_geo(location, state, country)
        summary_task = self.fetch_wikipedia_summary(location)
        images_task = self.fetch_wikimedia_images(location=location, state=state, country=country)
        crime_drug_task = self.fetch_crime_and_drug_stats(location, state)
        mla_tourism_task = self.fetch_mla_and_tourism_details(location, state)
        cat_tasks = [fetch_cat(cat) for cat in categories]

        results = await asyncio.gather(
            recent_events_task,
            geo_task,
            summary_task,
            images_task,
            crime_drug_task,
            mla_tourism_task,
            asyncio.gather(*cat_tasks, return_exceptions=True),
            return_exceptions=True
        )

        recent_events = results[0] if include_recent_events and isinstance(results[0], list) else []
        geo_info = results[1] if isinstance(results[1], dict) else {}
        main_summary = results[2] if isinstance(results[2], dict) else {}
        images = results[3] if isinstance(results[3], list) else []
        crime_drug_info = results[4] if isinstance(results[4], dict) else {}
        mla_tourism_info = results[5] if isinstance(results[5], dict) else {}
        cat_results = results[6] if isinstance(results[6], tuple) or isinstance(results[6], list) else []

        if crime_drug_info and crime_drug_info.get("summary"):
            category_data["crime_and_drug_stats"] = crime_drug_info.get("summary")
            sources_used.extend(crime_drug_info.get("sources", []))

        if mla_tourism_info and mla_tourism_info.get("summary"):
            category_data["local_leadership_and_tourism"] = mla_tourism_info.get("summary")
            sources_used.extend(mla_tourism_info.get("sources", []))

        recent_events_summary = ""
        if include_recent_events and recent_events:
            summary_lines = [f"Recent Events & Local News ({recent_events_timeframe}):"]
            for idx, ev in enumerate(recent_events, 1):
                summary_lines.append(f"{idx}. [{ev['publisher']} | {ev['pub_date']}] {ev['title']} - {ev['snippet']} (URL: {ev['url']})")
                sources_used.append({
                    "source_name": f"News Citation - {ev['publisher']} ({ev['pub_date']})",
                    "url": ev['url'],
                    "retrieved_at": retrieved_timestamp,
                    "status": "Available",
                    "category": "recent_events",
                    "title": ev['title'],
                    "pub_date": ev['pub_date'],
                    "publisher": ev['publisher'],
                    "snippet": ev['snippet']
                })
            recent_events_summary = "\n".join(summary_lines)
            category_data["recent_events"] = recent_events_summary
        elif include_recent_events:
            recent_events_summary = f"No major recent updates reported for {location} in the selected timeframe ({recent_events_timeframe})."
            category_data["recent_events"] = recent_events_summary

        if geo_info and geo_info.get("source"):
            sources_used.append({
                "source_name": geo_info["source"],
                "url": geo_info["url"],
                "retrieved_at": retrieved_timestamp,
                "status": "Available",
                "details": f"Coordinates: {geo_info.get('lat')}, {geo_info.get('lon')} | Type: {geo_info.get('type')}"
            })

        if main_summary and main_summary.get("extract"):
            sources_used.append({
                "source_name": f"Wikipedia - {main_summary.get('title')}",
                "url": main_summary.get("url"),
                "retrieved_at": retrieved_timestamp,
                "status": "Available",
                "details": main_summary.get("description", "")
            })

        for cat_res in cat_results:
            if isinstance(cat_res, Exception) or not cat_res:
                continue
            cat_key, category_orig, content_text, cat_sources = cat_res
            if cat_key == "recent_events":
                continue
            if content_text:
                category_data[cat_key] = content_text
                sources_used.extend(cat_sources)
            else:
                if main_summary.get("extract") and cat_key in ["history", "geography", "overview", "infrastructure"]:
                    category_data[cat_key] = f"General Context ({main_summary.get('title')}): {main_summary.get('extract')}"
                else:
                    unavailable_categories.append(category_orig)
                    category_data[cat_key] = f"No public record found for '{category_orig}' category from authorized data sources for {location}."

        for img in images:
            sources_used.append({
                "source_name": f"Wikimedia Image - {img['title']}",
                "url": img['url'],
                "retrieved_at": retrieved_timestamp,
                "status": "Available",
                "category": "images",
                "details": img.get("description", "")
            })

        seen_urls = set()
        unique_sources = []
        for src in sources_used:
            url = src.get("url")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_sources.append(src)

        return {
            "success": True,
            "location_query": {
                "location": location,
                "state": state,
                "country": country
            },
            "retrieved_at": retrieved_timestamp,
            "sources": unique_sources,
            "categories": category_data,
            "unavailable_categories": unavailable_categories,
            "total_sources_consulted": len(unique_sources),
            "geo_baseline": geo_info if geo_info else None,
            "recent_events": recent_events,
            "recent_events_summary": recent_events_summary,
            "include_recent_events": include_recent_events,
            "recent_events_timeframe": recent_events_timeframe,
            "images": images
        }

retrieval_service = RetrievalService()
