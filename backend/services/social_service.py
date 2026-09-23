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
                content = self._local_linkedin_synthesis(location, categories, audience, tone, context, sources, unavailable_categories)
        else:
            content = self._local_linkedin_synthesis(location, categories, audience, tone, context, sources, unavailable_categories)

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

    def _local_linkedin_synthesis(self, location, categories, audience, tone, context, sources, unavailable_categories):
        lines = [
            f"📍 Strategic Update: {location}\n",
            f"Key observations and highlights for **{location}**:\n",
            "💡 Highlights & Observations:",
            context if context else f"Baseline geographical and development details for {location}.",
            f"\n🎯 Target Audience: {audience} | Objective: {objective if 'objective' in locals() else 'Information Sharing'}\n",
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
        if self.gemini_key:
            system_prompt = (
                "You are a Social Media Content Creator writing an Instagram caption. "
                "Generate a concise, highly engaging caption with light emojis based strictly on the supplied context.\n\n"
                "STRICT RULES:\n"
                "1. Output ONLY the final Instagram caption.\n"
                "2. DO NOT include meta-commentary, introductory system lines, or technical notices.\n"
                "3. Use concise bullet points and bold key phrases."
            )
            user_prompt = f"LOCATION: {location}\nCONTEXT:\n{context}"
            try:
                content = self._call_gemini(system_prompt, user_prompt)
            except Exception:
                content = self._local_instagram_synthesis(location, context, sources, unavailable_categories)
        else:
            content = self._local_instagram_synthesis(location, context, sources, unavailable_categories)

        hashtags = [f"#{location.replace(' ', '')}", "#ExploreLocation", "#LocationHighlights", "#CommunityBriefing"]

        carousel_text = (
            f"Slide 1: {location} Overview\n"
            f"Slide 2: Key Grounded Facts\n"
            f"Slide 3: Source References"
        )

        return {
            "platform": "instagram",
            "title": f"Instagram Caption & Carousel: {location}",
            "content": content,
            "carousel_text": carousel_text,
            "hashtags": hashtags,
            "verification_status": "Source Supported" if sources else "Needs Review",
            "sources": sources,
            "unavailable_categories": unavailable_categories
        }

    def _local_instagram_synthesis(self, location, context, sources, unavailable_categories):
        lines = [
            f"📍 {location} | Key Highlights ✨\n",
            context[:500] if context else f"Baseline facts for {location}.",
            "\nSwipe left to read key insights! 👈"
        ]
        return "\n".join(lines)

social_service = SocialService()
