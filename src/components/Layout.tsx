import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-slate-50 dark:bg-slate-950">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 animate-fade-in custom-scrollbar">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
