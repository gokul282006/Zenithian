import asyncio
import os
import sys

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from services.retrieval_service import retrieval_service
from services.ai_service import ai_service
from services.presentation_service import presentation_service

async def run_test():
    print("=== Testing Local Leadership (MLA) & Tourism Pipeline ===")
    location = "Velachery"
    state = "Tamil Nadu"
    country = "India"
    categories = ["overview", "tourism", "governance"]

    print(f"\n1. Retrieving real-time data for {location} ({state})...")
    retrieved_data = await retrieval_service.retrieve_location_data(
        location=location,
        state=state,
        country=country,
        categories=categories,
        include_recent_events=True
    )
    
    print(f"   Total Sources Retrieved: {len(retrieved_data.get('sources', []))}")
    print(f"   Categories Retrieved: {list(retrieved_data.get('categories', {}).keys())}")

    print("\n2. Synthesizing AI content and extracting structured MLA & Tourism JSON...")
    cat_summary = "\n".join([f"{k}: {v}" for k, v in retrieved_data.get("categories", {}).items()])
    ai_res = await ai_service.generate_content(
        location=location,
        state=state,
        country=country,
        categories=categories,
        audience="Public Communication",
        language="English",
        tone="Informative",
        detail_level="Detailed",
        objective="Constituency Briefing",
        output_format="Report",
        retrieved_context=cat_summary,
        sources=retrieved_data.get("sources", []),
        unavailable_categories=retrieved_data.get("unavailable_categories", [])
    )

    leadership = ai_res.get("local_leadership", {})
    tourism = ai_res.get("tourism_and_culture", {})

    print("\n=== EXTRACTED LOCAL LEADERSHIP (MLA) ===")
    print(f"   MLA Name: {leadership.get('mla_name')}")
    print(f"   Experience Details: {leadership.get('experience_details')}")

    print("\n=== EXTRACTED TOURISM & HIDDEN GEMS ===")
    print(f"   Popular Spots: {tourism.get('popular_spots')}")
    print(f"   Hidden Gems: {tourism.get('hidden_gems')}")
    print(f"   Why Visit Narrative: {tourism.get('why_visit')}")

    assert leadership.get("mla_name") is not None, "MLA name should not be None"
    assert tourism.get("popular_spots") is not None, "Popular spots should not be None"

    print("\n3. Generating PowerPoint Presentation with SLIDE A (MLA) & SLIDE B (Tourism)...")
    ppt_res = presentation_service.generate_presentation_file(
        title=f"Location Intelligence: {location}",
        subtitle="Constituency & Tourism Briefing",
        location=location,
        content=ai_res.get("generated_content", ""),
        categories=categories,
        audience="Public Communication",
        objective="Constituency Briefing",
        sources=retrieved_data.get("sources", []),
        images=retrieved_data.get("images", []),
        chart_data=ai_res.get("chart_data"),
        local_leadership=leadership,
        tourism_and_culture=tourism,
        theme="zenithian_creative_flow"
    )

    file_path = ppt_res.get("file_path")
    print(f"   PowerPoint presentation successfully saved at: {file_path}")
    print(f"   File size: {os.path.getsize(file_path)} bytes")

    print("\n=== TEST PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(run_test())
