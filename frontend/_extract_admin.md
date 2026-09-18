# Admin View Extraction — React Conversion Spec

Source: `streamlit_app/views/admin.py`  
Generated for exhaustive React port. Hex colors and UI strings are literal.

---

## 0. Shared constants (exact)

### `STATUS_META` (task statuses)

| key | label | icon | color |
|-----|-------|------|-------|
| `todo` | `To Do` | `🔵` | `#3B82F6` |
| `in_progress` | `In Progress` | `🟠` | `#F59E0B` |
| `testing` | `Testing` | `🟣` | `#8B5CF6` |
| `done` | `Done` | `🟢` | `#22C55E` |

### `PROJECT_STATUS_META` (order drives legend/pie)

| key | label | color |
|-----|-------|-------|
| `completed` | `Completed` | `#22C55E` |
| `active` | `In Progress` | `#3B82F6` |
| `on_hold` | `On Hold` | `#F59E0B` |
| `planning` | `Not Started` | `#EF4444` |

`PROJECT_STATUS_OPTIONS = ["planning", "active", "on_hold", "completed"]`

### `CLIENT_STATUS_META`

| key | icon | color |
|-----|------|-------|
| `active` | `🟢` | `#22C55E` |
| `pending` | `🟡` | `#EAB308` |
| `inactive` | `⚪` | `#6B7280` |

`CLIENT_STATUS_OPTIONS = ["active", "pending", "inactive"]`

Fallback client status meta: `{"icon": "⚪", "color": "#6B7280"}`  
Fallback project status meta: `{"label": <raw status or "—">, "color": "#6B7280"}`

### Session / nav keys

- `NAV_RADIO_KEY = "admin_nav_radio"`
- Session gate: if no `token` or `user` → error `"Your session expired. Please log in again."` + button `"Back to login"` (`key="admin_back_to_login"`) clears session and reruns.

---

## 1. Full literal CSS — `_inject_light_theme`

Joined with newlines and injected via `st.markdown(..., unsafe_allow_html=True)`.

