import { Route } from 'react-router-dom'
import Layout from '../components/Layout'
import ChatPanel from '../components/ChatPanel'
import { adminPages } from '../pages/roles/admin/Admin'
import { managerPages } from '../pages/roles/manager/Manager'
import { employeePages } from '../pages/roles/employee/Employee'
import { clientPages } from '../pages/roles/client/Client'

// Each role's available pages are defined in its single role entry file.
const rolePages = { admin: adminPages, manager: managerPages, employee: employeePages, client: clientPages }

const withChat = page => <>{page}<ChatPanel /></>

export function createRoleRoutes(Protected) {
  return ['admin', 'manager', 'employee', 'client'].map(role => {
    const pages = rolePages[role]
    const Dashboard = pages.dashboard
    const Employees = pages.employees
    const Clients = pages.clients
    const Projects = pages.projects
    const Tasks = pages.tasks
    const Documents = pages.documents
    const Meetings = pages.meetings
    const Reports = pages.reports
    const Requirements = pages.requirements

    return (
      <Route key={role} element={<Protected role={role}><Layout /></Protected>}>
        <Route path={`/${role}`} element={withChat(<Dashboard />)} />
        {Employees && <Route path={`/${role}/employees`} element={withChat(<Employees />)} />}
        {Clients && <Route path={`/${role}/clients`} element={withChat(<Clients />)} />}
        {Projects && <Route path={`/${role}/projects`} element={withChat(<Projects />)} />}
        {Tasks && <Route path={`/${role}/tasks`} element={withChat(<Tasks />)} />}
        {Documents && <Route path={`/${role}/documents`} element={withChat(<Documents />)} />}
        {Meetings && <Route path={`/${role}/meetings`} element={withChat(<Meetings />)} />}
        {Reports && <Route path={`/${role}/reports`} element={withChat(<Reports />)} />}
        {Requirements && <Route path={`/${role}/requirements`} element={withChat(<Requirements />)} />}
      </Route>
    )
  })
}
