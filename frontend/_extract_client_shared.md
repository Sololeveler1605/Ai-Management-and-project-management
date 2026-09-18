# Extraction: client.py · shared.py · schemas.py

Exhaustive literal extract for frontend port. Source paths:

- `streamlit_app/views/client.py`
- `streamlit_app/views/shared.py`
- `backend/schemas.py`

---

# CLIENT (`streamlit_app/views/client.py`)

## Module constants

| Name | Literal value |
|------|----------------|
| `SHOW_DEMO_DASHBOARD` | `True` |
| `CLIENT_NAV_KEY` | `"client_nav_radio"` |
| `NAV_PAGES` | `["My Projects", "Documents"]` |
| `ALL_PROJECTS_LABEL` | `"All Projects"` |

### `STATUS_META`

```python
{
    "in progress": {"icon": "🔵", "color": "blue", "hex": "#3B82F6"},
    "in_progress": {"icon": "🔵", "color": "blue", "hex": "#3B82F6"},
    "planning":    {"icon": "🟣", "color": "violet", "hex": "#8B5CF6"},
    "active":      {"icon": "🟢", "color": "green", "hex": "#22C55E"},
    "on_hold":     {"icon": "🟠", "color": "orange", "hex": "#F59E0B"},
    "completed":   {"icon": "🟢", "color": "green", "hex": "#22C55E"},
}
```

Default when status unknown: `{"icon": "⚪", "color": "gray", "hex": "#6B7280"}`

### `DOC_ICON`

```python
{
    "pdf": "📕", "doc": "📘", "docx": "📘", "xls": "📗", "xlsx": "📗",
    "png": "🖼️", "jpg": "🖼️", "jpeg": "🖼️", "zip": "🗜️",
}
```

Default icon: `"📄"`

### `DOC_TYPE_PILL`

```python
{
    "pdf":  ("PDF",  "pill-red"),
    "doc":  ("DOC",  "pill-blue"),
    "docx": ("DOCX", "pill-blue"),
    "xls":  ("XLS",  "pill-green"),
    "xlsx": ("XLSX", "pill-green"),
    "png":  ("IMG",  "pill-gray"),
    "jpg":  ("IMG",  "pill-gray"),
    "jpeg": ("IMG",  "pill-gray"),
    "zip":  ("ZIP",  "pill-gray"),
}
```

Default: `(ext.upper() or "FILE", "pill-gray")`

### `CHART_COLORS`

```python
{
    "indigo": "#6366F1",
    "green":  "#22C55E",
    "amber":  "#F59E0B",
    "red":    "#EF4444",
    "pink":   "#EC4899",
    "teal":   "#14B8A6",
    "violet": "#8B5CF6",
    "blue":   "#2563EB",
    "grid":   "#E5E7EB",
    "text":   "#111827",
}
```

### `DEMO_DASHBOARDS`

```python
[{
    "project_id": "demo-1",
    "project_name": "AI Project OS",
    "status": "in_progress",
    "deadline": (today + 39 days).strftime("%Y-%m-%d"),
    "progress_percent": 70,
    "milestone_info": "Testing Dashboard UI",
    "documents": [],
}]
```

## Imports / API calls used by client

From `api_client`:

- `get_client_dashboard(token)` — dashboard load
- `get_project_modules(token, project_id)` — module progress + expander
- `download_document(token, doc_id)` — download / preview
- `upload_document(token, uploaded, project_id=...)` — documents page upload
- `delete_document(token, doc_id)` — delete when `can_delete=True`

From `views.shared`:

- `render_sidebar_header`, `show_api_error`, `show_document_preview`, `session_token`, `session_user`, `rag_status_label`, `trigger_reindex`

Success status codes:

| Action | Success codes |
|--------|---------------|
| download | `200` |
| upload | `200`, `201` |
| delete | `204` |
| get dashboard / modules | `200` |
| reindex (via shared) | `200` |

---

## Full CSS: `_inject_client_light_theme`

Injected via `st.markdown("\n".join(css_lines), unsafe_allow_html=True)`.

Literal CSS lines (joined with `\n`):

