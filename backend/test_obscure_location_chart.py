import asyncio
import os
import sys

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from services.retrieval_service import retrieval_service
from services.ai_service import ai_service
from services.presentation_service import presentation_service

async def run_test():
    print("=== Testing Zero-Hallucination Fallback for Obscure Location ===")
    
    # Test 1: Obscure location query where statistics are missing
    obscure_loc = "Tholasampatti"
    print(f"\n1. Retrieving context for obscure location: {obscure_loc}...")
    retrieved_data = await retrieval_service.retrieve_location_data(
        location=obscure_loc,
        state="Tamil Nadu",
        country="India",
        categories=["crime_and_safety"],
        include_recent_events=False
    )
    
    cat_summary = "\n".join([f"{k}: {v}" for k, v in retrieved_data.get("categories", {}).items()])
    print("2. Extracting chart data from retrieved context...")
    chart_data = ai_service._extract_chart_data_from_context(cat_summary, obscure_loc)
    
    print(f"   Chart Available: {chart_data.get('chart_available')}")
    print(f"   Reason: {chart_data.get('reason')}")
    print(f"   Labels: {chart_data.get('labels')}")
    print(f"   Values: {chart_data.get('values')}")

    assert chart_data.get("chart_available") is False, "chart_available MUST be False when explicit stats are missing!"
    assert len(chart_data.get("labels")) == 0, "labels MUST be empty when chart_available is False!"
    assert len(chart_data.get("values")) == 0, "values MUST be empty when chart_available is False!"
    assert chart_data.get("reason") is not None, "A clear reason message MUST be provided!"

    print("3. Generating PPTX deck for obscure location (verifying zero-crash & disclosure box rendering)...")
    ppt_res = presentation_service.generate_presentation_file(
        title=f"Intelligence Briefing - {obscure_loc}",
        subtitle="Data Availability Status",
        location=obscure_loc,
        content=f"Location profile for {obscure_loc}.",
        categories=["crime_and_safety"],
        audience="Executive Leadership",
        objective="Safety Evaluation",
        sources=retrieved_data.get("sources", []),
        images=[],
        chart_data=chart_data,
        theme="zenithian_creative_flow"
    )

    file_path = ppt_res.get("file_path")
    print(f"   PPT Deck successfully generated at: {file_path}")
    print(f"   File size: {os.path.getsize(file_path)} bytes")

    # Test 2: Location WITH numerical stats in context
    print("\n4. Testing location WITH explicit statistical numbers in context...")
    ctx_with_stats = (
        "Chennai Crime Statistics Report 2024: "
        "Road Accidents: 1420 recorded cases. "
        "Drug Cases: 560 seizure operations. "
        "Missing Persons: 120 reports filed. "
        "Assault Cases: 85 cases investigated."
    )
    chart_data_real = ai_service._extract_chart_data_from_context(ctx_with_stats, "Chennai")
    print(f"   Chart Available: {chart_data_real.get('chart_available')}")
    print(f"   Title: {chart_data_real.get('title')}")
    print(f"   Labels: {chart_data_real.get('labels')}")
    print(f"   Values: {chart_data_real.get('values')}")

    assert chart_data_real.get("chart_available") is True, "chart_available MUST be True when real stats exist!"
    assert len(chart_data_real.get("labels")) > 0, "labels MUST be populated when chart_available is True!"

    print("\n=== ALL ANTI-HALLUCINATION TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(run_test())
