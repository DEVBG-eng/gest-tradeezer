import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Kanban, Truck, Scale, Settings, PlusSquare } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'

const items = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/' },
  { title: 'Novo Projeto', icon: PlusSquare, url: '/projects/new' },
  { title: 'Quadro de Projetos', icon: Kanban, url: '/projects' },
  { title: 'Logística', icon: Truck, url: '/logistics' },
  { title: 'Gestão de Cartório', icon: Scale, url: '/notary' },
  { title: 'Configurações', icon: Settings, url: '/settings' },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border px-4 py-0">
        <div className="flex items-center gap-2 overflow-hidden text-sidebar-primary w-full">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-1.5 rounded-md flex-shrink-0">
            <Scale size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight truncate group-data-[collapsible=icon]:hidden">
            TRADEEZER
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-4">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={
                  location.pathname === item.url ||
                  (item.url !== '/' && location.pathname.startsWith(item.url))
                }
                tooltip={item.title}
              >
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
        <div className="text-xs text-sidebar-foreground/50 truncate">
          Tradeezer Operations Hub
          <br />
          Versão 1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