```css
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
html, body, [class*='css'] { font-family: 'Inter', sans-serif; }

.stApp { background: linear-gradient(180deg, #F8F9FF 0%, #F5F6FA 100%); }
.block-container { padding-top: 1.5rem; padding-bottom: 3rem; }

header[data-testid='stHeader'] { background: #F8F9FF !important; }
header[data-testid='stHeader'] * { color: #111827 !important; }

h1, h2, h3, h4, h5, h6, p, span, label, li, div, .stMarkdown { color: #111827 !important; }
[data-testid='stMarkdownContainer'], [data-testid='stMarkdownContainer'] * { color: #111827 !important; }
[data-testid='stCaptionContainer'], [data-testid='stCaptionContainer'] * { color: #6B7280 !important; }

section[data-testid='stSidebar'] { background: #FFFFFF; border-right: 1px solid #EEF0F3; }
section[data-testid='stSidebar'] * { color: #374151 !important; }
section[data-testid='stSidebar'] code {
    background: #E0E7FF !important; color: #312E81 !important;
    border: 1px solid #C7D2FE !important; border-radius: 5px !important; padding: 2px 6px !important;
}
section[data-testid='stSidebar'] div[role='radiogroup'] { display: flex; flex-direction: column; gap: 2px; }
section[data-testid='stSidebar'] div[role='radiogroup'] label {
    border-radius: 8px; padding: 9px 12px !important; margin: 0 !important; cursor: pointer;
}
section[data-testid='stSidebar'] div[role='radiogroup'] label:hover { background-color: #F3F4F6; }
section[data-testid='stSidebar'] div[role='radiogroup'] label:has(input:checked) {
    background-color: #EEF2FF !important; border-left: 3px solid #4F46E5 !important;
}
section[data-testid='stSidebar'] div[role='radiogroup'] label:has(input:checked) * {
    color: #4338CA !important; font-weight: 600;
}

div[data-testid='stVerticalBlockBorderWrapper'] {
    background-color: #FFFFFF !important;
    border: 1px solid #EEF0F3 !important;
    border-radius: 18px !important;
    box-shadow: 0 2px 8px rgba(17,24,39,0.06) !important;
    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
    padding: 0.35rem;
}
div[data-testid='stVerticalBlockBorderWrapper']:hover {
    box-shadow: 0 12px 24px rgba(17,24,39,0.12) !important;
}

.card-anchor { display: none; }

div[data-testid='stVerticalBlockBorderWrapper']:has(.card-anchor-welcome_header) {
    background: linear-gradient(135deg, #EEF2FF 0%, #FDF2F8 100%) !important;
    border: none !important; padding: 1.5rem !important;
}
div[data-testid='stVerticalBlockBorderWrapper']:has(.card-anchor-stat_total_projects) {
    background: linear-gradient(135deg,#FFFFFF 0%,#EEF2FF 100%) !important; border-left: 4px solid #6366F1 !important;
}
div[data-testid='stVerticalBlockBorderWrapper']:has(.card-anchor-stat_avg_progress) {
    background: linear-gradient(135deg,#FFFFFF 0%,#ECFDF5 100%) !important; border-left: 4px solid #22C55E !important;
}
div[data-testid='stVerticalBlockBorderWrapper']:has(.card-anchor-stat_documents) {
    background: linear-gradient(135deg,#FFFFFF 0%,#EFF6FF 100%) !important; border-left: 4px solid #3B82F6 !important;
}
div[data-testid='stVerticalBlockBorderWrapper']:has(.card-anchor-stat_deadline) {
    background: linear-gradient(135deg,#FFFFFF 0%,#FEF3C7 100%) !important; border-left: 4px solid #F59E0B !important;
}
div[data-testid='stVerticalBlockBorderWrapper']:has(.card-anchor-hero) { border-left: 4px solid #6366F1 !important; }
div[data-testid='stVerticalBlockBorderWrapper']:has(.card-anchor-chart_bar) { border-left: 4px solid #2563EB !important; }
div[data-testid='stVerticalBlockBorderWrapper']:has(.card-anchor-chart_deadline) { border-left: 4px solid #EC4899 !important; }

.icon-badge {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem;
    box-shadow: inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 4px rgba(17,24,39,0.06);
}

.pill {
    display: inline-block; padding: 3px 10px; border-radius: 999px;
    font-size: 0.75rem; font-weight: 600; white-space: nowrap;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04); letter-spacing: 0.2px;
}
.pill-red    { background:#FEE2E2; color:#B91C1C; }
.pill-orange { background:#FEF3C7; color:#B45309; }
.pill-green  { background:#DCFCE7; color:#15803D; }
.pill-blue   { background:#DBEAFE; color:#1D4ED8; }
.pill-gray   { background:#F3F4F6; color:#374151; }

.section-heading {
    font-size: 1.4rem; font-weight: 800; color: #111827;
    margin: 1.2rem 0 0.8rem 0; display:flex; align-items:center; gap:10px;
}
.section-heading .bar { width: 5px; height: 24px; border-radius: 3px; background: linear-gradient(180deg,#6366F1,#EC4899); }

.meta-row {
    display: flex; align-items: center; gap: 10px;
    background: #F9FAFB; border-radius: 10px; padding: 10px 14px;
    margin-top: 8px; font-size: 13px; color: #374151;
    border: 1px solid #F3F4F6;
}
.meta-row b { color: #111827; }

.stat-label { font-size: 0.85rem; color: #6B7280; margin-top: 8px; }
.stat-value { font-size: 1.9rem; font-weight: 800; }

.demo-banner {
    background: linear-gradient(90deg, #EEF2FF 0%, #F5F3FF 100%);
    border: 1px solid #C7D2FE; border-left: 4px solid #6366F1;
    border-radius: 12px; padding: 14px 18px; color: #4338CA;
    font-weight: 500; margin-bottom: 1rem; user-select: none;
}

.stButton button {
    background-color: #FFFFFF; color: #374151;
    border: 1px solid #E5E7EB; border-radius: 8px;
}
.stButton button:hover { border-color: #4F46E5; color: #4338CA; }
.stButton button[kind='primary'] { background-color: #4F46E5; color: #FFFFFF !important; border: 1px solid #4F46E5; }
.stButton button[kind='primary']:hover { background-color: #4338CA; border-color: #4338CA; }

.stProgress > div > div > div > div { border-radius: 6px; background-color: #6366F1; }
.stProgress > div > div { background-color: #F3F4F6; border-radius: 6px; }

[data-testid='stFileUploaderDropzone'] {
    background-color: #F9FAFB !important;
    border: 1.5px dashed #D1D5DB !important;
    border-radius: 12px !important;
}
[data-testid='stFileUploaderDropzone'] * { color: #374151 !important; }
[data-testid='stFileUploaderDropzone'] button {
    background-color: #FFFFFF !important;
    border: 1px solid #E5E7EB !important;
    color: #374151 !important;
}
[data-testid='stFileUploaderDropzone'] svg { fill: #6B7280 !important; }
</style>
```

