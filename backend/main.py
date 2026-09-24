import io
import os
import glob
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field

from config import settings
from services.retrieval_service import retrieval_service
from services.rag_service import rag_service
from services.ai_service import ai_service
from services.output_service import output_service
from services.social_service import social_service
from services.presentation_service import presentation_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.3.0",
    description="Backend API for Zenithian AI Content Transformation Studio (Canva-Inspired Presentation Engine)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IN_MEMORY_HISTORY: List[Dict[str, Any]] = []
PRESENTATIONS_DB: Dict[str, Dict[str, Any]] = {}

# --- SCHEMAS ---

class LocationRetrieveRequest(BaseModel):
    location: str = Field(..., example="Musiri")
    state: Optional[str] = Field("", example="Tamil Nadu")
    country: Optional[str] = Field("India", example="India")
    categories: List[str] = Field(
        default=["history", "geography", "education", "healthcare", "infrastructure", "tourism", "economy", "environment"]
    )
    include_recent_events: Optional[bool] = False
    recent_events_timeframe: Optional[str] = "7d"

class ContentGenerateRequest(BaseModel):
    location: str
    state: Optional[str] = ""
    country: Optional[str] = "India"
    categories: List[str]
    audience: str = "Public"
    language: str = "English"
    tone: str = "Informative"
    detail_level: str = "Medium"
    objective: str = "Information Sharing"
    output_format: str = "Report"
    include_recent_events: Optional[bool] = False
    recent_events_timeframe: Optional[str] = "7d"
    retrieved_context: Optional[str] = ""
    sources: Optional[List[Dict[str, Any]]] = []
    unavailable_categories: Optional[List[str]] = []

class MultiGenerateRequest(BaseModel):
    location: str
    state: Optional[str] = ""
    country: Optional[str] = "India"
    categories: List[str]
    audience: str = "Public"
    language: str = "English"
    tone: str = "Informative"
    detail_level: str = "Medium"
    objective: str = "Information Sharing"
    platforms: List[str] = Field(default=["x", "linkedin", "facebook", "instagram", "powerpoint"])
    theme: Optional[str] = "zenithian_creative_flow"
    aspect_ratio: Optional[str] = "16:9"
    include_sources: Optional[bool] = True
    include_limitations: Optional[bool] = True
    include_recent_events: Optional[bool] = False
    recent_events_timeframe: Optional[str] = "7d"
    retrieved_context: Optional[str] = ""
    sources: Optional[List[Dict[str, Any]]] = []
    unavailable_categories: Optional[List[str]] = []

class StoryboardRequest(BaseModel):
    title: Optional[str] = ""
    location: str
    categories: List[str] = ["history", "geography"]
    audience: str = "Public"
    objective: str = "Information Sharing"
    theme: str = "zenithian_creative_flow"
    include_recent_events: Optional[bool] = False
    recent_events_timeframe: Optional[str] = "7d"

class PPTXExportRequest(BaseModel):
    title: str
    location: str
    content: str
    categories: List[str]
    audience: str
    objective: str
    sources: List[Dict[str, Any]] = []
    unavailable_categories: List[str] = []

class VerifyOutputRequest(BaseModel):
    status: str = Field(..., example="Approved")
    notes: Optional[str] = ""

# --- ENDPOINTS ---

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_configured": ai_service.is_configured(),
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_KEY),
        "data_sources": ["Wikipedia API", "OpenStreetMap Nominatim", "Wikidata", "Twitterapi.io", "Google News RSS"],
        "twitter_api_configured": bool(settings.TWITTER_API_KEY),
    "supported_platforms": ["x", "twitter", "linkedin", "facebook", "instagram", "powerpoint", "summary", "report", "email", "announcement"],
        "presentation_themes": [
            "zenithian_creative_flow",
            "zenithian_minimal_studio",
            "zenithian_future_grid",
            "zenithian_impact_story",
            "zenithian_executive"
        ]
    }

@app.get("/api/status")
def status_details():
    return {
        "status": "healthy",
        "services": {
            "retrieval_service": "Active (Twitterapi.io + Google News RSS + Wikipedia REST API + OpenStreetMap Nominatim)",
            "twitter_api": "Configured" if settings.TWITTER_API_KEY else "Not configured; RSS fallback active",
            "rag_service": "Active (TF-IDF Vector Chunker & Ranker)",
            "social_service": "Active (X/Twitter, LinkedIn, Facebook, Instagram Synthesizer)",
            "presentation_service": "Active (5 Themes: Creative Flow, Minimal Studio, Future Grid, Impact Story, Executive)",
            "database": "Supabase PostgreSQL" if settings.SUPABASE_URL else "Local Memory Storage"
        }
    }

@app.post("/api/location/retrieve")
async def retrieve_location(req: LocationRetrieveRequest):
    if not req.location or not req.location.strip():
        raise HTTPException(status_code=400, detail="Location name cannot be empty.")

    result = await retrieval_service.retrieve_location_data(
        location=req.location,
        state=req.state or "",
        country=req.country or "",
        categories=req.categories,
        include_recent_events=req.include_recent_events or False,
        recent_events_timeframe=req.recent_events_timeframe or "7d"
    )

    if not result.get("success"):
        raise HTTPException(status_code=422, detail=result.get("error", "Data retrieval failed."))

    return result