```css
<style>
.stApp { background: #F7F8FA; }
[data-testid='stHeader'] { background-color: #F8F9FF !important; }
[data-testid='stToolbar'] { background-color: transparent !important; }
[data-testid='stDecoration'] { background-image: none !important; background-color: #F8F9FF !important; }
[data-testid='stAppViewContainer'] { background-color: #F8F9FF !important; }
[data-testid='stMain'] { background-color: transparent !important; }
[data-testid='stStatusWidget'] { background-color: #FFFFFF !important; }
[data-testid='stStatusWidget'] * { color: #111827 !important; }
.block-container { padding-top: 1.5rem; padding-bottom: 3rem; }

h1, h2, h3, h4, h5, h6, p, span, label, li, div, .stMarkdown { color: #111827 !important; }
[data-testid='stMarkdownContainer'], [data-testid='stMarkdownContainer'] * { color: #111827 !important; }
[data-testid='stHeadingWithActionElements'], [data-testid='stHeadingWithActionElements'] * { color: #111827 !important; }
.stCaption, [data-testid='stCaptionContainer'], [data-testid='stCaptionContainer'] * { color: #4B5563 !important; font-weight: 500; }
[data-testid='stWidgetLabel'] p { color: #111827 !important; }

section[data-testid='stSidebar'] {
    background: #FFFFFF;
    border-right: 1px solid #EEF0F3;
}
section[data-testid='stSidebar'] * { color: #374151 !important; }
section[data-testid='stSidebar'] code {
    background: #E0E7FF !important;
    color: #312E81 !important;
    border: 1px solid #C7D2FE !important;
    border-radius: 5px !important;
    padding: 2px 6px !important;
}

section[data-testid='stSidebar'] div[role='radiogroup'] {
    display: flex; flex-direction: column; gap: 2px;
}
section[data-testid='stSidebar'] div[role='radiogroup'] label {
    background-color: transparent; border: none; border-radius: 8px;
    padding: 9px 12px !important; margin: 0 !important; cursor: pointer;
}
section[data-testid='stSidebar'] div[role='radiogroup'] label:hover {
    background-color: #F3F4F6;
}
section[data-testid='stSidebar'] div[role='radiogroup'] label:has(input:checked) {
    background-color: #EEF2FF !important;
    border-left: 3px solid #4F46E5 !important;
}
section[data-testid='stSidebar'] div[role='radiogroup'] label:has(input:checked),
section[data-testid='stSidebar'] div[role='radiogroup'] label:has(input:checked) p,
section[data-testid='stSidebar'] div[role='radiogroup'] label:has(input:checked) span {
    color: #312E81 !important; font-weight: 600;
}
/* Hide the radio indicator; the whole navigation row remains clickable. */
section[data-testid='stSidebar'] div[role='radiogroup'] label > div:first-child { display: none !important; }

div[data-testid='stVerticalBlockBorderWrapper'] {
    background-color: #FFFFFF !important;
    border: 1px solid #EEF0F3 !important;
    border-radius: 14px !important;
    box-shadow: 0 1px 2px rgba(16,24,40,0.04);
    padding: 0.35rem;
}

div[data-testid='stMetricValue'] { font-weight: 700; color: #111827 !important; }
div[data-testid='stMetricLabel'] { color: #6B7280 !important; }

.stButton button {
    background-color: #FFFFFF; color: #374151;
    border: 1px solid #E5E7EB; border-radius: 8px;
}
.stButton button:hover { border-color: #4F46E5; color: #4338CA; }
.stButton button[kind='primary'] {
    background-color: #4F46E5; color: #FFFFFF !important; border: 1px solid #4F46E5;
}
.stButton button[kind='primary']:hover { background-color: #4338CA; border-color: #4338CA; }
.stButton button[kind='primary'] p { color: #FFFFFF !important; }
.stButton button p, .stButton button span { color: inherit !important; }
.stButton button[kind='primary'] p, .stButton button[kind='primary'] span { color: #FFFFFF !important; }
/* Download controls and document previews must stay light/readable. */
.stDownloadButton button {
    background-color: #FFFFFF !important; color: #374151 !important;
    border: 1px solid #E5E7EB !important; border-radius: 8px !important;
}
.stDownloadButton button:hover { border-color: #4F46E5 !important; color: #4338CA !important; }
.stDownloadButton button * { color: inherit !important; }
[data-testid='stCodeBlock'], [data-testid='stCodeBlock'] pre, pre, code {
    background-color: #FFFFFF !important; color: #111827 !important;
    border: 1px solid #E5E7EB !important; border-radius: 8px !important;
}
[data-testid='stJson'], [data-testid='stJson'] * { background-color: #FFFFFF !important; color: #111827 !important; }
[data-testid='stText'] pre { background-color: #FFFFFF !important; color: #111827 !important; }
[data-testid='stDialog'], [data-testid='stDialog'] > div { background-color: #FFFFFF !important; }
[data-testid='stDialog'] * { color: #111827 !important; }
iframe, [data-testid='stImage'] { background-color: #FFFFFF !important; border-radius: 8px !important; }
/* Forms and uploader panels: never inherit a dark browser surface. */
div[data-testid='stAlert'] { background-color: #F9FAFB !important; border-radius: 10px !important; }
div[data-testid='stAlert'] * { color: #111827 !important; }
[data-testid='stFileUploaderDropzone'] { background-color: #F9FAFB !important; border: 1px dashed #D1D5DB !important; }
[data-testid='stFileUploaderDropzone'] * { color: #374151 !important; }
[data-testid='stFileUploaderFile'] { background-color: #FFFFFF !important; border: 1px solid #E5E7EB !important; border-radius: 8px !important; }
[data-testid='stFileUploaderFile'] * { color: #111827 !important; }
[data-testid='stFileUploaderDropzone'] button, [data-testid='stFileUploader'] button { background-color: #FFFFFF !important; color: #374151 !important; border: 1px solid #E5E7EB !important; }
.stTextInput input, .stTextArea textarea { background-color: #FFFFFF !important; color: #111827 !important; border-color: #E5E7EB !important; }

.stProgress > div > div > div > div { border-radius: 6px; }
.stProgress > div > div { background-color: #F3F4F6; border-radius: 6px; }

[data-testid='stDataFrame'] { color: #111827 !important; }

.icon-badge {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.25rem; margin-bottom: 0.5rem;
}
.status-pill {
    display: inline-block; padding: 2px 10px; border-radius: 999px;
    font-size: 0.75rem; font-weight: 600;
}

div[data-testid='stExpander'] {
    border: 1px solid #EEF0F3 !important;
    border-radius: 14px !important;
    background-color: #FFFFFF !important;
}
hr { border-color: #EEF0F3 !important; }

div[data-baseweb='popover'] { z-index: 999999 !important; }
div[data-baseweb='popover'] div[data-baseweb='menu'],
div[data-baseweb='popover'] ul[role='listbox'] {
    background-color: #FFFFFF !important;
    border: 1px solid #E5E7EB !important;
    border-radius: 10px !important;
    box-shadow: 0 8px 24px rgba(16,24,40,0.14) !important;
    padding: 4px !important;
}
div[data-baseweb='popover'] li[role='option'],
div[data-baseweb='popover'] li {
    background-color: #FFFFFF !important; color: #111827 !important; border-radius: 6px !important;
}
div[data-baseweb='popover'] li[role='option']:hover,
div[data-baseweb='popover'] li:hover {
    background-color: #F3F4F6 !important; color: #111827 !important;
}
div[data-baseweb='popover'] li[aria-selected='true'] {
    background-color: #EEF2FF !important; color: #4338CA !important; font-weight: 600;
}
div[data-baseweb='popover'] li[role='option'] * { color: inherit !important; }

div[data-baseweb='select'] > div {
    background-color: #FFFFFF !important; border-color: #E5E7EB !important;
    color: #111827 !important; border-radius: 8px !important;
}
div[data-baseweb='select'] > div:hover { border-color: #4F46E5 !important; }
div[data-baseweb='select'] input { color: #111827 !important; }
div[data-baseweb='select'] svg { fill: #6B7280 !important; }
div[data-baseweb='select'] span { color: #111827 !important; }

span[data-baseweb='tag'] {
    background-color: #EEF2FF !important; color: #4338CA !important; border-radius: 6px !important;
}
span[data-baseweb='tag'] span { color: #4338CA !important; }
span[data-baseweb='tag'] svg { fill: #4338CA !important; }

div[data-baseweb='calendar'] { background-color: #FFFFFF !important; }
div[data-baseweb='calendar'] * { color: #111827 !important; }
</style>
```

### Theme color palette summary (from light theme)