### Card-anchor names used

| Anchor class suffix | Purpose |
|---------------------|---------|
| `welcome_header` | Welcome gradient card |
| `stat_total_projects` | Stat card indigo |
| `stat_avg_progress` | Stat card green |
| `stat_documents` | Stat card blue |
| `stat_deadline` | Stat card amber |
| `hero` | Project overview hero |
| `chart_bar` | Project Progress chart |
| `chart_deadline` | Deadline Urgency chart |
| `proj_{project_id}` | Per-project list cards (dynamic) |

---

## Sidebar menu (`render_client_app`)

1. Call `_inject_client_light_theme()`.
2. If `CLIENT_NAV_KEY` (`"client_nav_radio"`) not in `st.session_state`, set to `NAV_PAGES[0]` → `"My Projects"`.
3. Sidebar:
   - `render_sidebar_header()`
   - `st.subheader("Client menu")`
   - `page = st.radio("Go to", NAV_PAGES, key=CLIENT_NAV_KEY)`
4. Route:
   - `"My Projects"` → `_render_client_dashboard()`
   - `"Documents"` → `_render_client_documents()`

Helper `_go_to_documents()`: sets `st.session_state[CLIENT_NAV_KEY] = "Documents"` (defined; not called in this file’s entry path).

---

## Helpers — full logic

### `_status_meta(status_text)`

```
return STATUS_META.get((status_text or "").strip().lower(),
                       {"icon": "⚪", "color": "gray", "hex": "#6B7280"})
```

### `_effective_progress(dashboard)`

1. If `dashboard.get("module_progress_percent") is not None` → return that.
2. Else if `(dashboard.get("status") or "").strip().lower() == "completed"` → return `100`.
3. Else → return `dashboard.get("progress_percent", 0)`.

### `_initials(text, max_letters=2)`

- Split on spaces after `text.replace("_", " ")`, drop empty parts.
- Join first char of each part up to `max_letters`, `.upper()`.
- If empty → `"?"`.

### `_doc_ext(filename)`

- If `"."` in filename → `filename.rsplit(".", 1)[-1].lower()`
- Else → `""`

### `_doc_icon(filename)`

- `DOC_ICON.get(_doc_ext(filename), "📄")`

### `_pill_html(text, cls)`

- `"<span class='pill " + cls + "'>" + text + "</span>"`

### `_doc_type_pill_html(filename)`

- Lookup `DOC_TYPE_PILL` by ext; default `(ext.upper() or "FILE", "pill-gray")`.
- Return `_pill_html(label, cls)`.

### `_days_left(deadline_str)`

Try formats in order:

1. `"%Y-%m-%d"`
2. `"%d %b %Y"`
3. `"%B %d, %Y"`
4. `"%m/%d/%Y"`

Parse `str(deadline_str)[:10]` with each; on success return `(deadline_date - today).days`. On all failures → `None`.

### `_deadline_pill(days)`

| Condition | Text | Class |
|-----------|------|-------|
| `days is None` | `"No deadline"` | `"pill-gray"` |
| `days < 0` | `"Overdue"` | `"pill-red"` |
| `days <= 3` | `"Soon"` | `"pill-orange"` |
| else | `"On track"` | `"pill-green"` |

### `_is_completed(dashboard)`

- `(dashboard.get("status") or "").strip().lower() == "completed"`

### `_card_anchor(name)`

- Emit hidden span: `"<span class='card-anchor card-anchor-" + name + "'></span>"`

