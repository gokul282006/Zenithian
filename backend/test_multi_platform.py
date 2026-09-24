import asyncio
import os
import sys
from services.retrieval_service import retrieval_service
from services.social_service import social_service
from services.presentation_service import presentation_service

async def test_multi_platform():
    print("--- TESTING MULTI-PLATFORM CONTENT GENERATION ---")
    
    # 1. Retrieve real open data for Musiri
    retrieval_res = await retrieval_service.retrieve_location_data(
        location="Musiri",
        state="Tamil Nadu",
        country="India",
        categories=["history", "education", "geography"]
    )
    print(f"Location Retrieval Success: {retrieval_res.get('success')}")
    sources = retrieval_res.get("sources", [])
    context = retrieval_res.get("categories", {}).get("history", "") + "\n" + retrieval_res.get("categories", {}).get("geography", "")

    # 2. LinkedIn Generation
    linkedin_res = await social_service.generate_linkedin(
        location="Musiri", categories=["history", "geography"], audience="Public",
        language="English", tone="Informative", objective="Information Sharing",
        context=context, sources=sources, unavailable_categories=[]
    )
    print(f"LinkedIn Post Title: {linkedin_res.get('title')}")
    print(f"LinkedIn Hashtags: {linkedin_res.get('hashtags')}")
    assert linkedin_res.get("platform") == "linkedin", "LinkedIn platform mismatch"

    # 3. Facebook Generation
    fb_res = await social_service.generate_facebook(
        location="Musiri", categories=["history"], audience="Public",
        language="English", tone="Informative", objective="Information Sharing",
        context=context, sources=sources, unavailable_categories=[]
    )
    print(f"Facebook Post Title: {fb_res.get('title')}")
    assert fb_res.get("platform") == "facebook", "Facebook platform mismatch"

    # 4. Instagram Generation
    insta_res = await social_service.generate_instagram(
        location="Musiri", categories=["geography"], audience="Public",
        language="English", tone="Informative", objective="Information Sharing",
        context=context, sources=sources, unavailable_categories=[]
    )
    print(f"Instagram Post Title: {insta_res.get('title')}")
    assert insta_res.get("platform") == "instagram", "Instagram platform mismatch"
    assert "carousel_slides" in insta_res, "Instagram carousel_slides missing"

    # 4b. X (Twitter) Generation
    twitter_res = await social_service.generate_twitter(
        location="Musiri", categories=["history", "geography"], audience="Public",
        language="English", tone="Informative", objective="Information Sharing",
        context=context, sources=sources, unavailable_categories=[]
    )
    print(f"X Post Title: {twitter_res.get('title')}")
    assert twitter_res.get("platform") == "x", "X platform mismatch"
    assert "single_tweet" in twitter_res, "X single_tweet missing"
    assert len(twitter_res.get("thread", [])) >= 2, "X thread count should be at least 2"

    # 5. PowerPoint Presentation 10-Slide Generation
    pres_res = presentation_service.generate_presentation_file(
        title="Location Presentation: Musiri",
        subtitle="Target Audience: Public",
        location="Musiri",
        content=context,
        categories=["history", "geography"],
        audience="Public",
        objective="Report",
        sources=sources,
        unavailable_categories=[]
    )
    print(f"PowerPoint Presentation ID: {pres_res.get('presentation_id')}")
    print(f"PowerPoint Slide Count: {pres_res.get('slide_count')}")
    print(f"PowerPoint File Path: {pres_res.get('file_path')}")
    print(f"PowerPoint File Size: {pres_res.get('file_size')} bytes")
    assert os.path.exists(pres_res.get("file_path")), "Presentation file missing on disk"
    assert pres_res.get("file_size") > 10000, "Presentation file size too small"

    print("\nSUCCESS: ALL MULTI-PLATFORM TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_multi_platform())