| Token / use | Hex / value |
|-------------|-------------|
| App bg | `#F7F8FA` |
| Header / view container bg | `#F8F9FF` |
| Sidebar / card / white surfaces | `#FFFFFF` |
| Primary text | `#111827` |
| Caption / muted | `#4B5563` |
| Secondary / sidebar text | `#374151` |
| Metric label / gray | `#6B7280` |
| Soft border | `#EEF0F3` |
| Input/button border | `#E5E7EB` |
| Hover gray bg | `#F3F4F6` |
| Indigo selected nav bg | `#EEF2FF` |
| Indigo accent / primary | `#4F46E5` |
| Indigo hover / selected text | `#4338CA` / `#312E81` |
| Code chip bg/border | `#E0E7FF` / `#C7D2FE` |
| Alert / dropzone bg | `#F9FAFB` |
| Dashed dropzone border | `#D1D5DB` |
| Card shadow | `0 1px 2px rgba(16,24,40,0.04)` |
| Popover shadow | `0 8px 24px rgba(16,24,40,0.14)` |

---

## 1b. Full literal CSS — `_inject_dashboard_hover_css`

```css
<style>
div[class*="st-key-dash-stat-"] {
    background-color: #FFFFFF !important;
    border: 1.5px solid #D8DCE5 !important;
    border-radius: 14px !important;
    box-shadow: 0 2px 6px rgba(16,24,40,0.08) !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease,
                border-color 0.15s ease, background-color 0.15s ease;
    cursor: pointer;
}
div[class*="st-key-dash-stat-"]:hover {
    background-color: #F5F3FF !important;
    border-color: #818CF8 !important;
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(79,70,229,0.22) !important;
}
</style>
```

Keys used: `dash-stat-0` … `dash-stat-3` (Streamlit class `st-key-dash-stat-*`).

### Extra CSS — Recent Activities strip (inline in dashboard)

```css
.activity-scroll {
    display:flex; gap:12px; overflow-x:auto; padding:4px 4px 10px 4px;
    scroll-behavior:smooth;
}
.activity-card {
    min-width:160px; flex:0 0 auto; background:#FFFFFF;
    border:1px solid #E5E7EB; border-radius:10px; padding:12px;
}
.activity-arrow {
    flex:0 0 auto; display:flex; align-items:center; justify-content:center;
    width:40px; min-width:40px; border-radius:10px; background:#EEF2FF;
    font-size:1.3rem; color:#4F46E5; font-weight:700;
}
.activity-scroll::-webkit-scrollbar { height:6px; }
.activity-scroll::-webkit-scrollbar-thumb { background:#D8DCE5; border-radius:6px; }
```

Activity card text colors: title `#111827` `0.9rem`; tag `#6B7280` `0.78rem`; icon `1.3rem`. Arrow char: `&#8594;` (`→`), title `Scroll for more`.

### Extra CSS — Projects page vertical divider

```css
div[class*="st-key-projects-all-col"] {
    border-left: 1px solid #EEF0F3;
    padding-left: 1.25rem;
}
```

---

## 2. `render_admin_app` — nav items

Sidebar caption: `"MANAGEMENT"`  
Radio label: `"Go to"` (collapsed)  
Key: `admin_nav_radio`  
Default: first page if session value not in `NAV_PAGES`.

| Order | Emoji | Label | Full page string (key) | Handler |
|------:|-------|-------|------------------------|---------|
| 1 | `🏠` | `Dashboard` | `🏠 Dashboard` | `_render_admin_dashboard` |
| 2 | `🏢` | `Clients` | `🏢 Clients` | `_render_admin_clients` |
| 3 | `📁` | `Projects` | `📁 Projects` | `_render_admin_projects` |
| 4 | `📄` | `Documents` | `📄 Documents` | `_render_admin_documents` |
| 5 | `🎙️` | `Meetings` | `🎙️ Meetings` | `_render_admin_meetings` |
| 6 | `📊` | `Weekly Reports` | `📊 Weekly Reports` | `_render_admin_weekly_reports` |
| 7 | `🧠` | `Requirement Analyzer` | `🧠 Requirement Analyzer` | `_render_admin_requirement_analyzer` |

`IMPLEMENTED_PAGES` equals `NAV_PAGES` (all implemented).  
Not in nav (exists in file): `_render_admin_users_roles`, `_render_admin_tasks`, `_render_coming_soon`.

On mount: `_inject_light_theme()` then sidebar + page route.

---

## 3. Page extractionsetails

---

### 3.1 `_render_admin_dashboard`

**Title / header**

- Columns `[6, 2, 1]`: title | date | avatar
- Title: `Good {Morning|Afternoon|Evening}, {firstName}! 👋`
  - Morning if `hour < 12`, Afternoon if `hour < 18`, else Evening
- Caption: `Here's an overview of the system and organization performance.`
- Date (right): `📅 {strftime('%B %d, %Y')}` — style `text-align:right; padding-top:10px; color:#6B7280; font-weight:600;`
- Avatar: `st.badge(initials, color="violet")` — initials from first 2 name parts uppercase

**Inject:** `_inject_dashboard_hover_css()`

**API calls (all with token)**

| Call | On fail |
|------|---------|
| `get_clients(token)` | `show_api_error` |
| `get_projects(token)` | `show_api_error` |
| `get_tasks(token)` | `show_api_error` |
| `list_documents(token)` | `show_api_error` |
| `get_users(token)` | `show_api_error` |
| Per selected project(s): `get_project_modules(token, str(project["id"]))` | `show_api_error`, skip |

Empty JSON lists if status ≠ 200.

#### Stat cards row — 4 columns