### `_icon_badge(icon, bg, fg="#111827")`

- Div `.icon-badge` with `background: bg`, inner span `color: fg`.

### `_section_heading(icon, title)`

- Div `.section-heading` with `.bar` + `icon + " " + title`.

### `_attach_module_progress(token, dashboards)`

For each dashboard:

1. `get_project_modules(token, str(dashboard["project_id"]))`
2. If status ≠ 200 → `show_api_error`, continue.
3. If `modules` non-empty:
   - `completed = sum(1 for m in modules if m.get("status") == "completed")`
   - `dashboard["module_progress_percent"] = round(100 * completed / len(modules))`
   - `dashboard["module_count"] = len(modules)`
   - `dashboard["completed_module_count"] = completed`

### `_render_project_modules(token, project_id, key_prefix)`

1. `get_project_modules(token, str(project_id))`; error → show and return.
2. Expander `"🧩 Project modules (" + len + ")"`.
3. Empty → caption `"The project workflow has not been defined yet."`
4. Else progress `completed/len`, text `"{completed}/{len} complete"`.
5. Each module: `icon` default `"🧩"`, `name` default `"—"`, status default `"locked"` → replace `_` with space, `.title()`.
6. If `description` present → caption.

### `_render_doc_row(token, doc, key_prefix, can_delete=True)`

Columns: `[3,1,1,1,1]` if `can_delete` else `[3,1,1,1]`.

| Col | Content |
|-----|---------|
| 0 | Icon badge (28×28, bg `#F3F4F6`, radius 8px) + filename; caption `rag_status_label(doc)` |
| 1 | `download_document` → if 200: download button label `"Download"`, mime `"application/octet-stream"`, key `key_prefix + "_dl_" + id`; else `show_api_error` |
| 2 | Button `"Preview"`, key `..._view_...` → `show_document_preview(token, doc)` |
| 3 | `trigger_reindex(token, doc, key=key_prefix + "_reindex_" + id)` |
| 4 (if can_delete) | Button `"Delete"` → `delete_document`; success `204` → success `"Document deleted."` + rerun; else error |

---

## Dashboard charts

### Ring: `_ring_chart(pct, color=None, height=170)`

- Default color: `CHART_COLORS["teal"]` = `#14B8A6`
- Pie values: `[pct, 100 - pct]`, `hole=0.70`
- Marker colors: `[ring_color, "#F1F5F9"]`, line `#FFFFFF` width `3`
- `textinfo="none"`, `sort=False`, `direction="clockwise"`
- Layout: no legend; margin all 0; height param; `paper_bgcolor="rgba(0,0,0,0)"`
- Center annotation: bold 24px colored text `"{pct}%"`
- Hero usage: `_ring_chart(hero_progress, meta["hex"], height=190)`, key `"hero_ring"`, caption `"Completed"`

### Progress line (named bar chart): `_progress_bar_chart(dashboards)`

Despite name, this is a **spline line + markers + text** chart titled “Project Progress”.

- `names` = project names; `values` = `_effective_progress`; `colors` = status hex
- If **exactly 1** project: prepend `"Start"` / `0` / `"#E5E7EB"`; blank text label on Start
- Text position: `"bottom center"` if `v >= 90` else `"top center"`
- Line: color `CHART_COLORS["blue"]` (`#2563EB`), width `4`, shape `"spline"`
- Marker: size `16`, color=status colors, white line width `3`
- Text font: color `CHART_COLORS["text"]` (`#111827`), size `13`, family `"Inter"`
- Height: `max(240, 70 * len(dashboards))`
- Margin: `t=50, b=10, l=10, r=10`
- X/Y axis color `#374151`, tick size 13; Y range `[0, 115]`, grid `CHART_COLORS["grid"]` dashed, title `"Progress %"`
- Transparent paper/plot bg

### Deadline urgency: `_deadline_urgency_chart(dashboards)`

Vertical bars (`orientation="v"`), width `0.45`, height `280`.

**Days values:**

- `_days_left(deadline)`; if None → `0`
- If completed AND days < 0 → force `0`

**Bar colors:**

| Condition | Color key | Hex |
|-----------|-----------|-----|
| completed | green | `#22C55E` |
| days < 0 | red | `#EF4444` |
| days ≤ 7 | amber | `#F59E0B` |
| else | green | `#22C55E` |

**Labels:**

| Condition | Label |
|-----------|-------|
| completed | `"Completed"` |
| days < 0 | `"{days}d overdue"` |
| else | `"{days}d left"` |

- Marker line white width 1; text outside, color `#374151` size 13
- Y padding: `max(3, int((max_val - min_val) * 0.3))` with min/max over `days_values + [0]` / `+[1]`
- Zeroline `#9CA3AF` width 2; title `"Days left"`; grid dashed `#E5E7EB`

