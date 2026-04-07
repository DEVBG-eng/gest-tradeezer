import { useEffect, useState } from 'react'
import {
  Bell,
  Search,
  Menu,
  LogOut,
  User,
  CalendarClock,
  FilePlus,
  BellRing,
  Info,
} from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { getFileUrl } from '@/lib/pocketbase/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import useNotificationStore from '@/stores/useNotificationStore'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { UserProfileDialog } from './UserProfileDialog'

export function AppHeader() {
  const { toggleSidebar } = useSidebar()
  const { user, signOut } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleNotificationClick = (notif: any) => {
    if (!notif.lida) markAsRead(notif.id)
    if (notif.projeto) {
      navigate(`/projects?projectId=${notif.projeto}`)
      setNotifOpen(false)
    }
  }

  const avatarUrl = user?.avatar ? getFileUrl(user, user.avatar) : ''
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U'

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-900 border-b z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex items-center">
          <Button
            variant="outline"
            className="w-64 justify-start text-muted-foreground shadow-sm"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar projetos, clientes...
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive border border-white dark:border-slate-900"></span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 sm:w-96 p-0 z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notificações</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:underline"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Nenhuma notificação no momento</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        'px-4 py-3 flex gap-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-0',
                        !n.lida && 'bg-primary/5',
                      )}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {n.tipo === 'entrega' && (
                          <CalendarClock className="h-5 w-5 text-amber-500" />
                        )}
                        {n.tipo === 'projeto_novo' && (
                          <FilePlus className="h-5 w-5 text-blue-500" />
                        )}
                        {n.tipo === 'solicitacao' && (
                          <BellRing className="h-5 w-5 text-purple-500" />
                        )}
                        {n.tipo === 'sistema' && <Info className="h-5 w-5 text-slate-500" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{n.titulo}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.mensagem}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.created), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      {!n.lida && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {notifications.length > 0 && (
              <div className="p-2 border-t text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="w-full text-xs text-muted-foreground"
                >
                  Limpar todas
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 border cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all select-none">
              <AvatarImage src={avatarUrl} alt={user?.name || 'User'} className="object-cover" />
              <AvatarFallback className="bg-secondary text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setProfileOpen(true)} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Editar Perfil</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={signOut}
              className="text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Digite um ID, cliente ou documento..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Ações Rápidas">
            <CommandItem onSelect={() => setSearchOpen(false)}>
              Novo Intake de Documentos
            </CommandItem>
            <CommandItem onSelect={() => setSearchOpen(false)}>Gerar Relatório SLA</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Projetos Recentes">
            <CommandItem className="flex justify-between" onSelect={() => setSearchOpen(false)}>
              <span>PRJ-1002 - Procuração Pública</span>
              <Badge variant="outline">Cartório</Badge>
            </CommandItem>
            <CommandItem className="flex justify-between" onSelect={() => setSearchOpen(false)}>
              <span>PRJ-1004 - Certidão de Casamento</span>
              <Badge variant="outline">Logística</Badge>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <UserProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  )
}