| i | icon | bg | label | value | sublabel | key |
|---|------|-----|-------|-------|----------|-----|
| 0 | `👥` | `#EDE9FE` | `Total Clients` | `len(clients)` | `Active Clients` | `dash-stat-0` |
| 1 | `📁` | `#DBEAFE` | `Total Projects` | `len(projects)` | `Active Projects` | `dash-stat-1` |
| 2 | `👤` | `#EDE9FE` | `Total Members` | `len(users)` | `Team Members` | `dash-stat-2` |
| 3 | `📄` | `#FEE2E2` | `Documents` | `len(documents)` | `Uploaded Files` | `dash-stat-3` |

Uses `_hover_stat_card(...)`.

#### Card: Projects by Status (bordered)

- Subheader: `Projects by Status`
- Caption: `Distribution of projects across different status.`
- Empty: `No projects yet.`
- Count logic: default missing status → `planning`; unknown → `planning`
- Columns `[1.1, 1.3]`: donut | legend
- Donut: `_donut(labels, values, colors, str(total), "Projects", height=260)`
  - Pie hole `0.68`, white slice line `#FFFFFF` width `3`, no legend, clockwise, `sort=False`
  - Center: bold `#111827` 26px total; subtitle `#6B7280` 12px `"Projects"`
  - Chart key: `admin_project_status_donut`
- Legend row: `_color_dot(color)` + label + float-right `{val} ({pct}%)` color `#6B7280`
- Button: `View all projects →` key `admin_dash_view_projects` → `_go_to("📁 Projects")` + rerun

#### Card: Overall System Overview (bordered)

- Subheader: `Overall System Overview`
- Caption: `Module completion across projects — pick a project to filter, or view all.`
- Selectbox: `📁 Filter by project` options `["All Projects"] + project names` key `admin_overview_project_filter`
- Empty modules: `No project modules yet for this selection.`
- Columns `[2, 1]`: list | ring
- Completed list header: `**Completed · {n}**`
  - Bullet color `#6D28D9`: `●` + `{project_name} · {module.name}`
  - Empty: `No completed modules.`
- Todo list header: `**To Do · {n}**`
  - Bullet color `#9CA3AF`
  - Empty: `No modules left to complete.`
- Ring: `_progress_ring(complete_pct, "#6D28D9")` key `admin_overall_module_ring`
  - Remaining track color `#F1F5F9`, hole `0.75`, white line width `2`
  - Center: `{pct}%` + `Overall Progress`
- Caption under ring: `{completed} of {total} modules complete`
- Module complete = `status == "completed"`; else todo

#### Card: Recent Activities (bordered)

- Subheader: `Recent Activities`
- Caption: `Latest activity recorded across the platform.`
- Build up to ~6 items:
  - Latest 3 tasks (by `created_at` or `id`): icon `✅`, text `Task **{title}**`, tag = status label
  - Latest 2 docs: icon `📄`, text `Document **{filename}**`, tag `Uploaded`
  - Latest 1 project: icon `📁`, text `Project **{name}**`, tag `Created`
- Empty: `No recent activity yet.`
- Footer caption: `Reflects the latest records returned by the API — add timestamps to your API for exact times.`

#### System Users | Documents — 2 columns

**System Users** (bordered)

- Subheader: `System Users`
- Caption: `Managers, employees, and clients — excluding admins.`
- Metrics 3-col: `Managers` / `Employees` / `Clients` counts (`_split_staff`; clients from clients list)
- Scroll height 220
- Selectbox: `🔎 Select category` options `["Managers", "Employees", "Clients"]` key `admin_dash_user_category`
- Card HTML per record: bg `#FFFFFF`, border `#E5E7EB`, radius `10px`, pad `10px 12px`, margin-bottom `8px`
  - Title `#111827` weight 600; sub `#6B7280` `0.82rem`
  - Clients: `{company_name} — ID: {id}` / `{contact_name} · {email}`
  - Users: `{name} — ID: {id}` / `{email}`
- Empty: `No {category.lower()} yet.`

**Documents** (bordered)

- Subheader: `Documents`
- Caption: `All uploaded files across projects.`
- Scroll height 280
- Empty: `No documents uploaded yet.`
- Card: `📄 {filename}` same card styles as users

---

### 3.2 `_render_admin_users_roles` (not in sidebar nav)

**Title:** `👤 Users & Roles`  
**Caption:** `Breakdown of every non-admin user by role.`

**API:** `_fetch_users_safely(token)` → `get_users`

**Layout**

- 2 columns stat cards:
  - `👤` `#EDE9FE` `Total Users` / `Including admins`
  - `🧑‍🤝‍🧑` `#DBEAFE` `Team Members` / `Excluding admins`
- Bordered `By Role`:
  - `role_colors = ["#3B82F6", "#22C55E", "#F97316", "#EC4899", "#EAB308", "#8B5CF6"]` (cycle)
  - Row columns `[3, 1]`: `**{Role.title()}**` + progress `count/len(team_users)` | `**{count}**`
  - Selectbox: `View names by role` key `admin_users_role_filter`
  - Caption: `**{Role}** ({count}):`
  - List: `- {name} · {email}`

**Messages:** `No users found.` / `No non-admin team members yet.`

---

### 3.3 `_render_admin_clients`

**Title:** `🏢 Clients`  
**Caption:** `View, add, edit, and delete your organization's client accounts.`

**API:** `get_clients(token)` (required; return on fail)

#### Stat cards — 4 columns