### Doc type pie: `_doc_type_pie(dashboards)`

- Count extensions from all docs’ filenames (uppercased, or `"OTHER"`)
- If empty → `None` (function exists; **not called** in current dashboard render)
- Palette: indigo, teal, amber, pink, violet, plus `"#06B6D4"`
- Hole `0.6`, `textinfo="percent"`, white text size 12
- Center annotation: total count (20px `#111827`) + `"Total Docs"` (11px `#6B7280`)
- Height 260; horizontal legend below

### Analytics section layout

- Heading `"📊 Analytics"`
- Subtitle suffix: `"across all projects"` if All Projects else `"for " + selected_project_name`
- Col1 card `chart_bar`: `"#### Project Progress"` / caption `"Progress trend " + suffix` / key `"chart_bar"`
- Col2 card `chart_deadline`: `"#### Deadline Urgency"` / caption `"Days remaining " + suffix` / key `"chart_deadline"`
- Both `config={"displayModeBar": False}`

---

## Dashboard page logic (`_render_client_dashboard`)

1. Welcome card (`welcome_header`): title `"👋 Welcome back, {name}!"`, caption overview; avatar badge initials color `"violet"`.
2. `get_client_dashboard(token)`; ≠200 → error return.
3. Empty list + `SHOW_DEMO_DASHBOARD` → demo banner HTML + `DEMO_DASHBOARDS`; else info `"No projects found for your account yet."` return.
4. Selectbox `"📁 Project"`, options `[ALL_PROJECTS_LABEL] + names`, key `"client_project_selector"`.
5. Filter `active_dashboards`; `show_remaining_list = True` only for All Projects.
6. If not demo: `_attach_module_progress(token, active_dashboards)`.
7. Stats:
   - Total Projects → indigo `#6366F1`, sub `"All ongoing projects"`
   - Average Progress → green, sub `"Across all projects"` (rounded mean of `_effective_progress`)
   - Documents → accent `"#3B82F6"`, sub `"Total documents"`
   - Nearest Deadline → amber; value `"{soonest_days}d"` or `"—"`, sub `"Upcoming"` (min `_days_left` among those not None)
8. Icon badges use bg `"#FFFFFF"`, fg=accent; sparkline SVG stroke=accent.
9. **Sort:** `ordered_dashboards = sorted(active_dashboards, key=_sort_key)` where `_sort_key` = `_days_left(deadline)` or `9999` if None (soonest first).
10. Hero = first; rest = remainder.
11. Hero overview: ring + status pill-blue + name + meta-row deadline; completed pills `"✅ Completed on schedule"` if `(hero_days or 0) >= 0` else `"✅ Completed"`; else `_deadline_pill`. Docs expander: `_render_doc_row(..., can_delete=False)` only if not demo.
12. Remaining list (if `rest and not using_demo and show_remaining_list`): per-project cards with status color top bar, deadline/days/progress columns, progress bar, docs expander `can_delete=False`.

---

## Documents page (`_render_client_documents`)

1. Title `"📄 Documents"`, caption `"Upload to a project, or preview files shared by your team."`
2. `get_client_dashboard(token)` — same as dashboard API.
3. `project_options = {project_name: project_id}`
4. Upload bordered container:
   - Subheader `"⬆️ Upload a document"`
   - No projects → info `"No projects available to upload into yet."`
   - Session key `"client_doc_uploader_key"` default `0`
   - Form `"client_upload_document_form"`, `clear_on_submit=True`
   - Selectbox `"Project"`, file_uploader `"Choose a file"`, `type=None`, key `"client_doc_uploader_" + key`
   - Submit `"Upload"` primary:
     - No file → warning `"Please choose a file first."`
     - Else `upload_document(token, uploaded, project_id=str(...))`
     - Success 200/201 → increment uploader key, success `"Uploaded to **{label}**. Your team can see it now."`, rerun
5. No dashboards → info return.
6. No documents any project → info about upload/wait.
7. **Tabs:** `tab_labels = [d["project_name"] for d in dashboards if d.get("documents")]` — only projects that have documents.
8. Per tab: caption `"{n} file(s) on this project"`; each doc `_render_doc_row(..., key_prefix="docs_" + project_id, can_delete=True)`.

### `can_delete` summary

| Location | `can_delete` |
|----------|--------------|
| Dashboard hero docs | `False` |
| Dashboard remaining project docs | `False` |
| Documents page tabs | `True` |

### Sort logic summary

| Context | Sort |
|---------|------|
| Hero selection | By deadline days ascending (`None` → `9999`) |
| Remaining list | Same order after hero removed |
| Documents tabs | Dashboard API order filtered to projects with docs (no extra sort) |
| Doc type pie (unused in UI) | Dict insertion order of ext counts |

---

# SHARED (`streamlit_app/views/shared.py`) — requested symbols

## `show_api_error(response)`

