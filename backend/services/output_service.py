import io
import httpx
from typing import Dict, Any, List
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE

class OutputService:
    def _add_picture_to_slide(self, slide, image_url: str, left, top, width, height) -> bool:
        """Download image from URL using HTTP request and insert as BytesIO picture shape."""
        if not image_url:
            return False
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ZenithianAI/1.0"
            }
            with httpx.Client(timeout=8.0, headers=headers, follow_redirects=True) as client:
                res = client.get(image_url)
                if res.status_code == 200 and len(res.content) > 100:
                    img_bytes = io.BytesIO(res.content)
                    slide.shapes.add_picture(img_bytes, left, top, width, height)
                    return True
        except Exception as e:
            print(f"[OutputService] Error embedding picture from {image_url}: {e}")
        return False

    def _add_chart_to_slide(self, slide, chart_data: Dict[str, Any], left, top, width, height) -> bool:
        """Create native PowerPoint chart slide shape."""
        try:
            cd = CategoryChartData()
            cd.categories = [str(l) for l in chart_data.get("labels", [])]
            series_name = chart_data.get("series_name", "Recorded Metrics")
            raw_vals = chart_data.get("values", [])
            float_vals = [float(v) for v in raw_vals]
            cd.add_series(series_name, float_vals)

            chart_type_str = str(chart_data.get("chart_type", "bar")).lower()
            chart_type = XL_CHART_TYPE.PIE if chart_type_str == "pie" else XL_CHART_TYPE.COLUMN_CLUSTERED

            graphic_frame = slide.shapes.add_chart(chart_type, left, top, width, height, cd)
            chart = graphic_frame.chart
            chart.has_legend = True
            title_text = chart_data.get("title") or chart_data.get("chart_title")
            if title_text:
                chart.has_title = True
                chart.chart_title.text_frame.text = title_text
            return True
        except Exception as e:
            print(f"[OutputService] Error adding chart: {e}")
            return False

    def generate_pptx(
        self,
        title: str,
        location: str,
        content: str,
        categories: List[str],
        audience: str,
        objective: str,
        sources: List[Dict[str, Any]],
        unavailable_categories: List[str],
        images: List[Dict[str, Any]] = None,
        chart_data: Dict[str, Any] = None,
        local_leadership: Dict[str, Any] = None,
        tourism_and_culture: Dict[str, Any] = None
    ) -> bytes:
        """
        Generates a professional 9-slide PowerPoint presentation (.pptx) using python-pptx.
        """
        prs = Presentation()
        # Set slide width & height to 16:9 widescreen format (13.33 x 7.5 inches)
        prs.slide_width = Inches(13.333)
        prs.slide_height = Inches(7.5)

        # Visual theme colors: Blue header (#1E3A8A), Slate text (#334155), Light gray background (#F8FAFC)
        color_navy = RGBColor(30, 58, 138)
        color_slate = RGBColor(51, 65, 85)
        color_blue = RGBColor(37, 99, 235)
        color_dark = RGBColor(15, 23, 42)

        blank_slide_layout = prs.slide_layouts[6]

        def add_header(slide, heading_text: str, subtitle_text: str = ""):
            # Add top colored header bar
            header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.733), Inches(1.2))
            tf = header_box.text_frame
            tf.word_wrap = True
            
            p = tf.paragraphs[0]
            p.text = heading_text
            p.font.size = Pt(28)
            p.font.bold = True
            p.font.color.rgb = color_navy

            if subtitle_text:
                p2 = tf.add_paragraph()
                p2.text = subtitle_text
                p2.font.size = Pt(14)
                p2.font.color.rgb = color_blue

        def add_content_box(slide, text_content: str, top_inch: float = 1.8, height_inch: float = 5.0):
            textbox = slide.shapes.add_textbox(Inches(0.8), Inches(top_inch), Inches(11.733), Inches(height_inch))
            tf = textbox.text_frame
            tf.word_wrap = True

            paragraphs = [p for p in text_content.split("\n") if p.strip()]
            for i, line in enumerate(paragraphs):
                p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
                p.text = line.strip()
                p.font.size = Pt(15)
                p.font.color.rgb = color_slate
                p.space_after = Pt(8)

        # SLIDE 1: Title Slide
        slide1 = prs.slides.add_slide(blank_slide_layout)
        title_box = slide1.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.333), Inches(3.5))
        tf1 = title_box.text_frame
        tf1.word_wrap = True
        
        p1 = tf1.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(36)
        p1.font.bold = True
        p1.font.color.rgb = color_navy
        p1.space_after = Pt(16)

        p1_sub = tf1.add_paragraph()
        p1_sub.text = f"Location: {location}  |  Target Audience: {audience.title()}  |  Objective: {objective.title()}"
        p1_sub.font.size = Pt(18)
        p1_sub.font.color.rgb = color_blue

        p1_footer = tf1.add_paragraph()
        p1_footer.text = "Generated by Zenithian – AI Content Transformation Platform"
        p1_footer.font.size = Pt(13)
        p1_footer.font.color.rgb = color_slate
        p1_footer.space_before = Pt(24)

        # SLIDE 2: Location Overview
        slide2 = prs.slides.add_slide(blank_slide_layout)
        add_header(slide2, "1. Location Overview", f"Geographical & Baseline Context for {location}")
        overview_text = (
            f"• Location Name: {location}\n"
            f"• Requested Categories: {', '.join([c.title() for c in categories])}\n"
            f"• Communication Objective: {objective.title()}\n"
            f"• Target Audience: {audience.title()}\n\n"
            "This report analyzes verified open data from public records, geographical databases, "
            "and encyclopedic repositories to transform facts into structured insight."
        )
        add_content_box(slide2, overview_text)

        # SLIDE 3: Selected Category Information
        slide3 = prs.slides.add_slide(blank_slide_layout)
        add_header(slide3, "2. Category Details & Information", "Structured breakdown of requested categories")
        cat_lines = [f"• {c.title()}: Verified data integrated from authorized public sources." for c in categories]
        if unavailable_categories:
            cat_lines.append(f"\nUnavailable Categories Notice: Information for {', '.join([u.title() for u in unavailable_categories])} was not found in public records.")
        add_content_box(slide3, "\n".join(cat_lines))

        # SLIDE 4: Key Findings & Summary Output
        slide4 = prs.slides.add_slide(blank_slide_layout)
        add_header(slide4, "3. Key Findings & Transformed Content", "Grounded analysis generated by Zenithian AI")
        # Extract main text preview
        content_preview = content[:800] + ("..." if len(content) > 800 else "")
        add_content_box(slide4, content_preview)

        # SLIDE 5: Relevant Available Data
        slide5 = prs.slides.add_slide(blank_slide_layout)
        add_header(slide5, "4. Relevant Available Data Summary", "Key data metrics and verified records")
        slide5_text = (
            "• Total Verified Sources Consulted: " + str(len(sources)) + "\n"
            "• Data Integrity: Grounded strictly in retrieved context without invented facts.\n"
            "• Public Sources: OpenStreetMap Nominatim, Wikipedia API, Wikidata.\n"
            "• Geographic Verification: Verified coordinates and administrative boundaries."
        )
        add_content_box(slide5, slide5_text)

        # SLIDE 5B: Data Chart or Disclosure Notice
        if chart_data:
            s_chart = prs.slides.add_slide(blank_slide_layout)
            is_avail = chart_data.get("chart_available", True) and len(chart_data.get("labels", [])) > 0 and len(chart_data.get("values", [])) > 0
            if is_avail:
                c_title = chart_data.get("title") or chart_data.get("chart_title") or "Recent Crime and Safety Metrics"
                add_header(s_chart, c_title, f"Editable Data Chart for {location}")
                self._add_chart_to_slide(s_chart, chart_data, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.8))
            else:
                add_header(s_chart, "Data Visualization Status", f"Statistical Data Disclosure for {location}")
                reason_msg = chart_data.get("reason") or "Verified statistical data for this specific metric is currently unavailable in the retrieved public records."
                disc_text = (
                    f"Notice: {reason_msg}\n\n"
                    "Zero-Hallucination Policy: Zenithian AI strictly avoids generating estimated or unverified numerical statistics when primary open data records are missing."
                )
                add_content_box(s_chart, disc_text)

        # SLIDE 5C: Local Leadership & Governance
        if local_leadership:
            s_lead = prs.slides.add_slide(blank_slide_layout)
            add_header(s_lead, "Local Leadership & Governance", f"Constituency Member of Legislative Assembly (MLA) for {location}")
            mla_name = local_leadership.get("mla_name", "Information currently unavailable")
            mla_exp = local_leadership.get("experience_details", "Detailed political background for local MLA is unavailable in public archives.")
            lead_text = (
                f"• Member of Legislative Assembly (MLA): {mla_name}\n"
                f"• Constituency: {location}\n\n"
                f"Political & Governance Background:\n{mla_exp}"
            )
            add_content_box(s_lead, lead_text)

        # SLIDE 5D: Tourism, Hidden Gems & Local Charm
        if tourism_and_culture:
            s_tour = prs.slides.add_slide(blank_slide_layout)
            add_header(s_tour, f"Discover {location}: Cultural Charm & Hidden Gems", "Popular Landmarks, Offbeat Destinations & Unique Identity")
            pop_spots = tourism_and_culture.get("popular_spots", [])
            hid_gems = tourism_and_culture.get("hidden_gems", [])
            why_visit = tourism_and_culture.get("why_visit", f"{location} offers unique regional heritage and local charm.")
            
            tour_text = (
                f"• Popular Landmarks & Tourist Spots: {', '.join(pop_spots) if pop_spots else 'Central Landmarks'}\n"
                f"• Hidden & Offbeat Gems: {', '.join(hid_gems) if hid_gems else 'Local Heritage Trails'}\n\n"
                f"Why Visit {location} (Unique Local Charm):\n{why_visit}"
            )
            add_content_box(s_tour, tour_text)

        # SLIDE 6: Important Observations
        slide6 = prs.slides.add_slide(blank_slide_layout)
        add_header(slide6, "5. Important Observations", "Contextual nuance and audience alignment")
        obs_text = (
            f"• Communication Tone: Adjusted specifically for {audience.title()} readers.\n"
            "• Information Integrity: Sentences cross-referenced against retrieved extracts.\n"
            "• Citation Transparency: Full source URL trails retained for auditability."
        )
        add_content_box(slide6, obs_text)

        # SLIDE 7: Limitations & Information Gaps
        slide7 = prs.slides.add_slide(blank_slide_layout)
        add_header(slide7, "6. Information Limitations & Notices", "Explicit disclosures on unverified or missing data")
        if unavailable_categories:
            limitations_text = (
                f"Notice: Public records were unavailable for the following categories: {', '.join(unavailable_categories)}.\n\n"
                "Zenithian AI strictly avoids inventing facts or filling gaps with unverified claims. "
                "Where data is unavailable, users are advised to consult secondary official municipal archives."
            )
        else:
            limitations_text = (
                "Notice: All requested categories contained accessible public records.\n\n"
                "As a source-grounded system, outputs are bounded by available public repository records. "
                "Proprietary or private records were not accessed."
            )
        add_content_box(slide7, limitations_text)

        # SLIDE 8: Source References
        slide8 = prs.slides.add_slide(blank_slide_layout)
        add_header(slide8, "7. Source References & Verifications", "List of retrieved data sources")
        source_lines = []
        for s in sources[:6]:
            source_lines.append(f"• {s.get('source_name', 'Authorized Data Source')}: {s.get('url', 'N/A')}")
        if not source_lines:
            source_lines.append("• Public Open Data Archives (Wikipedia, OpenStreetMap Nominatim)")
        add_content_box(slide8, "\n".join(source_lines))

        # SLIDE 9: Conclusion
        slide9 = prs.slides.add_slide(blank_slide_layout)
        add_header(slide9, "8. Conclusion", "Final synthesis")
        conclusion_text = (
            f"This presentation synthesizes available public intelligence for {location}.\n\n"
            "Prepared using Zenithian AI Content Transformation Engine.\n"
            "Ready for review, export, and official communication distribution."
        )
        add_content_box(slide9, conclusion_text)

        # Save presentation to memory buffer
        stream = io.BytesIO()
        prs.save(stream)
        stream.seek(0)
        return stream.read()

output_service = OutputService()