| icon | bg | label | value | sub |
|------|-----|-------|-------|-----|
| `🏢` | `#EDE9FE` | `Total Clients` | len | `All clients` |
| `🟢` | `#DCFCE7` | `Active` | active_n | `Active clients` |
| `🟡` | `#FEF9C3` | `Pending` | pending_n | `Pending clients` |
| `⚪` | `#F3F4F6` | `Inactive` | inactive_n | `Inactive clients` |

#### Card: Client Overview

- Subheader: `Client Overview`
- Donut columns `[1.3, 1]`: labels = status `.title()`, colors via `_client_status_meta`
- Center: `str(len(clients))` / `Total Clients`
- Chart key: `admin_client_status_donut`
- Legend: `**{Status}**  **{pct}%**  {dot}  ({count})` count color `#9CA3AF` `0.8rem`
- Selectbox: `🏢 All Clients` options `["All Clients"] + company_names` key `admin_client_overview_filter`
- All Clients list (height 220): company bold; line with dot + `{icon} {status} · {contact} · {email}` color `#4B5563` `0.82rem` weight 500
- Single client: 3 cols Status (`_pill` with icon+status) / Contact / Email; caption `📞 {phone}`

**Empty clients:** `No clients found for your organization yet. Add one below.`

#### Expander: `🔎 Client Details`

- Selectbox: `🏢 Select client` key `admin_client_detail_select`
- Same 3-col detail + phone as overview single

#### Expander: `➕ Add client`

Form `admin_add_client_form` clear_on_submit:

| Field | Widget |
|-------|--------|
| `Company name` | text |
| `Contact name` | text |
| `Email` | text |
| `Phone` | text |
| `Status` | select `CLIENT_STATUS_OPTIONS` |
| `👁 Show password` | checkbox key `admin_add_client_show_pw` |
| `Client login password (optional)` | text password/default key `admin_add_client_password` |

Submit: `Add client` primary  
Validation: `Company name is required.` / `Contact name is required.`  
API: `create_client(token, payload)` success 200/201 → `Client **{company}** added.`  
Payload keys: `company_name`, `contact_name`, `email`, `phone`, `status`, optional `password`

#### Expander: `✏️ Edit client`

- Select: `Select client to edit` labels `{company} ({id})` key `admin_edit_client_select`
- Caption: `Current status: {icon} {status.title()}`
- Form `admin_edit_client_form`: same fields (no password)
- Submit: `Update client` → `update_client` → `Client updated.`

#### Expander: `🗑️ Delete client`

- Select by id key `admin_delete_client_select`
- Caption: `This will permanently remove **{company}**.`
- Checkbox: `I confirm deletion` key `admin_delete_client_confirm`
- Button: `Delete client` primary disabled unless confirm → `delete_client` success 200/204 → `Client deleted.`

---

### 3.4 `_render_admin_projects`

**Title:** `📁 Projects`  
**Caption:** `View, create, edit projects, and assign project teams.`

**API:** `get_projects(token)` required; later `get_users`, `get_clients`, `get_team`, `create_project`, `update_project`, `assign_team`

#### Stat cards — 3 columns

| icon | bg | label | value | sub |
|------|-----|-------|-------|-----|
| `📁` | `#DBEAFE` | `Total Projects` | len | `All projects` |
| `🟢` | `#DCFCE7` | `Active` | active_n | `In progress` |
| `✅` | `#EDE9FE` | `Completed` | completed_n | `Finished` |

#### Card: Recent | All (2 columns)

**🕓 Recent Projects**

- Caption: `Most recently created projects, newest first.`
- Top 5 by `created_at` or `id` desc; scroll height 280
- Each bordered: columns `[3, 1.3, 1.3]` name | `_pill(status label, color)` | `📅 {deadline}`
- Empty: `No projects yet.`

**📋 All Projects** (container key `projects-all-col` + left border CSS)

- Caption: `Every project in your organization.`
- Dataframe columns: `Name`, `Status` (mapped label), `Budget`, `Deadline`

Then expander Project Details (see 3.5).

#### Expander: `➕ Create project`

Form `admin_create_project_form`:

| Field | Notes |
|-------|-------|
| `Client` | select company names or `"(no clients)"` key `admin_create_project_client` |
| `Project name` | text |
| `Description` | textarea |
| `Budget` | number min 0 step 100 |
| `Status` | `PROJECT_STATUS_OPTIONS` |
| `Deadline` | date, value None |
| `Project managers` | multiselect format `_user_option_label` key `admin_create_project_managers` |
| `Employees (optional)` | multiselect key `admin_create_project_employees` |

Captions: `Tip: if you leave managers empty, all org managers are auto-assigned.` / `Could not load users — org managers will still be auto-assigned.`  
Submit `Create project`  
Errors: `Create a client first, then create the project.` / `Project name is required.`  
API `create_project` payload:

```python
{
    "client_id": client_options[client_name],
    "name": name.strip(),
    "description": description.strip() or None,
    "budget": float(budget) if budget else None,
    "deadline": str(deadline) if deadline else None,
    "status": status,
    "team_user_ids": [manager ids + employee ids],
}
```

Success: `Project created and connected to the selected team.`

#### Expander: `✏️ Edit project`

- Select `{name} ({id})` key `admin_edit_project_select`
- Form: Project name, Status, Deadline (parse `%Y-%m-%d` from existing)
- Submit `Update project` → payload `{name, status, deadline}` → `Project updated.`

#### Card: `👥 Assign / update project team`

