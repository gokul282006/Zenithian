import asyncio
import sys
from services.retrieval_service import retrieval_service
from services.rag_service import rag_service
from services.output_service import output_service
from services.ai_service import ai_service

async def test_retrieval():
    print("--- TESTING LOCATION RETRIEVAL SERVICE ---")
    res = await retrieval_service.retrieve_location_data(
        location="Musiri",
        state="Tamil Nadu",
        country="India",
        categories=["history", "education", "geography"]
    )
    print(f"Retrieval Success: {res.get('success')}")
    print(f"Total Sources Consulted: {res.get('total_sources_consulted')}")
    print(f"Sources Found: {[s.get('source_name') for s in res.get('sources', [])]}")
    print(f"Unavailable Categories: {res.get('unavailable_categories')}")
    assert res.get("success") == True, "Retrieval failed"
    return res

async def test_rag():
    print("\n--- TESTING RAG SERVICE ---")
    retrieval_res = await test_retrieval()
    rag_res = rag_service.process_and_rank_context(
        retrieved_categories=retrieval_res.get("categories", {}),
        target_objective="Report",
        target_audience="Public"
    )
    print(f"RAG Status: {rag_res.get('rag_status')}")
    print(f"Total Chunks Indexed: {rag_res.get('total_chunks_indexed')}")
    print(f"Top Chunks Selected: {len(rag_res.get('retrieved_chunks'))}")
    assert rag_res.get("total_chunks_indexed") > 0, "RAG indexing failed"
    return rag_res

def test_pptx():
    print("\n--- TESTING POWERPOINT PPTX GENERATOR ---")
    pptx_bytes = output_service.generate_pptx(
        title="Musiri Regional Analysis",
        location="Musiri, Tamil Nadu, India",
        content="Musiri is a town in Tiruchirappalli district in the Indian state of Tamil Nadu.",
        categories=["history", "education", "geography"],
        audience="Public",
        objective="Report",
        sources=[{"source_name": "Wikipedia - Musiri", "url": "https://en.wikipedia.org/wiki/Musiri"}],
        unavailable_categories=[]
    )
    print(f"PPTX Generated Size: {len(pptx_bytes)} bytes")
    assert len(pptx_bytes) > 5000, "PPTX bytes generation failed"

async def main():
    try:
        retrieval_res = await test_retrieval()
        rag_res = await test_rag(retrieval_res)
        test_pptx()
        print("\nSUCCESS: ALL BACKEND UNIT TESTS PASSED PERFECTLY!")
    except Exception as e:
        print(f"\nBACKEND TEST ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
