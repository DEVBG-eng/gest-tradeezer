import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Truck,
  FileSignature,
  Settings,
  LogOut,
  FolderPlus,
  Users,
} from 'lucide-react'
import logoImg from '@/assets/design-sem-nome-ffec1.jpg'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Projetos', url: '/projects', icon: Briefcase },
  { title: 'Novo Projeto', url: '/projects/new', icon: FolderPlus },
  { title: 'Clientes', url: '/clients', icon: Users },
  { title: 'Logística', url: '/logistics', icon: Truck },
  { title: 'Cartório', url: '/notary', icon: FileSignature },
  { title: 'Configurações', url: '/settings', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3 h-[60px] flex flex-col justify-center">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white overflow-hidden shadow-sm p-0.5">
            <img
              src={logoImg}
              alt="Tradeezer Logo"
              className="h-full w-full object-contain font-normal text-left bg-transparent text-[0.37px]"
            />
          </div>
          <div className="flex flex-col flex-1 truncate">
            <span className="truncate font-bold text-base leading-tight text-foreground">
              Tradeezer
            </span>
            <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Sistema de Gestão
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase text-muted-foreground">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== '/' && location.pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {user && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{user.name || 'Usuário'}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
