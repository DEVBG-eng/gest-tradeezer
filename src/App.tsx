import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Projects from './pages/Projects'
import CreateProject from './pages/CreateProject'
import Logistics from './pages/Logistics'
import Notary from './pages/Notary'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Clients from './pages/Clients'
import ProjectCosts from './pages/ProjectCosts'
import { ProjectStoreProvider } from './stores/useProjectStore'
import { SettingsStoreProvider } from './stores/useSettingsStore'
import { NotificationStoreProvider } from './stores/useNotificationStore'
import { ClientStoreProvider } from './stores/useClientStore'
import { AuthProvider, useAuth } from './hooks/use-auth'

function ProtectedRoutes() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

const App = () => (
  <AuthProvider>
    <ClientStoreProvider>
      <SettingsStoreProvider>
        <ProjectStoreProvider>
          <NotificationStoreProvider>
            <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route element={<ProtectedRoutes />}>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/intake" element={<Navigate to="/" replace />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/new" element={<CreateProject />} />
                      <Route path="/project-costs" element={<ProjectCosts />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/logistics" element={<Logistics />} />
                      <Route path="/notary" element={<Notary />} />
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </BrowserRouter>
          </NotificationStoreProvider>
        </ProjectStoreProvider>
      </SettingsStoreProvider>
    </ClientStoreProvider>
  </AuthProvider>
)

export default App