- Caption: `Connect managers and employees to a project so they share its tasks and documents.`
- Infos: `Create a project first...` / `Could not load users — team assignment needs /users access.`
- Selectbox `Project` key `admin_assign_team_project_select`
- API `get_team` for preselected ids
- Multiselect `Project team (managers + employees)` key `admin_assign_team_multiselect`
- Button `Save team members` → `assign_team(token, project_id, user_ids)` success 200/201/204 → `Team updated for **{name}**.`

---

### 3.5 `_render_project_detail_section(projects, token)`

**Subheader:** `🔎 Project Details`  
**Empty:** `No projects yet — create one from the form below.`

**Select:** `📁 Select project` key `admin_project_detail_select`

**API**

| Call | Scope |
|------|-------|
| `get_tasks(token, project_id=project_id)` | tasks |
| `list_documents(token, project_id=project_id)` | docs |
| `get_team(token, project_id)` | team |

**Top row 3 columns**

1. Caption `Status` → `_pill(meta["label"], meta["color"])`
2. Caption `Deadline` → `**{deadline or '—'}**` optional `  ·  {days_left}d left`
3. Caption `Tasks` → `**{len(scoped_tasks)}**`

**Progress:** `st.progress(pct/100, text=f"{pct}% · {done}/{total} tasks done")` or caption `No linked tasks yet for this project.`

**2 columns**

- `**📄 Documents**` — up to 5 filenames `- {filename}`; empty `No documents for this project.`
- `**👥 Team**` — `- {name} · `{role}``; empty `No team members linked to this project yet.`

Used inside Projects expander `🔎 Project Details` with `expanded=True`.

---

### 3.6 `_render_admin_tasks` (not in sidebar nav)

**Title:** `✅ Tasks`

**API:** `get_projects`, `get_tasks`, `patch_task_status`, `create_task`, `update_task`, `delete_task`, `_fetch_users_safely`

**Kanban:** columns per non-empty status in `STATUS_META` order  
Header: `**{icon} {label}** · {count}`  
Card: title, optional description caption  
If not done: button `Move to {next_label} →` key `admin_move_{id}` → patch next status in order todo→in_progress→testing→done

**Create form** `admin_create_task_form`: Project, Assign to (employee) with `Unassigned`, Title, Description, Status (STATUS_META labels)  
Submit `Create task` — errors `Title is required.` / `Select a project for this task.`

**Edit expander** `✏️ Edit task`: select `{title} ({id})`, form update title/desc/status/assignee → `Task updated.`

**Delete expander** `🗑️ Delete task`: confirm checkbox `I confirm deletion`, button `Delete task` → 200/204 `Task deleted.`

---

### 3.7 `_render_admin_documents`

**Title:** `📄 Documents`

**API:** `get_projects`, `upload_document`, `list_documents`, `download_document`, `delete_document`; helpers `rag_status_label`, `show_document_preview`

#### Card: `⬆️ Upload a document`

- Empty projects: `No projects available to upload into yet.`
- Form `admin_upload_document_form`: Project select key `admin_upload_project_select`; file uploader key `admin_doc_uploader_{n}` (session counter `admin_doc_uploader_key`)
- Submit `Upload` primary
- Warn: `Please choose a file first.`
- Success with chunks: `Uploaded to **{label}** and indexed for AI Chat ({n} chunk(s)).`
- Success no chunks: `Uploaded to **{label}**. No text extracted — use Reindex or a PDF/DOCX/PPTX/TXT file.`

#### Card: `All Documents`

- Caption: `Upload PDF/DOCX/PPTX/TXT to enable chat RAG. Files are indexed on upload.`
- Filter selectbox: `📁 Filter by project` `["All Documents"] + names` key `admin_documents_project_filter`
- Empty filter: `No documents for this selection.` / overall `No documents uploaded yet.`
- Row columns `[3, 1, 1, 1]`:
  - `📄 **{filename}**` + `rag_status_label(doc)` caption
  - Download button `Download` mime `application/octet-stream` key `admin_dl_{id}`
  - `Preview` key `admin_view_{id}` → `show_document_preview`
  - `Delete` key `admin_del_{id}` → `delete_document` success **204** → `Document deleted.`
- Divider between rows

---

### 3.8 `_render_admin_meetings`

**Title:** `🎙️ Meeting Summaries`  
**Caption:** `Read-only view across every project in your organization.`  
**API:** `get_projects(token)` then `render_meeting_panel(token=token, projects=projects, allow_upload=False, key_prefix="admin")`

---

### 3.9 `_render_admin_weekly_reports`

**Title:** `📊 Weekly Reports`  
**Caption:** `Generate and review AI-powered weekly progress reports for any project.`

**API:** `get_projects` → select Project key `admin_weekly_report_project`  
Button `Generate Weekly Report` primary key `admin_generate_weekly_report` + spinner `Generating report...` → `generate_weekly_report` → success `Report generated successfully.` + markdown `report_text`  
Subheader `Past Reports` → `get_weekly_reports`  
Empty: `No reports yet for this project.` / `No projects found. Create a project first.`  
Expander label: `Report — {created_at[:16] with T→space}`

---

### 3.10 `_render_admin_requirement_analyzer`

**Title:** `🧠 Requirement Analyzer`  
**Caption:** `Analyze an existing project document into epics, user stories, and tasks.`  
(Note: intentionally no uploader.)

**Flow**