1. Try `payload = response.json()`; `detail = payload.get("detail", payload)`.
2. On any exception: `detail = response.text`.
3. Display:
   - `403` → `st.error(f"Forbidden: {detail}")`
   - `404` → `st.error(f"Not found: {detail}")`
   - else → `st.error(f"Request failed ({response.status_code}): {detail}")`

## `rag_status_label(doc: dict) -> str`

`_RAG_SUPPORTED_EXTS = (".pdf", ".docx", ".pptx", ".txt", ".csv", ".md", ".log")`

| Condition | Return |
|-----------|--------|
| `int(doc.get("chunk_count") or 0) > 0` | `"RAG ready · {chunks} chunk(s)"` |
| filename lower ends with supported ext | `"Not indexed for chat — click Reindex"` |
| else | `"Unsupported for RAG (use PDF/DOCX/PPTX/TXT/CSV/MD)"` |

Note: `.log` is in supported tuple for “Not indexed” path; unsupported message omits LOG.

## `trigger_reindex(token, doc, *, key)`

1. Button `"Reindex"`, `use_container_width=True`, key=`key`.
2. Spinner `"Indexing {filename|document}…"`.
3. `reindex_document(token, str(doc["id"]))`.
4. If `200`:
   - `n = data.get("chunks_indexed", 0)` from JSON (or `{}` if no content)
   - `n > 0` → success `"Indexed {n} chunk(s) — available in AI Chat."`
   - else → warning `"No text extracted. Use PDF, DOCX, PPTX, TXT, CSV, or MD, or check that the file is not image-only."`
   - `st.rerun()`
5. Else → `show_api_error(resp)`.

## `render_clients_page(*, can_manage: bool)`

1. Title `"Clients"`; `get_clients(token)`.
2. Empty → info `"No clients found for your organization."`; if not `can_manage` return.
3. Else dataframe columns: `company_name`, `contact_name`, `email`, `phone`, `status`.
4. If not `can_manage` → return (read-only).
5. **Add client** form `"add_client_form"`:
   - Fields: Company name, Contact name, Email, Phone, Status selectbox `["active", "pending", "inactive"]`, password optional.
   - Payload: `company_name`, `contact_name or None`, `email or None`, `phone or None`, `status`, `password or None`.
   - Success `200|201` → `"Client created."`; if password → info `"Client login created — email: {email}"`.
6. **Edit client**: select `"{company_name} ({id})"`; form updates all five fields (status index from current); success `200`.
7. **Delete client**: selectbox by id; checkbox `"I confirm deletion"`; button primary `"Delete client"`; success `200`.

## `render_documents_page(*, can_delete: bool)`

1. Title `"Documents"`.
2. Session `"doc_uploader_key"` default `0`.
3. Projects: `get_projects`; lookup starts with `"General (not linked to a project)": None` then name→id.
4. Upload form `"upload_document_form"`: selectbox `"Link to project"`, uploader key `doc_uploader_{n}`, submit `"Upload"`.
   - Success: if `chunk_count > 0` success with AI Chat message; else success without RAG + Reindex hint.
5. `list_documents(token)`; empty → info.
6. Group by project name (or General); per group subheader; columns `[3,1,1,1,1]`:
   - filename + `rag_status_label`
   - Download key `download_{id}`
   - Preview key `preview_doc_{id}` → `show_document_preview`
   - Reindex key `reindex_doc_{id}`
   - Delete only if `can_delete`; success `204` → `"Document deleted."`
7. `st.divider()` after each group.

## `show_document_preview(token, doc)` — `@st.dialog("Document Preview", width="large")`

Dialog CSS (literals):

- Dialog bg `#FFFFFF`; all text `#111827`
- Code/pre: bg white, border `#E5E7EB`, radius 8px
- iframe/image: white bg, radius 8px

Flow:

1. `download_document`; ≠200 → error return.
2. By extension (filename lower):
   - `.png|.jpg|.jpeg|.gif` → `st.image(content)`
   - `.pdf` → base64 iframe `width="100%" height="500"`
   - `.txt|.csv|.md` → `st.text(decode errors="replace")`
   - `.docx` → mammoth → HTML in `st.components.v1.html` height 500 scrolling; wrapper bg white, Arial, tables border `#E5E7EB`, th bg `#F3F4F6`
   - else → info `"Preview not supported for this file type — please download instead."`

---

# SCHEMAS — TypeScript-ready field lists

UUID → `string`; `datetime`/`date` → `string` (ISO); `EmailStr` → `string`; `Optional[T]` → `T | null`; defaults noted.

## `UserOut`

| Field | TS type | Default / notes |
|-------|---------|-----------------|
| `id` | `string` | UUID |
| `name` | `string` | |
| `email` | `string` | |
| `role` | `string` | `"admin" \| "manager" \| "employee" \| "client"` (from register comment) |
| `organization_id` | `string` | UUID |
| `designation` | `string \| null` | optional |
| `is_active` | `boolean` | default `true` |

