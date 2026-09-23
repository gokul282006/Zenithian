import asyncio
import os
import sys
from services.retrieval_service import retrieval_service
from services.presentation_service import presentation_service

async def test_visual_presentation():
    print("--- TESTING CANVA-INSPIRED VISUAL PRESENTATION DESIGN ENGINE ---")

    # 1. Fetch location data
    retrieval_res = await retrieval_service.retrieve_location_data(
        location="Musiri", state="Tamil Nadu", country="India",
        categories=["history", "education", "geography"]
    )
    context = retrieval_res.get("categories", {}).get("history", "") + "\n" + retrieval_res.get("categories", {}).get("geography", "")
    sources = retrieval_res.get("sources", [])

    # 2. Test Storyboard Generation
    storyboard = presentation_service.generate_storyboard(
        title="Musiri Visual Intelligence", location="Musiri",
        categories=["history", "geography"], audience="Public", objective="Information Sharing"
    )
    print(f"Storyboard Generated: {len(storyboard)} slides")
    print(f"  Slide 1 Layout: {storyboard[0]['layout_name']}")
    print(f"  Slide 2 Layout: {storyboard[1]['layout_name']}")
    print(f"  Slide 6 Layout: {storyboard[5]['layout_name']}")
    assert len(storyboard) == 11, "Storyboard slide count mismatch"

    # 3. Test All 5 Canva-Inspired Visual Themes
    themes = [
        "zenithian_creative_flow",
        "zenithian_minimal_studio",
        "zenithian_future_grid",
        "zenithian_impact_story",
        "zenithian_executive"
    ]

    for t in themes:
        print(f"\nTesting Theme: {t}")
        pres = presentation_service.generate_presentation_file(
            title=f"Musiri Visual Presentation - Theme: {t}",
            subtitle="Testing Zenithian Creative Flow Visual Engine",
            location="Musiri",
            content=context,
            categories=["history", "education", "geography"],
            audience="Public",
            objective="Report",
            sources=sources,
            unavailable_categories=[],
            theme=t,
            aspect_ratio="16:9",
            include_sources=True,
            include_limitations=True
        )
        print(f"  Presentation ID: {pres.get('presentation_id')}")
        print(f"  Slide Count: {pres.get('slide_count')}")
        print(f"  File Path: {pres.get('file_path')}")
        print(f"  File Size: {pres.get('file_size')} bytes")
        assert os.path.exists(pres.get("file_path")), f"File missing for theme {t}"
        assert pres.get("file_size") > 30000, f"File size too small for theme {t}"

    print("\nSUCCESS: ALL 5 CANVA-INSPIRED VISUAL THEMES PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_visual_presentation())