1. `get_projects` — empty: `No projects found. Create a project and add a requirement document first.`
2. Select Project key `admin_requirement_project`
3. `list_documents(token, project_id=...)` — warn: `No documents are available for this project yet.`
4. Select `Requirement document` labels `{filename} ({id[:8]})` key `admin_requirement_document`
5. Button `Analyze Requirements` primary key `admin_analyze_requirement` spinner `Analyzing requirement document with AI...` → `analyze_requirement(token, document_id, project_id)` → session `admin_requirement_analysis`, clear `admin_requirement_edited`, success `Analysis is ready for review.`
6. No analysis: `Choose an existing document and click Analyze Requirements.`
7. If status `approved`/`rejected`: `This analysis was {status}.`
8. Edit: session `admin_requirement_edited` = `analysis.breakdown.epics`
9. Subheader `Review & Edit Epics / Stories`
   - Per epic bordered: `Epic {i}` text; per story `Story {i}.{j}` title, `Description` textarea, `Priority` `["low","medium","high"]` default medium
10. 2 columns:
    - `Approve & Create Tasks` primary → `approve_requirement_analysis(token, analysis["id"], edited_epics)` → `Analysis approved and tasks created.`
    - `Reject` → `reject_requirement_analysis` → `Analysis rejected. No tasks were created.`

---

### 3.11 `_render_coming_soon(page_label)`

- Title = full page_label
- Info: `**{label without emoji}** isn't wired up to your API yet — add the corresponding endpoint(s) in \`api_client.py\` and this page can be built out.`

---

## 4. Full source — UI helpers (copyable)

### `_icon_badge`

```python
def _icon_badge(icon, bg):
    st.markdown(f"<div class='icon-badge' style='background:{bg};'>{icon}</div>", unsafe_allow_html=True)
```

React target: 44×44, radius 12px, flex center, font-size 1.25rem, margin-bottom 0.5rem, background `{bg}`.

### `_color_dot`

