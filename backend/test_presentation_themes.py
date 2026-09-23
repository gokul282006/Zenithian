import asyncio
import os
import sys
from services.retrieval_service import retrieval_service
from services.presentation_service import presentation_service

async def test_themes():
    print("--- TESTING POWERPOINT PRESENTATION THEMES & LAYOUT ENGINE ---")

    # 1. Fetch location data
    retrieval_res = await retrieval_service.retrieve_location_data(
        location="Musiri", state="Tamil Nadu", country="India",
        categories=["history", "education", "geography"]
    )
    context = retrieval_res.get("categories", {}).get("history", "") + "\n" + retrieval_res.get("categories", {}).get("geography", "")
    sources = retrieval_res.get("sources", [])

    themes = ["zenithian_quantum_flow", "zenithian_executive", "zenithian_impact"]

    for t in themes:
        print(f"\nTesting Theme: {t}")
        pres = presentation_service.generate_presentation_file(
            title=f"Musiri Analysis - Theme: {t}",
            subtitle="Testing Zenithian Advanced Presentation Engine",
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

    print("\nSUCCESS: ALL PRESENTATION THEME TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_themes())
