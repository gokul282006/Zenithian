import pytest
import asyncio
from services.social_service import social_service
from services.ai_service import ai_service

@pytest.mark.asyncio
async def test_x_twitter_generation():
    """Verify X (Twitter) post, thread, character count, and hashtag generation."""
    sample_context = (
        "Musiri is a historical town in Tiruchirappalli district, Tamil Nadu, India. "
        "It is situated on the northern bank of the Kaveri River and is known for its agriculture, "
        "temples, and educational institutions."
    )
    res = await social_service.generate_twitter(
        location="Musiri",
        categories=["history", "geography"],
        audience="Public",
        language="English",
        tone="Informative",
        objective="Information Sharing",
        context=sample_context,
        sources=[{"source_name": "Wikipedia - Musiri", "url": "https://en.wikipedia.org/wiki/Musiri"}],
        unavailable_categories=[]
    )

    assert res["platform"] == "x"
    assert "single_tweet" in res
    assert len(res["single_tweet"]) <= 280, f"Tweet length {len(res['single_tweet'])} exceeds 280 chars"
    assert len(res["thread"]) >= 2
    assert "#Musiri" in res["hashtags"]
    assert res["verification_status"] == "Source Supported"

@pytest.mark.asyncio
async def test_instagram_carousel_generation():
    """Verify Instagram caption, structured 3-slide carousel, and hashtags."""
    sample_context = "Musiri features rich Kaveri riverbanks, agriculture, and educational institutions."
    res = await social_service.generate_instagram(
        location="Musiri",
        categories=["geography"],
        audience="Public",
        language="English",
        tone="Informative",
        objective="Information Sharing",
        context=sample_context,
        sources=[{"source_name": "OpenStreetMap", "url": "https://nominatim.openstreetmap.org"}],
        unavailable_categories=[]
    )

    assert res["platform"] == "instagram"
    assert "content" in res
    assert "carousel_slides" in res
    assert len(res["carousel_slides"]) >= 3
    assert res["carousel_slides"][0]["slide_number"] == 1
    assert "hashtags" in res
    assert any("musiri" in tag.lower() for tag in res["hashtags"])

@pytest.mark.asyncio
async def test_ai_service_social_formats():
    """Verify that AIService correctly synthesizes social formats deterministically."""
    res_x = await ai_service.generate_content(
        location="Musiri",
        state="Tamil Nadu",
        country="India",
        categories=["history"],
        audience="Public",
        language="English",
        tone="Informative",
        detail_level="Medium",
        objective="Information Sharing",
        output_format="X (Twitter) Post & Thread",
        retrieved_context="Musiri is a town in Tiruchirappalli district, Tamil Nadu, situated along the Kaveri river.",
        sources=[{"source_name": "Wikipedia", "url": "https://en.wikipedia.org"}],
        unavailable_categories=[]
    )

    assert res_x["success"] is True
    assert "1/3" in res_x["generated_content"] or "#Musiri" in res_x["generated_content"]

    res_insta = await ai_service.generate_content(
        location="Musiri",
        state="Tamil Nadu",
        country="India",
        categories=["history"],
        audience="Public",
        language="English",
        tone="Informative",
        detail_level="Medium",
        objective="Information Sharing",
        output_format="Instagram Post & Carousel",
        retrieved_context="Musiri is a town in Tiruchirappalli district, Tamil Nadu, situated along the Kaveri river.",
        sources=[{"source_name": "Wikipedia", "url": "https://en.wikipedia.org"}],
        unavailable_categories=[]
    )

    assert res_insta["success"] is True
    assert "INSTAGRAM CAPTION" in res_insta["generated_content"] or "Slide" in res_insta["generated_content"]