@app.post("/api/rag/process")
async def process_rag(retrieved_data: Dict[str, Any], objective: str = "Report", audience: str = "Public"):
    categories_dict = retrieved_data.get("categories", {})
    if not categories_dict:
        raise HTTPException(status_code=400, detail="No retrieved categories provided for RAG processing.")

    rag_result = rag_service.process_and_rank_context(
        retrieved_categories=categories_dict,
        target_objective=objective,
        target_audience=audience
    )
    return rag_result

@app.post("/api/content/generate")
async def generate_content(req: ContentGenerateRequest):
    context_str = req.retrieved_context
    sources = req.sources
    unavailable_cats = req.unavailable_categories

    if not context_str:
        retrieval_res = await retrieval_service.retrieve_location_data(
            location=req.location,
            state=req.state or "",
            country=req.country or "",
            categories=req.categories,
            include_recent_events=req.include_recent_events or False,
            recent_events_timeframe=req.recent_events_timeframe or "7d"
        )
        if retrieval_res.get("success"):
            rag_res = rag_service.process_and_rank_context(
                retrieved_categories=retrieval_res.get("categories", {}),
                target_objective=req.objective,
                target_audience=req.audience
            )
            context_str = rag_res.get("grounded_context")
            sources = retrieval_res.get("sources", [])
            unavailable_cats = retrieval_res.get("unavailable_categories", [])

    result = await ai_service.generate_content(
        location=req.location,
        state=req.state or "",
        country=req.country or "",
        categories=req.categories,
        audience=req.audience,
        language=req.language,
        tone=req.tone,
        detail_level=req.detail_level,
        objective=req.objective,
        output_format=req.output_format,
        retrieved_context=context_str or "No context retrieved.",
        sources=sources or [],
        unavailable_categories=unavailable_cats or []
    )
    return result

@app.post("/api/presentations/storyboard")
def get_storyboard(req: StoryboardRequest):
    storyboard = presentation_service.generate_storyboard(
        title=req.title or f"Location Intelligence: {req.location}",
        location=req.location,
        categories=req.categories,
        audience=req.audience,
        objective=req.objective,
        theme=req.theme,
        include_recent_events=req.include_recent_events or False,
        recent_events_timeframe=req.recent_events_timeframe or "7d"
    )
    return {"success": True, "storyboard": storyboard}

@app.post("/api/content/multi-generate")
async def multi_generate_content(req: MultiGenerateRequest):
    context_str = req.retrieved_context
    sources = req.sources or []
    unavailable_cats = req.unavailable_categories or []
    images = []
    chart_data = None

    if not context_str or req.include_recent_events or True:
        retrieval_res = await retrieval_service.retrieve_location_data(
            location=req.location,
            state=req.state or "",
            country=req.country or "",
            categories=req.categories,
            include_recent_events=req.include_recent_events or False,
            recent_events_timeframe=req.recent_events_timeframe or "7d"
        )
        if retrieval_res.get("success"):
            rag_res = rag_service.process_and_rank_context(
                retrieved_categories=retrieval_res.get("categories", {}),
                target_objective=req.objective,
                target_audience=req.audience
            )
            if not context_str:
                context_str = rag_res.get("grounded_context")
                sources = retrieval_res.get("sources", [])
                unavailable_cats = retrieval_res.get("unavailable_categories", [])
            recent_events = retrieval_res.get("recent_events", [])
            images = retrieval_res.get("images", [])

    chart_data = ai_service._extract_chart_data_from_context(context_str or "", req.location)

    platform_outputs = {}

    for platform in req.platforms:
        p_lower = platform.lower()
        if p_lower == "linkedin":
            res = await social_service.generate_linkedin(
                location=req.location, categories=req.categories, audience=req.audience,
                language=req.language, tone=req.tone, objective=req.objective,
                context=context_str, sources=sources, unavailable_categories=unavailable_cats
            )
            platform_outputs["linkedin"] = res

        elif p_lower == "facebook":
            res = await social_service.generate_facebook(
                location=req.location, categories=req.categories, audience=req.audience,
                language=req.language, tone=req.tone, objective=req.objective,
                context=context_str, sources=sources, unavailable_categories=unavailable_cats
            )
            platform_outputs["facebook"] = res

        elif p_lower == "instagram":
            res = await social_service.generate_instagram(
                location=req.location, categories=req.categories, audience=req.audience,
                language=req.language, tone=req.tone, objective=req.objective,
                context=context_str, sources=sources, unavailable_categories=unavailable_cats
            )
            platform_outputs["instagram"] = res

        elif p_lower in ["x", "twitter", "x_twitter"]:
            res = await social_service.generate_twitter(
                location=req.location, categories=req.categories, audience=req.audience,
                language=req.language, tone=req.tone, objective=req.objective,
                context=context_str, sources=sources, unavailable_categories=unavailable_cats
            )
            platform_outputs["x"] = res
            platform_outputs["twitter"] = res

        elif p_lower == "powerpoint" or p_lower == "presentation":
            pres = presentation_service.generate_presentation_file(
                title=f"Location Presentation: {req.location}",
                subtitle=f"Audience: {req.audience} | Objective: {req.objective}",
                location=req.location,
                content=context_str,
                categories=req.categories,
                audience=req.audience,
                objective=req.objective,
                sources=sources,
                unavailable_categories=unavailable_cats,
                theme=req.theme or "zenithian_creative_flow",
                aspect_ratio=req.aspect_ratio or "16:9",
                include_sources=req.include_sources if req.include_sources is not None else True,
                include_limitations=req.include_limitations if req.include_limitations is not None else True,
                recent_events=recent_events,
                include_recent_events=req.include_recent_events or False,
                recent_events_timeframe=req.recent_events_timeframe or "7d",
                images=images,
                chart_data=chart_data
            )
            PRESENTATIONS_DB[pres["presentation_id"]] = pres
            platform_outputs["powerpoint"] = pres

    return {
        "success": True,
        "location": req.location,
        "selected_platforms": req.platforms,
        "theme": req.theme,
        "sources": sources,
        "unavailable_categories": unavailable_cats,
        "images": images,
        "chart_data": chart_data,
        "outputs": platform_outputs
    }

