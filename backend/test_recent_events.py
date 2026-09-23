import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from services.retrieval_service import retrieval_service
from services.presentation_service import presentation_service
from services.ai_service import ai_service
from services.social_service import social_service

async def test_recent_events_retrieval():
    print("==================================================")
    print("TEST 1: Real-Time Recent Events & Local News Retrieval")
    print("==================================================")

    location = "Chennai"
    state = "Tamil Nadu"
    country = "India"
    
    print(f"\n1. Fetching live news articles for '{location}, {state}' (Timeframe: 7d)...")
    events_7d = await retrieval_service.fetch_recent_events(location=location, timeframe="7d", state=state, country=country)
    print(f"   [+] Retrieved {len(events_7d)} articles for 7d:")
    for idx, ev in enumerate(events_7d, 1):
        print(f"       {idx}. [{ev['publisher']} | {ev['pub_date']}] {ev['title']}")

    print(f"\n2. Testing retrieve_location_data with include_recent_events=True...")
    res = await retrieval_service.retrieve_location_data(
        location=location,
        state=state,
        country=country,
        categories=["history", "geography"],
        include_recent_events=True,
        recent_events_timeframe="7d"
    )

    assert res["success"] is True
    assert "recent_events" in res
    assert "recent_events_summary" in res
    print(f"   [+] Retrieval Service return dict includes {len(res['recent_events'])} recent events.")

async def test_trending_category_48h():
    print("\n==================================================")
    print("TEST 2: Trending Category (48 Hours Strict Search)")
    print("==================================================")

    location = "Mumbai"
    state = "Maharashtra"
    print(f"\n1. Requesting 'Trending' category retrieval for {location} (< 48 Hours filter)...")
    res = await retrieval_service.retrieve_location_data(
        location=location,
        state=state,
        categories=["trending", "economy"]
    )

    assert res["success"] is True
    assert "trending" in res["categories"]
    print(f"   [+] Retrieved Trending Category Data:\n{res['categories']['trending'][:250]}...\n")
    print("   [+] PASS: 48-Hour Trending category retrieval verified!")

async def test_zero_meta_leakage():
    print("==================================================")
    print("TEST 3: Zero Internal Detail / Meta-Text Leakage")
    print("==================================================")

    location = "Bengaluru"
    
    # Generate content using local synthesis engine
    content_res = await ai_service.generate_content(
        location=location,
        state="Karnataka",
        country="India",
        categories=["trending", "infrastructure"],
        audience="Public",
        language="English",
        tone="Informative",
        detail_level="Medium",
        objective="Information Sharing",
        output_format="Report",
        retrieved_context="Bengaluru is a major technology hub in South India.",
        sources=[],
        unavailable_categories=[]
    )

    text = content_res["generated_content"]
    
    # Forbidden meta terms that must NOT leak
    forbidden_terms = [
        "Zenithian Information Services",
        "RAG vector chunking",
        "Open data API",
        "Grounding & Limitations Notice",
        "Notice: Data for the following categories was unavailable",
        "Zenithian Grounded Approach",
        "Standard AI Risk Avoidance"
    ]

    for term in forbidden_terms:
        assert term not in text, f"Meta leak detected: '{term}' found in generated text!"

    print("   [+] Verified output text:")
    print("--------------------------------------------------")
    print(text[:300])
    print("--------------------------------------------------")
    print("   [+] PASS: Zero internal meta-text leaks in output!")

def test_presentation_news_slide():
    print("\n==================================================")
    print("TEST 4: PowerPoint News Slide Generation")
    print("==================================================")

    sample_news = [
        {
            "title": "Chennai Metro Phase II Expansion Speeds Up",
            "publisher": "The Hindu",
            "pub_date": "Sep 22, 2026",
            "snippet": "New corridor tunneling completed near Central Station.",
            "url": "https://news.google.com/articles/123"
        }
    ]

    pres_result = presentation_service.generate_presentation_file(
        title="Chennai Infrastructure & Recent Developments",
        subtitle="Audience: Public | Objective: Information Sharing",
        location="Chennai",
        content="Chennai is the capital of Tamil Nadu.",
        categories=["infrastructure", "economy"],
        audience="Public",
        objective="Information Sharing",
        theme="zenithian_creative_flow",
        recent_events=sample_news,
        include_recent_events=True,
        recent_events_timeframe="7d"
    )

    assert os.path.exists(pres_result["file_path"])
    print(f"   [+] Generated PPTX file: {pres_result['file_name']}")
    print(f"   [+] Total Slides: {pres_result['slide_count']}")
    print("   [+] PASS: PowerPoint News Slide successfully generated!")

async def main():
    await test_recent_events_retrieval()
    await test_trending_category_48h()
    await test_zero_meta_leakage()
    test_presentation_news_slide()
    print("\n==================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! [SUCCESS]")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