```python
def _color_dot(color, size=10):
    """
    Small filled circle used for status legends (Projects by Status,
    Client Overview, etc). Uses background-color rather than a colored
    text bullet ('●' + color:) because the global theme CSS forces
    `color: #111827 !important` on every element inside a markdown
    block, which fights a text-color bullet. background-color isn't
    touched by that rule, so this renders reliably.
    """
    return (
        f"<span style='display:inline-block;width:{size}px;height:{size}px;"
        f"border-radius:50%;background-color:{color};vertical-align:middle;'></span>"
    )
```

### `_pill`

```python
def _pill(text, color):
    st.markdown(
        f"<span class='status-pill' style='background:{color}1A;color:{color} !important;"
        f"border:1px solid {color}55;'>{text}</span>",
        unsafe_allow_html=True,
    )
```

Notes: bg = hex + `1A` (≈10% alpha); border = hex + `55` (≈33% alpha). Class `.status-pill`: inline-block, pad `2px 10px`, radius `999px`, font `0.75rem` weight `600`.

### `_stat_card`

```python
def _stat_card(icon, bg, label, value, sublabel, key=None):
    """Flat white stat card: icon badge, label, big value, small caption."""
    with st.container(border=True, key=key):
        _icon_badge(icon, bg)
        st.markdown(f"<div style='color:#6B7280; font-size:0.82rem;'>{label}</div>", unsafe_allow_html=True)
        st.markdown(f"<div style='font-size:1.6rem; font-weight:700; color:#111827;'>{value}</div>",
                    unsafe_allow_html=True)
        st.caption(sublabel)
```

### `_hover_stat_card`

```python
def _hover_stat_card(icon, bg, label, value, sublabel, key):
    """
    Same as _stat_card, but given a unique container `key` so the boxed
    look + hover highlight (see _inject_dashboard_hover_css) can target
    exactly these 4 dashboard summary cards — not every bordered
    container app-wide. Streamlit adds a `st-key-<key>` class to the
    container's wrapper div, which is what the CSS below matches on.
    """
    _stat_card(icon, bg, label, value, sublabel, key=key)
```

### `_donut`

```python
def _donut(labels, values, colors, center_line1, center_line2, height=230):
    fig = go.Figure(data=[go.Pie(
        labels=labels, values=values, hole=0.68,
        marker=dict(colors=colors, line=dict(color="#FFFFFF", width=3)),
        textinfo="none", sort=False, direction="clockwise",
    )])
    fig.update_layout(
        showlegend=False,
        margin=dict(t=10, b=10, l=10, r=10),
        height=height,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        annotations=[dict(
            text=f"<b style='font-size:26px;color:#111827'>{center_line1}</b><br>"
                 f"<span style='font-size:12px;color:#6B7280'>{center_line2}</span>",
            x=0.5, y=0.5, showarrow=False,
        )],
    )
    return fig
```

### `_progress_ring`

```python
def _progress_ring(pct, color, height=190):
    """Single-value completion ring, used for the Overall System Overview card."""
    pct = max(0, min(100, int(pct)))
    fig = go.Figure(data=[go.Pie(
        values=[pct, 100 - pct], hole=0.75,
        marker=dict(colors=[color, "#F1F5F9"], line=dict(color="#FFFFFF", width=2)),
        textinfo="none", sort=False, direction="clockwise",
    )])
    fig.update_layout(
        showlegend=False, margin=dict(t=0, b=0, l=0, r=0), height=height,
        paper_bgcolor="rgba(0,0,0,0)",
        annotations=[
            dict(text=f"<b style='font-size:26px;color:#111827'>{pct}%</b>",
                 x=0.5, y=0.56, showarrow=False),
            dict(text="<span style='font-size:12px;color:#6B7280'>Overall Progress</span>",
                 x=0.5, y=0.42, showarrow=False),
        ],
    )
    return fig
```

### `_phase_rows`

```python
def _phase_rows(status_counts, total):
    """Colored-dot + label + progress bar + count(%) row, one per task status."""
    total = total or 1
    for key, meta in STATUS_META.items():
        count = status_counts.get(key, 0)
        pct = round(100 * count / total)
        dot_col, label_col, bar_col, val_col = st.columns([0.4, 2, 4, 1.4])
        with dot_col:
            st.markdown(
                f"<div style='width:10px;height:10px;border-radius:50%;"
                f"background:{meta['color']};margin-top:8px;'></div>",
                unsafe_allow_html=True,
            )
        with label_col:
            st.markdown(f"<div style='margin-top:2px;'>{meta['label']}</div>", unsafe_allow_html=True)
        with bar_col:
            st.progress(pct / 100)
        with val_col:
            st.markdown(
                f"<div style='margin-top:2px; text-align:right; color:#374151;'>{count} ({pct}%)</div>",
                unsafe_allow_html=True,
            )
```

(Defined in file; not called from current admin pages in this module.)

### `_initials`

```python
def _initials(text, max_letters=2):
    parts = [p for p in text.replace("_", " ").split() if p]
    return "".join(p[0] for p in parts[:max_letters]).upper() or "?"
```

### `_days_left`

```python
def _days_left(deadline_str):
    if not deadline_str:
        return None
    for fmt in ("%Y-%m-%d", "%d %b %Y", "%B %d, %Y", "%m/%d/%Y"):
        try:
            return (dt.datetime.strptime(str(deadline_str)[:10], fmt).date() - dt.date.today()).days
        except (ValueError, TypeError):
            continue
    return None
```

Note: formats that need more than 10 chars may fail because of `[:10]` slice — preserve behavior for parity.

### `_client_status_meta`

```python
def _client_status_meta(status_text):
    return CLIENT_STATUS_META.get((status_text or "").strip().lower(),
                                   {"icon": "⚪", "color": "#6B7280"})
```

### `_project_task_progress`

```python
def _project_task_progress(project_id, tasks):
    linked = [t for t in tasks if str(t.get("project_id")) == str(project_id)]
    if not linked:
        return None, 0, 0
    done = sum(1 for t in linked if (t.get("status") or "") == "done")
    return round(100 * done / len(linked)), done, len(linked)
```

### `_split_staff`

```python
def _split_staff(users):
    managers = [u for u in users if (u.get("role") or "").lower() == "manager"]
    employees = [u for u in users if (u.get("role") or "").lower() == "employee"]
    return managers, employees
```

### `_user_option_label`

```python
def _user_option_label(u):
    role = (u.get("role") or "").strip()
    role_tag = f" · {role}" if role else ""
    return f"{u.get('name', '—')} ({u.get('email', '—')}){role_tag}"
```

### Related helpers (same file, useful for port)

```python
def _fetch_users_safely(token):
    resp = get_users(token)
    if resp.status_code == 200:
        return resp.json(), True
    show_api_error(resp)
    return [], False


def _go_to(page_label):
    st.session_state[NAV_RADIO_KEY] = page_label
```

---

## 5. Chart color quick reference

| Chart | Colors |
|-------|--------|
| Project status donut | `#22C55E`, `#3B82F6`, `#F59E0B`, `#EF4444` (only non-zero statuses shown; order of PROJECT_STATUS_META) |
| Donut slice stroke | `#FFFFFF` width 3 |
| Module progress ring fill | `#6D28D9` |
| Module progress ring track | `#F1F5F9` |
| Ring stroke | `#FFFFFF` width 2 |
| Client status donut | `#22C55E` / `#EAB308` / `#6B7280` (or fallback `#6B7280`) |
| Users & Roles progress cycle | `#3B82F6`, `#22C55E`, `#F97316`, `#EC4899`, `#EAB308`, `#8B5CF6` |
| Module list completed bullet | `#6D28D9` |
| Module list todo bullet | `#9CA3AF` |
| Task STATUS_META | `#3B82F6`, `#F59E0B`, `#8B5CF6`, `#22C55E` |

---

## 6. API surface used by admin views

| Function | Pages |
|----------|-------|
| `get_clients` | Dashboard, Clients, Projects (create) |
| `create_client` / `update_client` / `delete_client` | Clients |
| `get_projects` | Dashboard, Projects, Tasks*, Documents, Meetings, Weekly, Requirements |
| `create_project` / `update_project` / `assign_team` / `get_team` | Projects (+ detail) |
| `get_project_modules` | Dashboard overview |
| `get_tasks` | Dashboard, Project detail, Tasks* |
| `patch_task_status` / `create_task` / `update_task` / `delete_task` | Tasks* |
| `list_documents` / `upload_document` / `download_document` / `delete_document` | Dashboard, Detail, Documents, Requirements |
| `get_users` | Dashboard, Users*, Projects, Tasks* |
| `generate_weekly_report` / `get_weekly_reports` | Weekly Reports |
| `analyze_requirement` / `approve_requirement_analysis` / `reject_requirement_analysis` | Requirement Analyzer |
| Shared UI: `render_sidebar_header`, `show_api_error`, `show_document_preview`, `render_meeting_panel`, `session_token`, `session_user`, `rag_status_label` | various |

\* Not currently in sidebar nav.

---

## 7. Em dash / empty placeholders

Literal fallback string used throughout: `—` (em dash U+2014) for missing names, emails, deadlines, roles, etc.
