import asyncio
import os
import sys

# Ensure backend path is on sys.path
sys.path.append(os.path.dirname(__file__))

from services.retrieval_service import retrieval_service
from services.ai_service import ai_service
from services.presentation_service import presentation_service
from services.output_service import output_service

async def test_ppt_enhancements():
    print("=== TEST 1: Crime & Drug Statistics Retrieval ===")
    location = "Chicago"
    state = "Illinois"
    crime_drug = await retrieval_service.fetch_crime_and_drug_stats(location, state)
    print(f"Retrieved Crime/Drug Summary excerpt:\n{crime_drug.get('summary', '')[:300]}\n")
    print(f"Retrieved Sources Count: {len(crime_drug.get('sources', []))}")

    print("=== TEST 2: Image Fetching & Byte-Stream Insertion ===")
    images = await retrieval_service.fetch_wikimedia_images(location=location, state=state, country="USA")
    print(f"Retrieved {len(images)} Wikimedia photos for {location}:")
    for img in images:
        print(f"  - Title: {img.get('title')} | URL: {img.get('url')}")
    assert len(images) > 0, "Image retrieval failed!"
    print("[SUCCESS] Image retrieval passed.\n")

    print("=== TEST 3: Crime Rate & Drug Use AI Chart Extraction ===")
    sample_context = f"""
    {location} Safety & Health Statistics:
    Violent crime rate index in 2023 was 42.5 per 10,000 residents.
    Substance abuse and drug overdose incidents reported were 18.2 per 10,000.
    """
    chart_data = ai_service._extract_chart_data_from_context(sample_context, location)
    print("Extracted Chart JSON:")
    print(chart_data)
    assert chart_data is not None, "Chart data extraction failed!"
    assert "labels" in chart_data and "values" in chart_data, "Invalid chart_data structure!"
    print("[SUCCESS] Crime & Drug Use chart extraction passed.\n")

    print("=== TEST 4: PPTX Generation with Enforced Slide Layouts ===")
    recent_events = [
        {
            "publisher": "Chicago Tribune",
            "pub_date": "Sep 23, 2026",
            "title": "City Council Passes New Safety Initiative",
            "snippet": "Local authorities approve new community safety measures across downtown districts.",
            "url": "https://chicagotribune.com/news/1"
        }
    ]

    pres_res = presentation_service.generate_presentation_file(
        title=f"Location Intelligence: {location}",
        subtitle=f"Target Audience: Public | Objective: Report",
        location=location,
        content=sample_context,
        categories=["history", "geography", "safety"],
        audience="Public",
        objective="Report",
        sources=[{"source_name": "Chicago Data Portal", "url": "https://chicago.gov"}],
        unavailable_categories=[],
        theme="zenithian_creative_flow",
        aspect_ratio="16:9",
        include_sources=True,
        include_limitations=True,
        recent_events=recent_events,
        include_recent_events=True,
        recent_events_timeframe="7d",
        images=images,
        chart_data=chart_data
    )

    print(f"Generated Presentation File: {pres_res['file_name']}")
    print(f"Slide Count: {pres_res['slide_count']}")
    print(f"File Size: {pres_res['file_size']} bytes")
    assert os.path.exists(pres_res['file_path']), "Presentation file not found!"
    assert pres_res['file_size'] > 15000, "Presentation file size is suspiciously small!"
    print("[SUCCESS] PPTX presentation file generation with images, chart & enforced layouts passed.\n")

    print("=== ALL ENHANCEMENT TESTS PASSED CLEANLY! ===")

if __name__ == "__main__":
    asyncio.run(test_ppt_enhancements())