@app.post("/api/social/linkedin/generate")
async def generate_linkedin(req: MultiGenerateRequest):
    req.platforms = ["linkedin"]
    res = await multi_generate_content(req)
    return res.get("outputs", {}).get("linkedin", {})

@app.post("/api/social/facebook/generate")
async def generate_facebook(req: MultiGenerateRequest):
    req.platforms = ["facebook"]
    res = await multi_generate_content(req)
    return res.get("outputs", {}).get("facebook", {})

@app.post("/api/social/instagram/generate")
async def generate_instagram(req: MultiGenerateRequest):
    req.platforms = ["instagram"]
    res = await multi_generate_content(req)
    return res.get("outputs", {}).get("instagram", {})

@app.post("/api/social/x/generate")
@app.post("/api/social/twitter/generate")
async def generate_x(req: MultiGenerateRequest):
    req.platforms = ["x"]
    res = await multi_generate_content(req)
    return res.get("outputs", {}).get("x", {})

@app.post("/api/presentations/generate")
async def generate_presentation(req: MultiGenerateRequest):
    req.platforms = ["powerpoint"]
    res = await multi_generate_content(req)
    return res.get("outputs", {}).get("powerpoint", {})

@app.get("/api/presentations/{presentation_id}/download")
def download_presentation(presentation_id: str):
    pres = PRESENTATIONS_DB.get(presentation_id)
    if not pres or not os.path.exists(pres["file_path"]):
        files = glob.glob(os.path.join(presentation_service.storage_dir, f"*{presentation_id[:8]}*.pptx"))
        if files:
            file_path = files[0]
            filename = os.path.basename(file_path)
        else:
            raise HTTPException(status_code=404, detail="Presentation file not found. Please regenerate.")
    else:
        file_path = pres["file_path"]
        filename = pres["file_name"]

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename=filename
    )

@app.post("/api/export/pptx")
async def export_pptx(req: PPTXExportRequest):
    try:
        pptx_bytes = output_service.generate_pptx(
            title=req.title,
            location=req.location,
            content=req.content,
            categories=req.categories,
            audience=req.audience,
            objective=req.objective,
            sources=req.sources,
            unavailable_categories=req.unavailable_categories
        )

        filename = f"Zenithian_{req.location.replace(' ', '_')}_{req.audience}.pptx"

        return StreamingResponse(
            io.BytesIO(pptx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PPTX export failed: {str(e)}")

@app.get("/api/history")
def get_history():
    return {"history": IN_MEMORY_HISTORY}

@app.post("/api/history")
def save_history(item: Dict[str, Any]):
    import uuid
    from datetime import datetime, timezone
    item["id"] = item.get("id") or str(uuid.uuid4())
    item["created_at"] = item.get("created_at") or datetime.now(timezone.utc).isoformat()
    item["verification_status"] = item.get("verification_status") or "Source Supported"
    IN_MEMORY_HISTORY.insert(0, item)
    return {"success": True, "item": item}

@app.delete("/api/history/{item_id}")
def delete_history(item_id: str):
    global IN_MEMORY_HISTORY
    IN_MEMORY_HISTORY = [item for item in IN_MEMORY_HISTORY if item["id"] != item_id]
    return {"success": True, "deleted_id": item_id}

@app.post("/api/outputs/{output_id}/verify")
def verify_output(output_id: str, req: VerifyOutputRequest):
    for item in IN_MEMORY_HISTORY:
        if item.get("id") == output_id:
            item["verification_status"] = req.status
            item["verification_notes"] = req.notes
            return {"success": True, "item": item}
    return {"success": True, "output_id": output_id, "status": req.status}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
