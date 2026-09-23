import asyncio
import os
import sys

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from services.retrieval_service import retrieval_service
from services.ai_service import ai_service
from services.presentation_service import presentation_service

async def run_test():
    print("=== Testing Crime & Safety Retrieval & PPT Generation ===")
    location = "Chennai"
    state = "Tamil Nadu"
    country = "India"
    categories = ["crime_and_safety", "recent_events"]

    print(f"1. Retrieving data for {location}...")
    retrieved_data = await retrieval_service.retrieve_location_data(
        location=location,
        state=state,
        country=country,
        categories=categories,
        include_recent_events=True,
        recent_events_timeframe="7d"
    )
    
    print(f"   Retrieved {len(retrieved_data.get('sources', []))} sources.")
    print(f"   Images found: {len(retrieved_data.get('images', []))}")

    print("2. Generating grounded AI content & extracting chart metrics...")
    cat_summary = "\n".join([f"{k}: {v}" for k, v in retrieved_data.get("categories", {}).items()])
    ai_res = await ai_service.generate_content(
        location=location,
        state=state,
        country=country,
        categories=categories,
        audience="Executive Leadership",
        language="English",
        tone="Professional",
        detail_level="Detailed",
        objective="Crime & Safety Analysis",
        output_format="Report",
        retrieved_context=cat_summary,
        sources=retrieved_data.get("sources", []),
        unavailable_categories=retrieved_data.get("unavailable_categories", [])
    )

    chart_data = ai_res.get("chart_data")
    print(f"   Extracted Chart Data: {chart_data}")
    assert chart_data is not None, "Chart data should not be None!"
    assert chart_data.get("labels") == ["Accidents", "Drug Cases", "Missing Girls", "Assaults/Rapes"], \
        f"Chart labels do not match required spec: {chart_data.get('labels')}"

    print("3. Generating PowerPoint deck...")
    ppt_res = presentation_service.generate_presentation_file(
        title="Chennai Crime & Safety Intelligence Briefing",
        subtitle="Verified Crime & Safety Metrics",
        location=location,
        content=ai_res.get("generated_content", ""),
        categories=categories,
        audience="Executive Leadership",
        objective="Crime & Safety Analysis",
        sources=retrieved_data.get("sources", []),
        images=retrieved_data.get("images", []),
        recent_events=retrieved_data.get("recent_events", []),
        include_recent_events=True,
        recent_events_timeframe="7d",
        chart_data=chart_data,
        theme="zenithian_creative_flow"
    )

    file_path = ppt_res.get("file_path")
    print(f"   PPT Deck successfully generated at: {file_path}")
    print(f"   File size: {os.path.getsize(file_path)} bytes")
    print("=== TEST PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(run_test())
