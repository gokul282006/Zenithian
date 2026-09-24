import json
import httpx
from typing import Dict, Any, List
from config import settings

class SocialService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    def _call_gemini(self, system_prompt: str, user_prompt: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system_prompt}\n\nUSER REQUEST:\n{user_prompt}"}]
                }
            ],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2000}
        }
        with httpx.Client(timeout=45.0) as client:
            res = client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
            else:
                raise RuntimeError(f"Gemini API returned HTTP {res.status_code}: {res.text}")

    # --- X (TWITTER) GENERATOR ---
    async def generate_twitter(
        self,
        location: str,
        categories: List[str],
        audience: str,
        language: str,
        tone: str,
        objective: str,
        context: str,
        sources: List[Dict[str, Any]],
        unavailable_categories: List[str]
    ) -> Dict[str, Any]:
        """
        Generates an authentic X (Twitter) post and multi-tweet thread grounded in verified facts.
        Includes single-post punchy format (<= 280 characters) and a 3-part thread.
        """
        hashtags = [
            f"#{location.replace(' ', '')}",
            "#LocationIntel",
            "#VerifiedFacts",
            f"#{audience.replace(' ', '')}"
        ]

        if self.gemini_key:
            system_prompt = (
                "You are an elite Digital Communications & Social Media Strategist writing for X (formerly Twitter).\n"
                "Create a high-impact, professional X post and a concise 3-tweet thread based strictly on the provided context.\n\n"
                "STRICT RULES:\n"
                "1. Output ONLY the tweets formatted with thread markers like:\n"
                "1/3 [Opening Hook & Core Fact - under 250 chars]\n\n"
                "2/3 [Key Highlights & Insights - under 250 chars]\n\n"
                "3/3 [Conclusion / CTA / Sources & Hashtags - under 250 chars]\n"
                "2. NO introductory commentary, no meta-notes, no greetings.\n"
                "3. Ground strictly in facts. NO fabricated statistics or hallucinated claims.\n"
                "4. Use punchy, engaging language with 2-3 relevant hashtags at the end."
            )
            user_prompt = f"LOCATION: {location}\nCONTEXT:\n{context}\nAUDIENCE: {audience}\nTONE: {tone}\nOBJECTIVE: {objective}"
            try:
                raw_content = self._call_gemini(system_prompt, user_prompt)
                parsed_thread = self._parse_tweets_from_text(raw_content, location, hashtags)
            except Exception:
                parsed_thread = self._local_twitter_synthesis(location, categories, audience, tone, context, sources, unavailable_categories, hashtags)
        else:
            parsed_thread = self._local_twitter_synthesis(location, categories, audience, tone, context, sources, unavailable_categories, hashtags)

        single_tweet = parsed_thread["single_tweet"]
        thread_list = parsed_thread["thread"]
        full_content = parsed_thread["content"]

        return {
            "platform": "x",
            "title": f"X (Twitter) Intel & Thread: {location}",
            "single_tweet": single_tweet,
            "thread": thread_list,
            "thread_count": len(thread_list),
            "content": full_content,
            "character_count": len(single_tweet),
            "hashtags": hashtags,
            "verification_status": "Source Supported" if sources else "Needs Review",
            "sources": sources,
            "unavailable_categories": unavailable_categories
        }

    # Alias for Twitter / X
    generate_x = generate_twitter

    def _parse_tweets_from_text(self, text: str, location: str, hashtags: List[str]) -> Dict[str, Any]:
        """Parses generated text into thread chunks and single tweet."""
        import re
        chunks = re.split(r'(?:^|\n+)(?:\d+/\d+|\(\d+/\d+\)|Tweet \d+:?)\s*', text.strip())
        cleaned_tweets = [c.strip() for c in chunks if c.strip()]
        
        if not cleaned_tweets:
            cleaned_tweets = [text[:260]]

        # Ensure single tweet is punchy and under 280 chars
        single_tweet = cleaned_tweets[0]
        if len(single_tweet) > 280:
            single_tweet = single_tweet[:270] + "..."

        # Format full thread
        thread_formatted = []
        total = len(cleaned_tweets)
        for i, t in enumerate(cleaned_tweets):
            prefix = f"{i+1}/{total} "
            thread_formatted.append(f"{prefix}{t}")

        return {
            "single_tweet": single_tweet,
            "thread": cleaned_tweets,
            "content": "\n\n".join(thread_formatted)
        }

    def _local_twitter_synthesis(self, location, categories, audience, tone, context, sources, unavailable_categories, hashtags):
        clean_ctx = context.replace("\n", " ").strip() if context else f"Key geographical facts and community updates for {location}."
        sentence_splits = [s.strip() for s in clean_ctx.split(". ") if len(s.strip()) > 15]

        hook_part = sentence_splits[0] if len(sentence_splits) > 0 else f"Essential briefing on {location}"
        if len(hook_part) > 180:
            hook_part = hook_part[:175] + "..."

        insight_part = sentence_splits[1] if len(sentence_splits) > 1 else f"Verified geographic and infrastructural records for {location}."
        if len(insight_part) > 200:
            insight_part = insight_part[:195] + "..."

        tag_str = " ".join(hashtags[:3])

        t1 = f"📍 Spotlight: {location}\n{hook_part}."
        t2 = f"💡 Key Highlights:\n{insight_part}."
        t3 = f"📊 Verified through open records & public databases.\nTarget Audience: {audience}\n\n{tag_str}"

        # Single tweet summary
        single = f"📍 {location} Quick Update: {hook_part}.\n\n{tag_str}"
        if len(single) > 280:
            single = single[:275] + "..."

        thread = [t1, t2, t3]
        formatted = f"1/3 {t1}\n\n2/3 {t2}\n\n3/3 {t3}"

        return {
            "single_tweet": single,
            "thread": thread,
            "content": formatted
        }

    # --- LINKEDIN GENERATOR ---
    async def generate_linkedin(
        self,
        location: str,
        categories: List[str],
        audience: str,
        language: str,
        tone: str,
        objective: str,
        context: str,
        sources: List[Dict[str, Any]],
        unavailable_categories: List[str]
    ) -> Dict[str, Any]:
        if self.gemini_key:
            system_prompt = (
                "You are a top-tier LinkedIn Communications Executive. "
                "Write a professional, compelling, and structured LinkedIn post based strictly on the provided context.\n\n"
                "STRICT RULES:\n"
                "1. Output ONLY the post text. Write naturally like a real human industry expert.\n"
                "2. DO NOT include meta-commentary ('Based on the context...', 'Here is the post...').\n"
                "3. DO NOT mention internal system names ('Zenithian', 'RAG', 'retrieval engine', 'open data API', 'unavailable categories').\n"
                "4. Use short bullet points, clear headings, bold key terms, and 4-5 relevant hashtags at the end."
            )
            user_prompt = f"LOCATION: {location}\nCONTEXT:\n{context}\nAUDIENCE: {audience}\nTONE: {tone}\nOBJECTIVE: {objective}"
            try:
                content = self._call_gemini(system_prompt, user_prompt)
            except Exception:
                content = self._local_linkedin_synthesis(location, categories, audience, tone, context, sources, unavailable_categories, objective)
        else:
            content = self._local_linkedin_synthesis(location, categories, audience, tone, context, sources, unavailable_categories, objective)

        hashtags = [f"#{location.replace(' ', '')}", "#LocationInsights", "#PublicUpdates", f"#{audience.replace(' ', '')}"]

        return {
            "platform": "linkedin",
            "title": f"LinkedIn Professional Update: {location}",
            "content": content,
            "hashtags": hashtags,
            "verification_status": "Source Supported" if sources else "Needs Review",
            "sources": sources,
            "unavailable_categories": unavailable_categories
        }

    def _local_linkedin_synthesis(self, location, categories, audience, tone, context, sources, unavailable_categories, objective: str = "Information Sharing"):
        lines = [
            f"📍 Strategic Update: {location}\n",
            f"Key observations and highlights for **{location}**:\n",
            "💡 Highlights & Observations:",
            context if context else f"Baseline geographical and development details for {location}.",
            f"\n🎯 Target Audience: {audience} | Objective: {objective or 'Information Sharing'}\n",
            f"#LocationInsights #{location.replace(' ', '')} #PublicBriefing #StrategicUpdates"
        ]
        return "\n".join(lines)

    # --- FACEBOOK GENERATOR ---
    async def generate_facebook(
        self,
        location: str,
        categories: List[str],
        audience: str,
        language: str,
        tone: str,
        objective: str,
        context: str,
        sources: List[Dict[str, Any]],
        unavailable_categories: List[str]
    ) -> Dict[str, Any]:
        if self.gemini_key:
            system_prompt = (
                "You are a Public Communications Specialist writing for Facebook. "
                "Write a clear, engaging, human-readable Facebook post based strictly on the provided context.\n\n"
                "STRICT RULES:\n"
                "1. Output ONLY the post content. Write in an accessible, public-friendly tone.\n"
                "2. DO NOT include meta-commentary ('Based on context...', 'Here is your post...').\n"
                "3. DO NOT mention internal system terms or RAG/retrieval pipeline details.\n"
                "4. Use short bullet points and clear headings."
            )
            user_prompt = f"LOCATION: {location}\nCONTEXT:\n{context}\nAUDIENCE: {audience}\nTONE: {tone}"
            try:
                content = self._call_gemini(system_prompt, user_prompt)
            except Exception:
                content = self._local_facebook_synthesis(location, categories, audience, tone, context, sources, unavailable_categories)
        else:
            content = self._local_facebook_synthesis(location, categories, audience, tone, context, sources, unavailable_categories)

        hashtags = [f"#{location.replace(' ', '')}", "#PublicAwareness", "#CommunityUpdate", "#VerifiedInfo"]

        return {
            "platform": "facebook",
            "title": f"Facebook Public Briefing: {location}",
            "content": content,
            "hashtags": hashtags,
            "verification_status": "Source Supported" if sources else "Needs Review",
            "sources": sources,
            "unavailable_categories": unavailable_categories
        }

    def _local_facebook_synthesis(self, location, categories, audience, tone, context, sources, unavailable_categories):
        lines = [
            f"📢 Community Briefing: {location}\n",
            f"Key updates regarding **{location}**:\n",
            context if context else f"General details for {location}.",
            "\n👉 Share this update with your network!"
        ]
        return "\n".join(lines)

    # --- INSTAGRAM GENERATOR ---
    async def generate_instagram(
        self,
        location: str,
        categories: List[str],
        audience: str,
        language: str,
        tone: str,
        objective: str,
        context: str,
        sources: List[Dict[str, Any]],
        unavailable_categories: List[str]
    ) -> Dict[str, Any]:
        hashtags = [
            f"#{location.replace(' ', '')}",
            "#ExploreLocation",
            "#LocationHighlights",
            "#CommunityBriefing",
            "#IncredibleIndia" if "india" in location.lower() or "tamil" in context.lower() else "#TravelAndHeritage",
            "#LocalInsights"
        ]

        if self.gemini_key:
            system_prompt = (
                "You are an Instagram Social Media Creator writing an engaging Instagram caption and carousel slide outline.\n"
                "Generate a concise, highly engaging caption with light emojis based strictly on the supplied context.\n\n"
                "STRICT RULES:\n"
                "1. Output ONLY the final Instagram caption.\n"
                "2. DO NOT include meta-commentary, introductory system lines, or technical notices.\n"
                "3. Use concise bullet points, bold key phrases, and add a call to action (e.g. 'Swipe left to see key insights 👈')."
            )
            user_prompt = f"LOCATION: {location}\nCONTEXT:\n{context}"
            try:
                content = self._call_gemini(system_prompt, user_prompt)
            except Exception:
                content = self._local_instagram_synthesis(location, context, sources, unavailable_categories)
        else:
            content = self._local_instagram_synthesis(location, context, sources, unavailable_categories)

        # Structured Carousel Slides for visual UI rendering
        first_p = context.split("\n")[0] if context else f"{location} overview"
        if len(first_p) > 200:
            first_p = first_p[:195] + "..."

        carousel_slides = [
            {
                "slide_number": 1,
                "title": f"📍 Discover {location}",
                "tagline": "Geographical Overview & Baseline Context",
                "body": f"Welcome to {location}. Explore verified highlights and key community records in this carousel."
            },
            {
                "slide_number": 2,
                "title": "💡 Grounded Facts & Culture",
                "tagline": "Verified Regional Data",
                "body": first_p
            },
            {
                "slide_number": 3,
                "title": "🔍 Source Integrity & Wrap-up",
                "tagline": "Open Data Audit Trail",
                "body": f"Data cross-referenced with public repositories including Wikipedia and OpenStreetMap Nominatim. Total verified sources: {len(sources)}."
            }
        ]

        carousel_text = (
            f"Slide 1: 📍 Discover {location} – Overview & Charm\n"
            f"Slide 2: 💡 Grounded Insights & Regional Highlights\n"
            f"Slide 3: 🔍 Source References & Open Data Audit Trail"
        )

        visual_prompt = f"High-resolution aerial photograph or cultural landmark view of {location}, warm natural daylight, crisp details."

        return {
            "platform": "instagram",
            "title": f"Instagram Caption & Carousel: {location}",
            "content": content,
            "carousel_text": carousel_text,
            "carousel_slides": carousel_slides,
            "visual_prompt": visual_prompt,
            "hashtags": hashtags,
            "verification_status": "Source Supported" if sources else "Needs Review",
            "sources": sources,
            "unavailable_categories": unavailable_categories
        }

    def _local_instagram_synthesis(self, location, context, sources, unavailable_categories):
        lines = [
            f"📍 {location} | Key Highlights ✨\n",
            context[:500] if context else f"Baseline facts for {location}.",
            "\n👉 Swipe left to read verified insights! 👈\n",
            "Save this post & share with your community! 📌"
        ]
        return "\n".join(lines)

social_service = SocialService()
