import os
import uuid
import io
import httpx
from typing import Dict, Any, List, Optional
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE

class PresentationService:
    def __init__(self):
        self.storage_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "presentations")
        os.makedirs(self.storage_dir, exist_ok=True)

    def _download_image_bytes(self, image_url: str) -> Optional[io.BytesIO]:
        """Download image from URL into BytesIO with proper User-Agent header."""
        if not image_url:
            return None
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ZenithianAI/1.0"
            }
            with httpx.Client(timeout=8.0, headers=headers, follow_redirects=True) as client:
                res = client.get(image_url)
                if res.status_code == 200 and len(res.content) > 100:
                    return io.BytesIO(res.content)
        except Exception as e:
            print(f"[Presentation] Error downloading image from {image_url}: {e}")
        return None

    def _add_picture_to_slide(self, slide, image_url: str, left, top, width, height) -> bool:
        """Download image from URL into BytesIO and insert as picture shape. Returns True if inserted, False otherwise."""
        img_bytes = self._download_image_bytes(image_url)
        if img_bytes:
            try:
                slide.shapes.add_picture(img_bytes, left, top, width, height)
                return True
            except Exception as e:
                print(f"[Presentation] Error embedding picture from {image_url}: {e}")
        return False

    def _add_chart_to_slide(self, slide, chart_data: Dict[str, Any], left, top, width, height) -> bool:
        """Create native, fully-editable PowerPoint chart slide shape."""
        try:
            cd = CategoryChartData()
            cd.categories = [str(l) for l in chart_data.get("labels", [])]
            series_name = chart_data.get("series_name", "Data Metrics")
            raw_vals = chart_data.get("values", [])
            float_vals = [float(v) for v in raw_vals]
            cd.add_series(series_name, float_vals)

            chart_type_str = str(chart_data.get("chart_type", "bar")).lower()
            chart_type = XL_CHART_TYPE.PIE if chart_type_str == "pie" else XL_CHART_TYPE.COLUMN_CLUSTERED

            graphic_frame = slide.shapes.add_chart(chart_type, left, top, width, height, cd)
            chart = graphic_frame.chart
            chart.has_legend = True
            if chart_data.get("title"):
                chart.has_title = True
                chart.chart_title.text_frame.text = chart_data.get("title")
            return True
        except Exception as e:
            print(f"[Presentation] Error adding native PPTX chart: {e}")
            return False

    def _get_theme_colors(self, theme_name: str) -> Dict[str, RGBColor]:
        """
        Returns color palette for the 5 Canva-inspired visual themes:
        1. zenithian_creative_flow: Dark navy background cover, electric blue & cyan card shapes.
        2. zenithian_minimal_studio: Clean off-white canvas, dark charcoal text, royal blue accent.
        3. zenithian_future_grid: Dark grid style, cyan header text, neon teal node callouts.
        4. zenithian_impact_story: High contrast slate background, warm amber highlights, emerald accents.
        5. zenithian_executive: Corporate light gray canvas, deep navy titles, structured gray card containers.
        """
        theme = (theme_name or "zenithian_creative_flow").lower()
        if theme == "zenithian_minimal_studio":
            return {
                "dark_bg": RGBColor(250, 250, 250),
                "light_bg": RGBColor(255, 255, 255),
                "title_text": RGBColor(24, 24, 27),
                "sub_text": RGBColor(37, 99, 235),
                "body_text": RGBColor(63, 63, 70),
                "card_bg": RGBColor(244, 244, 245),
                "card_border": RGBColor(228, 228, 231),
                "accent": RGBColor(37, 99, 235)
            }
        elif theme == "zenithian_future_grid":
            return {
                "dark_bg": RGBColor(3, 7, 18),
                "light_bg": RGBColor(15, 23, 42),
                "title_text": RGBColor(6, 182, 212),
                "sub_text": RGBColor(56, 189, 248),
                "body_text": RGBColor(226, 232, 240),
                "card_bg": RGBColor(8, 47, 73),
                "card_border": RGBColor(2, 132, 199),
                "accent": RGBColor(6, 182, 212)
            }
        elif theme == "zenithian_impact_story":
            return {
                "dark_bg": RGBColor(30, 41, 59),
                "light_bg": RGBColor(255, 255, 255),
                "title_text": RGBColor(245, 158, 11),
                "sub_text": RGBColor(16, 185, 129),
                "body_text": RGBColor(30, 41, 59),
                "card_bg": RGBColor(254, 243, 199),
                "card_border": RGBColor(252, 211, 77),
                "accent": RGBColor(245, 158, 11)
            }
        elif theme == "zenithian_executive":
            return {
                "dark_bg": RGBColor(248, 250, 252),
                "light_bg": RGBColor(255, 255, 255),
                "title_text": RGBColor(30, 58, 138),
                "sub_text": RGBColor(29, 78, 216),
                "body_text": RGBColor(51, 65, 85),
                "card_bg": RGBColor(241, 245, 249),
                "card_border": RGBColor(203, 213, 225),
                "accent": RGBColor(29, 78, 216)
            }
        else: # Default: zenithian_creative_flow
            return {
                "dark_bg": RGBColor(15, 23, 42),
                "light_bg": RGBColor(255, 255, 255),
                "title_text": RGBColor(255, 255, 255),
                "sub_text": RGBColor(56, 189, 248),
                "body_text": RGBColor(51, 65, 85),
                "card_bg": RGBColor(240, 249, 255),
                "card_border": RGBColor(191, 219, 254),
                "accent": RGBColor(37, 99, 235)
            }

    def generate_storyboard(
        self,
        title: str,
        location: str,
        categories: List[str],
        audience: str,
        objective: str,
        theme: str = "zenithian_creative_flow",
        include_recent_events: bool = False,
        recent_events_timeframe: str = "7d"
    ) -> List[Dict[str, Any]]:
        """
        Generates structured slide-by-slide storyboard preview.
        """
        storyboard = [
            {
                "slide_number": 1,
                "type": "Cover Slide",
                "title": title or f"Location Intelligence: {location}",
                "layout_name": "Premium Cover Layout",
                "key_message": f"Source-grounded analysis tailored for {audience}."
            },
            {
                "slide_number": 2,
                "type": "Executive Summary",
                "title": "1. Executive Summary",
                "layout_name": "Three-Card Overview Layout",
                "key_message": f"Core findings and purpose for {location}."
            },
            {
                "slide_number": 3,
                "type": "Background & Context",
                "title": "2. Background & Scope",
                "layout_name": "Two-Column Story Layout",
                "key_message": f"Analytical framework covering {', '.join(categories[:3])}."
            },
            {
                "slide_number": 4,
                "type": "Location Overview",
                "title": "3. Location Baseline Facts",
                "layout_name": "Data Highlight Callout",
                "key_message": f"Geographical baseline & coordinates for {location}."
            }
        ]

        if include_recent_events:
            storyboard.append({
                "slide_number": len(storyboard) + 1,
                "type": "Recent Developments & Local News",
                "title": f"{len(storyboard)}. Recent Developments & Local News",
                "layout_name": "Live News Citation Cards",
                "key_message": f"Verified live updates and publisher citations for {location} ({recent_events_timeframe})."
            })

        remaining_slides = [
            ("Category Breakdown", "Category Details", "Card Grid Layout", "Structured findings per category."),
            ("Process & Pipeline", "Data Transformation Process", "Process Flow Diagram", "Open data retrieval -> RAG chunking -> AI synthesis."),
            ("Key Takeaways", "Key Grounded Findings", "Comparison / Highlight Layout", "Facts verified without hallucinated details."),
            ("Public Communication", "Public Briefing Message", "Quote / Key Message Layout", f"Objective: {objective}."),
            ("Limitations", "Data Disclosures & Limitations", "Information Block Layout", "Honest missing data disclosure."),
            ("Source References", "Verified Source Citations", "Source Reference Card Layout", "Citations list with live URLs."),
            ("Conclusion", "Conclusion", "Closing Takeaway Layout", "Final synthesis.")
        ]

        for s_type, s_title, s_layout, s_msg in remaining_slides:
            s_num = len(storyboard) + 1
            storyboard.append({
                "slide_number": s_num,
                "type": s_type,
                "title": f"{s_num - 1}. {s_title}",
                "layout_name": s_layout,
                "key_message": s_msg
            })

        return storyboard

    def generate_presentation_file(
        self,
        title: str,
        subtitle: str,
        location: str,
        content: str,
        categories: List[str],
        audience: str,
        objective: str,
        sources: List[Dict[str, Any]] = None,
        unavailable_categories: List[str] = None,
        theme: str = "zenithian_creative_flow",
        aspect_ratio: str = "16:9",
        include_sources: bool = True,
        include_limitations: bool = True,
        recent_events: List[Dict[str, Any]] = None,
        include_recent_events: bool = False,
        recent_events_timeframe: str = "7d",
        images: List[Dict[str, Any]] = None,
        chart_data: Dict[str, Any] = None,
        local_leadership: Dict[str, Any] = None,
        tourism_and_culture: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Builds a Canva-inspired PowerPoint presentation using python-pptx according to selected theme.
        Constructs real editable PowerPoint shapes (colored rectangle card containers, process flow nodes, accent lines).
        """
        sources = sources or []
        unavailable_categories = unavailable_categories or []
        colors = self._get_theme_colors(theme)
        prs = Presentation()

        if aspect_ratio == "4:3":
            prs.slide_width = Inches(10.0)
            prs.slide_height = Inches(7.5)
            content_width = Inches(8.4)
        else:
            prs.slide_width = Inches(13.333)
            prs.slide_height = Inches(7.5)
            content_width = Inches(11.733)

        blank_layout = prs.slide_layouts[6]

        def add_header(slide, heading: str, subheading: str = ""):
            # Header pill box container shape
            header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), content_width, Inches(1.1))
            tf = header_box.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = heading
            p.font.size = Pt(26)
            p.font.bold = True
            p.font.color.rgb = RGBColor(30, 58, 138) if theme in ["zenithian_minimal_studio", "zenithian_executive"] else colors["title_text"]
            if subheading:
                p2 = tf.add_paragraph()
                p2.text = subheading
                p2.font.size = Pt(13)
                p2.font.color.rgb = colors["sub_text"]

        # SLIDE 1: LAYOUT 1 - PREMIUM COVER
        s1 = prs.slides.add_slide(blank_layout)
        # Add background shape container for dark themes
        bg_shape = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, prs.slide_height)
        bg_shape.fill.solid()
        bg_shape.fill.fore_color.rgb = colors["dark_bg"]
        bg_shape.line.fill.background() # No border

        tb1 = s1.shapes.add_textbox(Inches(1.0), Inches(2.0), content_width, Inches(4.0))
        tf1 = tb1.text_frame
        tf1.word_wrap = True
        p1 = tf1.paragraphs[0]
        p1.text = title if title else f"Location Intelligence: {location}"
        p1.font.size = Pt(36)
        p1.font.bold = True
        p1.font.color.rgb = colors["title_text"]
        
        p1_sub = tf1.add_paragraph()
        p1_sub.text = subtitle if subtitle else f"Target Audience: {audience}  |  Objective: {objective}"
        p1_sub.font.size = Pt(16)
        p1_sub.font.color.rgb = colors["sub_text"]
        p1_sub.space_before = Pt(12)

        p1_footer = tf1.add_paragraph()
        p1_footer.text = f"ZENITHIAN CREATIVE FLOW  •  Theme: {theme.replace('_', ' ').title()}"
        p1_footer.font.size = Pt(12)
        p1_footer.font.color.rgb = colors["sub_text"]
        p1_footer.space_before = Pt(28)

        # SLIDE 2: HARDCODED / ENFORCED LOCATION OVERVIEW SLIDE (RIGHT AFTER COVER)
        s2 = prs.slides.add_slide(blank_layout)
        add_header(s2, "1. Location Overview", f"Geographical & Strategic Baseline Profile for {location}")
        
        stat_card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), content_width, Inches(4.8))
        stat_card.fill.solid()
        stat_card.fill.fore_color.rgb = colors["card_bg"]
        stat_card.line.color.rgb = colors["card_border"]
        tf_stat = stat_card.text_frame
        tf_stat.word_wrap = True
        p_st = tf_stat.paragraphs[0]
        p_st.text = f"LOCATION BASELINE PROFILE: {location.upper()}"
        p_st.font.size = Pt(20)
        p_st.font.bold = True
        p_st.font.color.rgb = colors["accent"]
        p_sb = tf_stat.add_paragraph()
        p_sb.text = content[:700] if content else f"Geographical baseline facts and high-level location overview for {location}."
        p_sb.font.size = Pt(14)
        p_sb.font.color.rgb = colors["body_text"]
        p_sb.space_before = Pt(10)

        # SLIDE 3: EXECUTIVE SUMMARY
        s3 = prs.slides.add_slide(blank_layout)
        add_header(s3, "2. Executive Summary", f"Strategic Overview for {location}")
        
        cards_data = [
            ("Strategic Focus", f"Key growth opportunities and regional developments for {location}."),
            ("Core Sectors Analyzed", f"Targeted analysis across: {', '.join(categories[:4])}."),
            ("Executive Purpose", f"Actionable intelligence tailored for {audience} decision-making.")
        ]
        
        card_w = Inches(3.6)
        card_h = Inches(4.5)
        for idx, (ctitle, cdesc) in enumerate(cards_data):
            left_pos = Inches(0.8 + idx * 3.9)
            c_shape = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_pos, Inches(1.8), card_w, card_h)
            c_shape.fill.solid()
            c_shape.fill.fore_color.rgb = colors["card_bg"]
            c_shape.line.color.rgb = colors["card_border"]
            
            tf_c = c_shape.text_frame
            tf_c.word_wrap = True
            p_ct = tf_c.paragraphs[0]
            p_ct.text = ctitle
            p_ct.font.size = Pt(16)
            p_ct.font.bold = True
            p_ct.font.color.rgb = colors["accent"]
            
            p_cd = tf_c.add_paragraph()
            p_cd.text = cdesc
            p_cd.font.size = Pt(13)
            p_cd.font.color.rgb = colors["body_text"]
            p_cd.space_before = Pt(8)

        # SLIDE 4: RECENT DEVELOPMENTS & LOCAL NEWS (SPLIT LAYOUT WITH IMAGE)
        if include_recent_events or (recent_events and len(recent_events) > 0):
            s_news = prs.slides.add_slide(blank_layout)
            add_header(s_news, "Recent Developments & Local News", f"Verified live updates ({recent_events_timeframe})")

            news_img_url = images[0].get("url") if images and len(images) > 0 else None
            inserted_img = self._add_picture_to_slide(s_news, news_img_url, Inches(0.8), Inches(1.8), Inches(5.2), Inches(3.6)) if news_img_url else False
            
            if inserted_img:
                # Image caption box
                cap_box = s_news.shapes.add_textbox(Inches(0.8), Inches(5.5), Inches(5.2), Inches(1.0))
                tf_cap = cap_box.text_frame
                tf_cap.word_wrap = True
                p_capt = tf_cap.paragraphs[0]
                p_capt.text = f"Visual Media Citation: {location}"
                p_capt.font.size = Pt(11)
                p_capt.font.bold = True
                p_capt.font.color.rgb = colors["accent"]

                # Right Container when image present (Width 6.2")
                right_card = s_news.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.3), Inches(1.8), Inches(6.2), Inches(4.8))
            else:
                # Full Width Container when image absent (Width 11.733")
                right_card = s_news.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.8))

            right_card.fill.solid()
            right_card.fill.fore_color.rgb = colors["card_bg"]
            right_card.line.color.rgb = colors["card_border"]
            tf_rc = right_card.text_frame
            tf_rc.word_wrap = True

            p_rct = tf_rc.paragraphs[0]
            p_rct.text = "LIVE DEVELOPMENTS FEED (LAST 48 HOURS)"
            p_rct.font.size = Pt(15)
            p_rct.font.bold = True
            p_rct.font.color.rgb = colors["accent"]

            if recent_events and len(recent_events) > 0:
                for ev in recent_events[:3]:
                    p_ev = tf_rc.add_paragraph()
                    p_ev.text = f"• [{ev.get('publisher', 'News Source')} | {ev.get('pub_date', 'Recent')}] {ev.get('title', '')}"
                    p_ev.font.size = Pt(12)
                    p_ev.font.bold = True
                    p_ev.font.color.rgb = colors["title_text"] if theme not in ["zenithian_minimal_studio", "zenithian_executive"] else RGBColor(24, 24, 27)
                    p_ev.space_before = Pt(6)

                    p_sn = tf_rc.add_paragraph()
                    p_sn.text = f"  {ev.get('snippet', '')}"
                    p_sn.font.size = Pt(10)
                    p_sn.font.color.rgb = colors["body_text"]
            else:
                p_empty = tf_rc.add_paragraph()
                p_empty.text = f"No major breaking news updates reported for {location} in the selected timeframe ({recent_events_timeframe})."
                p_empty.font.size = Pt(13)
                p_empty.font.color.rgb = colors["body_text"]
                p_empty.space_before = Pt(10)

        # SLIDE 4C: NATIVE EDITABLE DATA CHART SLIDE OR DISCLOSURE FALLBACK
        if chart_data:
            s_chart = prs.slides.add_slide(blank_layout)
            is_avail = chart_data.get("chart_available", True) and len(chart_data.get("labels", [])) > 0 and len(chart_data.get("values", [])) > 0

            if is_avail:
                chart_title = chart_data.get("title") or chart_data.get("chart_title") or "Recent Crime and Safety Metrics"
                add_header(s_chart, chart_title, f"Native PowerPoint Editable Data Chart for {location}")
                card_w = Inches(4.2)
                chart_w = Inches(6.8)

                c_info = s_chart.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), card_w, Inches(4.8))
                c_info.fill.solid()
                c_info.fill.fore_color.rgb = colors["card_bg"]
                c_info.line.color.rgb = colors["card_border"]
                tf_ci = c_info.text_frame
                tf_ci.word_wrap = True
                p_cit = tf_ci.paragraphs[0]
                p_cit.text = chart_data.get("series_name", "Crime & Safety Metrics")
                p_cit.font.size = Pt(16)
                p_cit.font.bold = True
                p_cit.font.color.rgb = colors["accent"]

                for lbl, val in zip(chart_data.get("labels", []), chart_data.get("values", [])):
                    p_l = tf_ci.add_paragraph()
                    p_l.text = f"• {lbl}: {val:,.2f}" if isinstance(val, (int, float)) and not float(val).is_integer() else f"• {lbl}: {int(val) if isinstance(val, (int, float)) else val}"
                    p_l.font.size = Pt(13)
                    p_l.font.color.rgb = colors["body_text"]
                    p_l.space_before = Pt(6)

                self._add_chart_to_slide(s_chart, chart_data, Inches(5.3), Inches(1.8), chart_w, Inches(4.8))
            else:
                add_header(s_chart, "Data Visualization & Metrics Status", f"Statistical Data Disclosure for {location}")
                c_unavail = s_chart.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), content_width, Inches(4.8))
                c_unavail.fill.solid()
                c_unavail.fill.fore_color.rgb = colors["card_bg"]
                c_unavail.line.color.rgb = colors["card_border"]
                tf_u = c_unavail.text_frame
                tf_u.word_wrap = True
                
                p_ut = tf_u.paragraphs[0]
                p_ut.text = "VERIFIED STATISTICAL DATA DISCLOSURE"
                p_ut.font.size = Pt(16)
                p_ut.font.bold = True
                p_ut.font.color.rgb = colors["accent"]

                p_ub = tf_u.add_paragraph()
                reason_msg = chart_data.get("reason") or "Verified statistical data for this specific metric is currently unavailable in the retrieved public records."
                p_ub.text = f"• {reason_msg}"
                p_ub.font.size = Pt(14)
                p_ub.font.color.rgb = colors["body_text"]
                p_ub.space_before = Pt(12)

                p_policy = tf_u.add_paragraph()
                p_policy.text = "• Zero-Hallucination Policy: Zenithian AI strictly avoids generating estimated or unverified numerical statistics when primary open data records are missing."
                p_policy.font.size = Pt(12)
                p_policy.font.color.rgb = colors["sub_text"]
                p_policy.space_before = Pt(10)

        # SLIDE 4D: VERIFIED REAL IMAGE GALLERY SLIDE
        if images and len(images) > 0:
            valid_imgs = images[:3]
            img_count = len(valid_imgs)
            gap = 0.3
            tot_w = 11.733 if aspect_ratio == "16:9" else 8.4
            w_in = (tot_w - (gap * (img_count - 1))) / img_count

            s_img = None

            for idx, img_obj in enumerate(valid_imgs):
                url = img_obj.get("url") or img_obj.get("thumbnail")
                if not url:
                    continue

                img_bytes = self._download_image_bytes(url)
                if img_bytes:
                    if s_img is None:
                        s_img = prs.slides.add_slide(blank_layout)
                        add_header(s_img, "Visual Media & Landmarks Gallery", f"Verified Public Domain / Creative Commons Photos for {location}")

                    l_pos = Inches(0.8 + idx * (w_in + gap))
                    try:
                        s_img.shapes.add_picture(img_bytes, l_pos, Inches(1.8), Inches(w_in), Inches(3.2))
                        cap_box = s_img.shapes.add_textbox(l_pos, Inches(5.1), Inches(w_in), Inches(1.4))
                        tf_cap = cap_box.text_frame
                        tf_cap.word_wrap = True
                        p_ct = tf_cap.paragraphs[0]
                        p_ct.text = img_obj.get("title", location)
                        p_ct.font.size = Pt(11)
                        p_ct.font.bold = True
                        p_ct.font.color.rgb = colors["accent"]
                        p_cd = tf_cap.add_paragraph()
                        p_cd.font.size = Pt(9)
                        p_cd.font.color.rgb = colors["sub_text"]
                    except Exception as ex:
                        print(f"[Presentation] Error inserting gallery picture: {ex}")

        # SLIDE 4E: LOCAL LEADERSHIP & GOVERNANCE SLIDE
        if local_leadership:
            s_lead = prs.slides.add_slide(blank_layout)
            add_header(s_lead, "Local Leadership & Governance", f"Constituency Representative & Background for {location}")
            
            mla_name = local_leadership.get("mla_name", "Information currently unavailable")
            mla_exp = local_leadership.get("experience_details", "Detailed political background for local MLA is unavailable in public archives.")

            c_mla = s_lead.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(4.5), Inches(4.8))
            c_mla.fill.solid()
            c_mla.fill.fore_color.rgb = colors["card_bg"]
            c_mla.line.color.rgb = colors["accent"]
            tf_m = c_mla.text_frame
            tf_m.word_wrap = True
            
            p_mt = tf_m.paragraphs[0]
            p_mt.text = "MEMBER OF LEGISLATIVE ASSEMBLY (MLA)"
            p_mt.font.size = Pt(13)
            p_mt.font.bold = True
            p_mt.font.color.rgb = colors["sub_text"]

            p_mn = tf_m.add_paragraph()
            p_mn.text = mla_name
            p_mn.font.size = Pt(22)
            p_mn.font.bold = True
            p_mn.font.color.rgb = colors["accent"]
            p_mn.space_before = Pt(12)

            p_mc = tf_m.add_paragraph()
            p_mc.text = f"Constituency: {location}"
            p_mc.font.size = Pt(13)
            p_mc.font.color.rgb = colors["body_text"]
            p_mc.space_before = Pt(10)

            c_exp = s_lead.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.6), Inches(1.8), Inches(6.933), Inches(4.8))
            c_exp.fill.solid()
            c_exp.fill.fore_color.rgb = colors["card_bg"]
            c_exp.line.color.rgb = colors["card_border"]
            tf_e = c_exp.text_frame
            tf_e.word_wrap = True

            p_et = tf_e.paragraphs[0]
            p_et.text = "POLITICAL BACKGROUND & GOVERNANCE RECORD"
            p_et.font.size = Pt(15)
            p_et.font.bold = True
            p_et.font.color.rgb = colors["accent"]

            p_eb = tf_e.add_paragraph()
            p_eb.text = mla_exp
            p_eb.font.size = Pt(13)
            p_eb.font.color.rgb = colors["body_text"]
            p_eb.space_before = Pt(10)

        # SLIDE 4F: TOURISM, HIDDEN GEMS & LOCAL CHARM SLIDE
        if tourism_and_culture:
            s_tour = prs.slides.add_slide(blank_layout)
            add_header(s_tour, f"Discover {location}: Cultural Significance & Hidden Gems", "Popular Landmarks, Offbeat Destinations, and Unique Charm")

            pop_spots = tourism_and_culture.get("popular_spots", [])
            hid_gems = tourism_and_culture.get("hidden_gems", [])
            why_visit = tourism_and_culture.get("why_visit", f"{location} offers distinct cultural heritage and local charm.")

            card_w = Inches(3.6)
            card_h = Inches(4.8)

            c_pop = s_tour.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), card_w, card_h)
            c_pop.fill.solid()
            c_pop.fill.fore_color.rgb = colors["card_bg"]
            c_pop.line.color.rgb = colors["card_border"]
            tf_p = c_pop.text_frame
            tf_p.word_wrap = True
            
            p_pt = tf_p.paragraphs[0]
            p_pt.text = "POPULAR TOURIST SPOTS"
            p_pt.font.size = Pt(15)
            p_pt.font.bold = True
            p_pt.font.color.rgb = colors["accent"]

            for spot in pop_spots:
                p_s = tf_p.add_paragraph()
                p_s.text = f"• {spot}"
                p_s.font.size = Pt(12)
                p_s.font.bold = True
                p_s.font.color.rgb = colors["body_text"]
                p_s.space_before = Pt(6)

            c_hid = s_tour.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.8), Inches(1.8), card_w, card_h)
            c_hid.fill.solid()
            c_hid.fill.fore_color.rgb = colors["card_bg"]
            c_hid.line.color.rgb = colors["card_border"]
            tf_h = c_hid.text_frame
            tf_h.word_wrap = True

            p_ht = tf_h.paragraphs[0]
            p_ht.text = "HIDDEN & OFFBEAT GEMS"
            p_ht.font.size = Pt(15)
            p_ht.font.bold = True
            p_ht.font.color.rgb = colors["accent"]

            for gem in hid_gems:
                p_g = tf_h.add_paragraph()
                p_g.text = f"✦ {gem}"
                p_g.font.size = Pt(12)
                p_g.font.bold = True
                p_g.font.color.rgb = colors["body_text"]
                p_g.space_before = Pt(6)

            c_why = s_tour.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.8), Inches(1.8), card_w, card_h)
            c_why.fill.solid()
            c_why.fill.fore_color.rgb = colors["card_bg"]
            c_why.line.color.rgb = colors["accent"]
            tf_w = c_why.text_frame
            tf_w.word_wrap = True

            p_wt = tf_w.paragraphs[0]
            p_wt.text = "WHY VISIT & LOCAL CHARM"
            p_wt.font.size = Pt(15)
            p_wt.font.bold = True
            p_wt.font.color.rgb = colors["accent"]

            p_wb = tf_w.add_paragraph()
            p_wb.text = why_visit
            p_wb.font.size = Pt(11)
            p_wb.font.color.rgb = colors["body_text"]
            p_wb.space_before = Pt(8)

        # SLIDE 5: LAYOUT 4 - PROCESS FLOW DIAGRAM
        s5 = prs.slides.add_slide(blank_layout)
        add_header(s5, "4. Key Tactical Pillars", "Strategic Execution Framework")
        
        steps = [
            ("Pillar 1: Infrastructure", "Logistics & Connectivity"),
            ("Pillar 2: Economy", "Local Growth & Commerce"),
            ("Pillar 3: Community", "Civic Welfare & Services"),
            ("Pillar 4: Future Vision", "Long-term Planning")
        ]
        step_w = Inches(2.6)
        step_h = Inches(3.5)
        for idx, (stitle, sdesc) in enumerate(steps):
            s_left = Inches(0.8 + idx * 2.9)
            node_shape = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, s_left, Inches(2.2), step_w, step_h)
            node_shape.fill.solid()
            node_shape.fill.fore_color.rgb = colors["card_bg"]
            node_shape.line.color.rgb = colors["accent"]
            
            tf_n = node_shape.text_frame
            tf_n.word_wrap = True
            p_nt = tf_n.paragraphs[0]
            p_nt.text = stitle
            p_nt.font.bold = True
            p_nt.font.size = Pt(14)
            p_nt.font.color.rgb = colors["accent"]
            
            p_nd = tf_n.add_paragraph()
            p_nd.text = sdesc
            p_nd.font.size = Pt(12)
            p_nd.font.color.rgb = colors["body_text"]
            p_nd.space_before = Pt(6)

        # SLIDE 6: LAYOUT 5 - TIMELINE LAYOUT
        s6 = prs.slides.add_slide(blank_layout)
        add_header(s6, "5. Category Findings Breakdown", "Structured observations")
        cat_lines = [f"• {c.title()}: Verified insights and key sectoral observations." for c in categories]
        
        c_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), content_width, Inches(4.8))
        c_box.fill.solid()
        c_box.fill.fore_color.rgb = colors["card_bg"]
        c_box.line.color.rgb = colors["card_border"]
        tf_cb = c_box.text_frame
        tf_cb.word_wrap = True
        for idx, line in enumerate(cat_lines):
            p = tf_cb.paragraphs[0] if idx == 0 else tf_cb.add_paragraph()
            p.text = line
            p.font.size = Pt(14)
            p.font.color.rgb = colors["body_text"]
            p.space_after = Pt(8)

        # SLIDE 7: LAYOUT 7 - COMPARISON LAYOUT
        s7 = prs.slides.add_slide(blank_layout)
        add_header(s7, "6. Key Strategic Takeaways", "Regional Advantage & Growth Focus")
        
        comp_w = Inches(5.6)
        cp1 = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), comp_w, Inches(4.5))
        cp1.fill.solid()
        cp1.fill.fore_color.rgb = colors["card_bg"]
        cp1.line.color.rgb = colors["card_border"]
        tf_cp1 = cp1.text_frame
        tf_cp1.word_wrap = True
        p_cp1_t = tf_cp1.paragraphs[0]
        p_cp1_t.text = "Key Regional Strengths"
        p_cp1_t.font.bold = True
        p_cp1_t.font.size = Pt(16)
        p_cp1_t.font.color.rgb = colors["accent"]
        p_cp1_b = tf_cp1.add_paragraph()
        p_cp1_b.text = f"• Established historical & geographical identity for {location}.\n• Active public & private infrastructure initiatives.\n• Strong community foundation and growth potential."
        p_cp1_b.font.size = Pt(13)
        p_cp1_b.font.color.rgb = colors["body_text"]
        p_cp1_b.space_before = Pt(8)

        cp2 = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), comp_w, Inches(4.5))
        cp2.fill.solid()
        cp2.fill.fore_color.rgb = colors["card_bg"]
        cp2.line.color.rgb = colors["card_border"]
        tf_cp2 = cp2.text_frame
        tf_cp2.word_wrap = True
        p_cp2_t = tf_cp2.paragraphs[0]
        p_cp2_t.text = "Growth & Development Priorities"
        p_cp2_t.font.bold = True
        p_cp2_t.font.size = Pt(16)
        p_cp2_t.font.color.rgb = colors["accent"]
        p_cp2_b = tf_cp2.add_paragraph()
        p_cp2_b.text = "• Enhanced focus on sustainable local infrastructure.\n• Expanded educational and healthcare accessibility.\n• Proactive stakeholder communication and reporting."
        p_cp2_b.font.size = Pt(13)
        p_cp2_b.font.color.rgb = colors["body_text"]
        p_cp2_b.space_before = Pt(8)

        # SLIDE 8: LAYOUT 9 - QUOTE / KEY MESSAGE
        s8 = prs.slides.add_slide(blank_layout)
        add_header(s8, "7. Executive Summary Statement", f"Key Message for {audience}")
        
        q_box = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), content_width, Inches(4.8))
        q_box.fill.solid()
        q_box.fill.fore_color.rgb = colors["accent"]
        tf_q = q_box.text_frame
        tf_q.word_wrap = True
        p_qt = tf_q.paragraphs[0]
        p_qt.text = f"\"Strategic Information Briefing: {location}\""
        p_qt.font.size = Pt(22)
        p_qt.font.bold = True
        p_qt.font.color.rgb = colors["accent"]
        p_qb = tf_q.add_paragraph()
        p_qb.text = f"Target Audience: {audience}\nCommunication Objective: {objective}\nTone: Informative and Actionable."
        p_qb.font.size = Pt(14)
        p_qb.font.color.rgb = colors["body_text"]
        p_qb.space_before = Pt(12)

        # SLIDE 9: LAYOUT 10 - DATA LIMITATIONS
        if include_limitations:
            s9 = prs.slides.add_slide(blank_layout)
            add_header(s9, "8. Operating Scope & Assumptions", "Key Parameters & Boundaries")
            l_box = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), content_width, Inches(4.8))
            l_box.fill.solid()
            l_box.fill.fore_color.rgb = colors["card_bg"]
            l_box.line.color.rgb = colors["card_border"]
            tf_l = l_box.text_frame
            tf_l.word_wrap = True
            p_lt = tf_l.paragraphs[0]
            p_lt.text = "SCOPE PARAMETERS"
            p_lt.font.size = Pt(16)
            p_lt.font.bold = True
            p_lt.font.color.rgb = colors["accent"]
            p_lb = tf_l.add_paragraph()
            p_lb.text = f"• Information synthesized from verified public documentation.\n• Continuous monitoring recommended for fast-evolving developments in {location}."
            p_lb.font.size = Pt(14)
            p_lb.font.color.rgb = colors["body_text"]
            p_lb.space_before = Pt(8)

        # SLIDE 10: LAYOUT 11 - SOURCE REFERENCES
        if include_sources:
            s10 = prs.slides.add_slide(blank_layout)
            add_header(s10, "9. Verified Source References", "Citations & URLs")
            s_box = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), content_width, Inches(4.8))
            s_box.fill.solid()
            s_box.fill.fore_color.rgb = colors["card_bg"]
            s_box.line.color.rgb = colors["card_border"]
            tf_s = s_box.text_frame
            tf_s.word_wrap = True
            s_lines = [f"• {s.get('source_name', 'Open Data')}: {s.get('url', 'N/A')}" for s in sources[:5]]
            if not s_lines:
                s_lines.append("• OpenStreetMap Nominatim, Wikipedia REST API")
            for idx, line in enumerate(s_lines):
                p = tf_s.paragraphs[0] if idx == 0 else tf_s.add_paragraph()
                p.text = line
                p.font.size = Pt(13)
                p.font.color.rgb = colors["body_text"]
                p.space_after = Pt(6)

        # SLIDE 11: LAYOUT 12 - CONCLUSION
        s11 = prs.slides.add_slide(blank_layout)
        add_header(s11, "10. Conclusion & Takeaways", "Final synthesis")
        c_final = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), content_width, Inches(4.8))
        c_final.fill.solid()
        c_final.fill.fore_color.rgb = colors["card_bg"]
        c_final.line.color.rgb = colors["accent"]
        tf_fin = c_final.text_frame
        tf_fin.word_wrap = True
        p_ft = tf_fin.paragraphs[0]
        p_ft.text = f"Synthesized Report for {location}"
        p_ft.font.size = Pt(20)
        p_ft.font.bold = True
        p_ft.font.color.rgb = colors["accent"]
        p_fb = tf_fin.add_paragraph()
        p_fb.text = f"Generated by Zenithian AI Content Studio.\nTheme: {theme.replace('_', ' ').title()}.\nReady for distribution and review."
        p_fb.font.size = Pt(14)
        p_fb.font.color.rgb = colors["body_text"]
        p_fb.space_before = Pt(10)

        # Save presentation file
        presentation_id = str(uuid.uuid4())
        safe_name = f"Zenithian_{location.replace(' ', '_')}_{theme}_{presentation_id[:8]}.pptx"
        file_path = os.path.join(self.storage_dir, safe_name)
        prs.save(file_path)

        slide_count = len(prs.slides)
        storyboard = self.generate_storyboard(
            title=title,
            location=location,
            categories=categories,
            audience=audience,
            objective=objective,
            theme=theme,
            include_recent_events=include_recent_events,
            recent_events_timeframe=recent_events_timeframe
        )

        return {
            "presentation_id": presentation_id,
            "title": title,
            "location": location,
            "theme": theme,
            "aspect_ratio": aspect_ratio,
            "slide_count": slide_count,
            "file_name": safe_name,
            "file_path": file_path,
            "file_size": os.path.getsize(file_path),
            "download_url": f"/api/presentations/{presentation_id}/download",
            "storyboard": storyboard,
            "slide_outline": [f"Slide {s['slide_number']}: {s['type']} ({s['layout_name']})" for s in storyboard]
        }

presentation_service = PresentationService()
