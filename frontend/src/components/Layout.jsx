import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DocumentPreviewHost } from './DocumentPreview'

const nav = {
  admin: [['Dashboard','/admin'],['Clients','/admin/clients'],['Projects','/admin/projects'],['Documents','/admin/documents'],['Meetings','/admin/meetings'],['Weekly Reports','/admin/reports'],['Requirement Analyzer','/admin/requirements']],
  manager: [['Dashboard','/manager'],['Employees','/manager/employees'],['Clients','/manager/clients'],['Projects','/manager/projects'],['Tasks','/manager/tasks'],['Documents','/manager/documents'],['Meetings','/manager/meetings'],['Weekly Reports','/manager/reports'],['Requirement Analyzer','/manager/requirements']],
  employee: [['Dashboard','/employee'],['My Tasks','/employee/tasks'],['My Projects','/employee/projects'],['Documents','/employee/documents']],
  client: [['My Projects','/client'],['Documents','/client/documents']],
}

export default function Layout() {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const links = nav[user?.role] || []
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">ai</span><span>Affordable AI<small>AI PROJECT OS</small></span></div><div className="profile"><div className="avatar">{(user?.name || '?').slice(0,1).toUpperCase()}</div><div><strong>{user?.name}</strong><small>{user?.role}</small>{user?.designation && <small className="designation">{user.designation}</small>}</div></div><nav>{links.map(([label,path])=><NavLink key={path} to={path} end={path===`/${user?.role}`}>{label}</NavLink>)}</nav><div className="sidebar-bottom"><button className="logout" onClick={()=>{logout();navigate('/login')}}>Sign out</button></div></aside><main className="main"><header className="topbar"><div><span className="eyebrow">{user?.role?.toUpperCase()} WORKSPACE</span><h1>AI Project OS</h1></div><div className="top-actions"><span className="health-dot"/> API connected</div></header><section className="content"><Outlet/></section></main><DocumentPreviewHost/></div>
}
