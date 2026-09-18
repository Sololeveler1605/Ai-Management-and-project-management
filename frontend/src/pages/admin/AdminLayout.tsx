import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { SidebarChatAssistant } from '../../components/shared'

const NAV_ITEMS = [
  { to: '/admin', end: true, label: '🏠 Dashboard' },
  { to: '/admin/clients', label: '🏢 Clients' },
  { to: '/admin/projects', label: '📁 Projects' },
  { to: '/admin/documents', label: '📄 Documents' },
  { to: '/admin/meetings', label: '🎙️ Meetings' },
  { to: '/admin/weekly-reports', label: '📊 Weekly Reports' },
  { to: '/admin/requirement-analyzer', label: '🧠 Requirement Analyzer' },
] as const

export default function AdminLayout() {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <div className="admin-theme" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#991B1B', fontWeight: 600 }}>
          Your session expired. Please log in again.
        </p>
        <button type="button" className="btn-primary" style={{ maxWidth: 200, marginTop: 12 }} onClick={logout}>
          Back to login
        </button>
      </div>
    )
  }

  return (
    <div className="admin-theme admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <div style={{ fontWeight: 700, color: '#111827', fontSize: '1.05rem' }}>
            {user.name || 'Admin'}
          </div>
          <div style={{ marginTop: 6 }}>
            Role:{' '}
            <code className="admin-role-chip">{user.role || 'admin'}</code>
          </div>
        </div>

        <div className="admin-sidebar__caption">MANAGEMENT</div>

        <nav className="admin-sidebar__nav" aria-label="Go to">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <SidebarChatAssistant />
          <button type="button" className="btn-secondary" style={{ marginTop: 12 }} onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