Related (not requested but adjacent): `UserRegister`, `UserUpdate`, `UserLogin`.

## `Client*`

### `ClientCreate`

| Field | TS type | Default |
|-------|---------|---------|
| `company_name` | `string` | required |
| `contact_name` | `string \| null` | |
| `email` | `string \| null` | |
| `phone` | `string \| null` | |
| `status` | `string \| null` | `"active"` |
| `password` | `string \| null` | optional login |

### `ClientUpdate`

| Field | TS type |
|-------|---------|
| `company_name` | `string \| null` |
| `contact_name` | `string \| null` |
| `email` | `string \| null` |
| `phone` | `string \| null` |
| `status` | `string \| null` |

### `ClientOut`

| Field | TS type |
|-------|---------|
| `id` | `string` |
| `company_name` | `string` |
| `contact_name` | `string \| null` |
| `email` | `string \| null` |
| `phone` | `string \| null` |
| `status` | `string` |
| `created_at` | `string` |

UI status literals used: `"active"`, `"pending"`, `"inactive"`.

## `Task*`

### `TaskCreate`

| Field | TS type | Default / literals |
|-------|---------|-------------------|
| `project_id` | `string \| null` | UUID |
| `module_id` | `string \| null` | UUID |
| `title` | `string` | required |
| `description` | `string \| null` | |
| `epic` | `string \| null` | |
| `status` | `"todo" \| "in_progress" \| "testing" \| "done"` | `"todo"` |
| `priority` | `"low" \| "medium" \| "high" \| "urgent"` | `"medium"` |
| `story_points` | `number \| null` | |
| `labels` | `string[]` | `[]` |
| `start_date` | `string \| null` | date |
| `deadline` | `string \| null` | date |
| `assigned_to` | `string \| null` | UUID |
| `testing_assigned_to` | `string[]` | `[]` |
| `testing_status` | `"assigned" \| "accepted" \| "submitted" \| null` | |
| `progress_percent` | `number \| null` | |

### `TaskUpdate`

Same fields as Create, all optional (`T | null`); `labels`/`testing_assigned_to` optional arrays.

### `TaskStatusUpdate`

| Field | TS type |
|-------|---------|
| `status` | `"todo" \| "in_progress" \| "testing" \| "done" \| null` |
| `testing_status` | `"assigned" \| "accepted" \| "submitted" \| null` |
| `progress_percent` | `number \| null` |

### `TaskOut`

| Field | TS type | Default |
|-------|---------|---------|
| `id` | `string` | |
| `organization_id` | `string` | |
| `project_id` | `string \| null` | |
| `module_id` | `string \| null` | |
| `title` | `string` | |
| `description` | `string \| null` | |
| `epic` | `string \| null` | |
| `status` | `string` | |
| `completed_at` | `string \| null` | datetime |
| `priority` | `string` | |
| `story_points` | `number \| null` | |
| `labels` | `string[]` | `[]` |
| `start_date` | `string \| null` | |
| `deadline` | `string \| null` | |
| `assigned_to` | `string \| null` | |
| `testing_assigned_to` | `string[]` | `[]` |
| `testing_status` | `string \| null` | |
| `progress_percent` | `number` | `0` |
| `created_by` | `string` | |
| `created_at` | `string` | |

## `Project*`

### `ProjectCreate`

| Field | TS type | Default |
|-------|---------|---------|
| `client_id` | `string` | UUID required |
| `name` | `string` | |
| `description` | `string \| null` | |
| `budget` | `number \| null` | |
| `deadline` | `string \| null` | date |
| `status` | `"planning" \| "active" \| "on_hold" \| "completed"` | `"planning"` |
| `team_user_ids` | `string[]` | `[]` |

### `ProjectUpdate`

| Field | TS type |
|-------|---------|
| `name` | `string \| null` |
| `description` | `string \| null` |
| `budget` | `number \| null` |
| `deadline` | `string \| null` |
| `status` | `"planning" \| "active" \| "on_hold" \| "completed" \| null` |

### `ProjectTeamUpdate`

| Field | TS type |
|-------|---------|
| `user_ids` | `string[]` |

### `ProjectOut`

| Field | TS type |
|-------|---------|
| `id` | `string` |
| `organization_id` | `string` |
| `client_id` | `string` |
| `name` | `string` |
| `description` | `string \| null` |
| `budget` | `number \| null` |
| `deadline` | `string \| null` |
| `status` | `string` |
| `created_by` | `string` |
| `created_at` | `string` |

Also in schemas (modules often used with projects):

### `ProjectModuleCreate` / `Update` / `Out` / `Reorder`

