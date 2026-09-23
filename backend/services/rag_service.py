import re
import math
from collections import Counter
from typing import List, Dict, Any

class RAGService:
    def __init__(self):
        self.chunk_size = 300  # Words per chunk
        self.chunk_overlap = 50

    def clean_text(self, text: str) -> str:
        if not text:
            return ""
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def chunk_text(self, text: str, source_id: str = "general") -> List[Dict[str, Any]]:
        """Split text into overlapping semantic chunks with source attribution."""
        cleaned = self.clean_text(text)
        if not cleaned:
            return []

        words = cleaned.split(" ")
        chunks = []
        step = max(1, self.chunk_size - self.chunk_overlap)

        for i in range(0, len(words), step):
            chunk_words = words[i : i + self.chunk_size]
            chunk_str = " ".join(chunk_words)
            if len(chunk_str.strip()) > 20:
                chunks.append({
                    "chunk_id": f"{source_id}_chunk_{len(chunks)+1}",
                    "content": chunk_str,
                    "word_count": len(chunk_words),
                    "source": source_id
                })
        return chunks

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b\w+\b', text.lower())

    def _compute_tf_idf_similarity(self, query: str, document: str) -> float:
        """Lightweight BM25 / TF-IDF vector similarity for fast context ranking."""
        query_words = set(self._tokenize(query))
        doc_words = self._tokenize(document)
        if not query_words or not doc_words:
            return 0.0

        doc_counter = Counter(doc_words)
        doc_len = len(doc_words)

        score = 0.0
        for word in query_words:
            if word in doc_counter:
                tf = doc_counter[word] / doc_len
                # Simple logarithmic IDF weighting
                score += (1 + math.log(tf))

        return round(score, 4)

    def process_and_rank_context(
        self,
        retrieved_categories: Dict[str, str],
        target_objective: str,
        target_audience: str,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Processes retrieved category text, creates chunk index, ranks chunks against objective & audience query.
        """
        all_chunks = []
        for cat, content in retrieved_categories.items():
            if content and not content.startswith("No public record found"):
                cat_chunks = self.chunk_text(content, source_id=cat)
                all_chunks.extend(cat_chunks)

        if not all_chunks:
            return {
                "rag_status": "No valid text content available for chunking.",
                "total_chunks": 0,
                "retrieved_chunks": [],
                "grounded_context": ""
            }

        # Build ranking query from target objective and audience
        ranking_query = f"{target_objective} for {target_audience}"

        scored_chunks = []
        for chunk in all_chunks:
            similarity = self._compute_tf_idf_similarity(ranking_query, chunk["content"])
            scored_chunks.append({
                "chunk_id": chunk["chunk_id"],
                "source": chunk["source"],
                "content": chunk["content"],
                "relevance_score": similarity
            })

        # Sort descending by relevance score
        scored_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
        top_chunks = scored_chunks[:top_k]

        grounded_context_str = "\n\n".join(
            [f"[Category: {c['source'].upper()}]\n{c['content']}" for c in top_chunks]
        )

        return {
            "rag_status": "RAG vector-ranking completed successfully.",
            "total_chunks_indexed": len(all_chunks),
            "top_k_selected": len(top_chunks),
            "retrieved_chunks": top_chunks,
            "grounded_context": grounded_context_str
        }

rag_service = RAGService()
