import asyncio
import os
import sys

# Ensure backend path is on import path
sys.path.append(os.path.dirname(__file__))

from services.retrieval_service import retrieval_service
from services.ai_service import ai_service
from services.presentation_service import presentation_service

async def test_visual_elements():
    print("=== TEST 1: Wikimedia Image Retrieval ===")
    location = "Musiri"
    images = await retrieval_service.fetch_wikimedia_images(location=location, state="Tamil Nadu", country="India")
    print(f"Retrieved {len(images)} images for {location}:")
    for img in images:
        print(f"  - Title: {img['title']}")
        print(f"    URL: {img['url']}")
        print(f"    Source: {img['source']}")

    assert len(images) > 0, "Image retrieval returned 0 images!"
    print("[SUCCESS] Image retrieval passed.\n")

    print("=== TEST 2: Chart Data Extraction ===")
    sample_context = """
    Musiri Population Census Statistics:
    In 2001, the population was 27,941.
    In 2011, the population increased to 30,717.
    In 2021, estimated count reached 35,400.
    """
    chart_data = ai_service._extract_chart_data_from_context(sample_context, location)
    print("Extracted Chart Data JSON:")
    print(chart_data)

    assert chart_data is not None, "Chart data extraction failed!"
    assert "labels" in chart_data and "values" in chart_data, "Invalid chart_data structure!"
    print("[SUCCESS] Chart data extraction passed.\n")

    print("=== TEST 3: Native PPTX Chart & Image Slide Generation ===")
    pres_res = presentation_service.generate_presentation_file(
        title="Musiri Strategic Briefing",
        subtitle="Audience: Public | Objective: Information Sharing",
        location="Musiri",
        content=sample_context,
        categories=["history", "geography", "demographics"],
        audience="Public",
        objective="Information Sharing",
        sources=[{"source_name": "Wikimedia Commons", "url": "https://commons.wikimedia.org"}],
        unavailable_categories=[],
        theme="zenithian_creative_flow",
        aspect_ratio="16:9",
        include_sources=True,
        include_limitations=True,
        images=images,
        chart_data=chart_data
    )
    print(f"Generated PPTX Presentation File: {pres_res['file_name']}")
    print(f"Slide Count: {pres_res['slide_count']}")
    print(f"File Path: {pres_res['file_path']}")
    print(f"File Size: {pres_res['file_size']} bytes")

    assert os.path.exists(pres_res['file_path']), "Presentation file was not created!"
    assert pres_res['file_size'] > 10000, "Presentation file is unexpectedly small!"
    print("[SUCCESS] PowerPoint presentation generation with images & native chart passed.\n")

    print("=== ALL VISUAL MEDIA & CHART TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    asyncio.run(test_visual_elements())