- Create: `name`, `icon` default `"🧩"`, `description`, `status` `"locked" \| "in_progress" \| "completed"` default `"locked"`
- Out: `id`, `organization_id`, `project_id`, `name`, `icon`, `description`, `status`, `order`, `created_by`, `created_at`
- Reorder: `ordered_ids: string[]`

## `Document*`

### `DocumentOut`

| Field | TS type | Default |
|-------|---------|---------|
| `id` | `string` | |
| `organization_id` | `string` | |
| `project_id` | `string \| null` | |
| `filename` | `string` | |
| `uploaded_by` | `string` | |
| `uploaded_at` | `string` | |
| `chunk_count` | `number` | `0` |

### `ReindexResult`

| Field | TS type |
|-------|---------|
| `document_id` | `string` |
| `filename` | `string` |
| `chunks_indexed` | `number` |
| `status` | `string` |

## `WeeklyReport*`

### `WeeklyReportOut`

| Field | TS type |
|-------|---------|
| `id` | `string` |
| `organization_id` | `string` |
| `project_id` | `string` |
| `report_text` | `string` |
| `created_at` | `string` |

## `Meeting*`

### `MeetingUploadResponse`

| Field | TS type |
|-------|---------|
| `id` | `string` |
| `status` | `string` |

### `MeetingSummaryOut`

| Field | TS type |
|-------|---------|
| `id` | `string` |
| `project_id` | `string` |
| `status` | `string` |
| `transcript` | `string \| null` |
| `summary` | `string \| null` |
| `action_items` | `string[] \| null` |
| `risks` | `string[] \| null` |
| `deadlines` | `string[] \| null` |
| `created_at` | `string` |

### `MeetingOut` (legacy fuller shape)

| Field | TS type | Default |
|-------|---------|---------|
| `id` | `string` | |
| `organization_id` | `string` | |
| `project_id` | `string` | |
| `uploaded_by` | `string` | |
| `audio_file_url` | `string` | |
| `transcript` | `string \| null` | |
| `summary` | `string \| null` | |
| `action_items` | `string[]` | `[]` |
| `risks` | `string[]` | `[]` |
| `deadlines` | `string[]` | `[]` |
| `status` | `string` | |
| `created_at` | `string` | |

Shared UI meeting status meta: `"processing"` / `"done"` / `"failed"`.

## `Requirement*`

### `StoryOut`

| Field | TS type | Default |
|-------|---------|---------|
| `title` | `string` | |
| `description` | `string` | |
| `priority` | `"low" \| "medium" \| "high"` | `"medium"` |

### `EpicOut`

| Field | TS type | Default |
|-------|---------|---------|
| `title` | `string` | |
| `stories` | `StoryOut[]` | `[]` |

### `RequirementAnalysisOut`

| Field | TS type | Default |
|-------|---------|---------|
| `epics` | `EpicOut[]` | `[]` |

### `RequirementAnalyzeRequest`

| Field | TS type |
|-------|---------|
| `document_id` | `string` |
| `project_id` | `string` |

### `RequirementAnalysisResult`

| Field | TS type |
|-------|---------|
| `id` | `string` |
| `project_id` | `string` |
| `document_id` | `string \| null` |
| `status` | `string` |
| `breakdown` | `RequirementAnalysisOut` |
| `created_at` | `string` |

### `RequirementReviewApproveRequest`

| Field | TS type | Default |
|-------|---------|---------|
| `epics` | `EpicOut[]` | `[]` |

### `RequirementApproveResponse`

| Field | TS type |
|-------|---------|
| `analysis_id` | `string` |
| `task_ids` | `string[]` |

## `ClientDashboardOut`

| Field | TS type |
|-------|---------|
| `project_id` | `string` |
| `project_name` | `string` |
| `status` | `string` |
| `deadline` | `string \| null` |
| `progress_percent` | `number` |
| `milestone_info` | `string` |
| `documents` | `DocumentOut[]` |

Client UI may also attach (not in schema): `module_progress_percent`, `module_count`, `completed_module_count`.

## `Chat*`

### `ChatQuery`

| Field | TS type | Default |
|-------|---------|---------|
| `message` | `string` | required |
| `document_ids` | `string[] \| null` | UUID list; null = all accessible |
| `project_id` | `string \| null` | UUID |

### `ChatResponse`

| Field | TS type |
|-------|---------|
| `answer` | `string` |

## `Token`

| Field | TS type | Default |
|-------|---------|---------|
| `access_token` | `string` | |
| `token_type` | `string` | `"bearer"` |
| `user` | `UserOut` | |

---

## Session keys (client + shared docs)

| Key | Meaning |
|-----|---------|
| `client_nav_radio` | Client sidebar page |
| `client_project_selector` | Dashboard project filter |
| `client_doc_uploader_key` | Client upload widget reset counter |
| `doc_uploader_key` | Shared documents upload reset counter |
| `access_token` | Auth token (`session_token`) |
| `user` | Current user (`session_user`) |

---

*End of extraction.*
