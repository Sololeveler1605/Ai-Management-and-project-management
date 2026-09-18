import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import { createRoleRoutes } from './routes/RoleRoutes'

function Protected({ role, children }) { const { isAuthenticated, user } = useAuth(); if (!isAuthenticated) return <Navigate to="/login" replace />; if (role && user?.role !== role) return <Navigate to={`/${user?.role || 'login'}`} replace />; return children }
export default function App() { const { user } = useAuth(); return <Routes><Route path="/login" element={<LoginPage />} />{createRoleRoutes(Protected)}<Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} /></Routes> }
