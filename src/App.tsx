import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Intake from './pages/Intake'
import Projects from './pages/Projects'
import CreateProject from './pages/CreateProject'
import Logistics from './pages/Logistics'
import Notary from './pages/Notary'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { ProjectStoreProvider } from './stores/useProjectStore'

const App = () => (
  <ProjectStoreProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/intake" element={<Intake />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/logistics" element={<Logistics />} />
            <Route path="/notary" element={<Notary />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </ProjectStoreProvider>
)

export default App
