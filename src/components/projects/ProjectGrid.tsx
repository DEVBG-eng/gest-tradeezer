import { format, parseISO } from 'date-fns'
import { MoreHorizontal, Edit, Trash2, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import useProjectStore, { ProjectStatus } from '@/stores/useProjectStore'
import { LANGUAGES } from '@/components/LanguageCombobox'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<ProjectStatus, string> = {
  Aguardando: 'bg-slate-500 hover:bg-slate-600 text-white',
  'Em Andamento': 'bg-amber-500 hover:bg-amber-600 text-white',
  'Em Revisão': 'bg-indigo-500 hover:bg-indigo-600 text-white',
  Concluído: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  'Atrasado/Bloqueado': 'bg-rose-500 hover:bg-rose-600 text-white',
}

const ALL_STATUSES: ProjectStatus[] = [
  'Aguardando',
  'Em Andamento',
  'Em Revisão',
  'Concluído',
  'Atrasado/Bloqueado',
]

interface ProjectGridProps {
  onSelectProject: (id: string) => void
  onEditProject: (id: string) => void
  onDeleteProject: (id: string) => void
}

export function ProjectGrid({ onSelectProject, onEditProject, onDeleteProject }: ProjectGridProps) {
  const { projects, updateProjectStatus } = useProjectStore()

  const getLanguageLabel = (code?: string) => {
    if (!code) return '-'
    return LANGUAGES.find((l) => l.value === code)?.label || code
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden h-full flex flex-col">
      <Table>
        <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
          <TableRow>
            <TableHead className="w-[140px] font-semibold text-foreground">
              Cód. de Referência
            </TableHead>
            <TableHead className="font-semibold text-foreground">Categoria de serviço</TableHead>
            <TableHead className="font-semibold text-foreground">Idiomas</TableHead>
            <TableHead className="font-semibold text-foreground">Tipo de documento</TableHead>
            <TableHead className="font-semibold text-foreground">Quantidades</TableHead>
            <TableHead className="font-semibold text-foreground">Data de entrega</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Valor final</TableHead>
            <TableHead className="w-[160px] font-semibold text-foreground">Status</TableHead>
            <TableHead className="w-[70px] text-right font-semibold text-foreground">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="group hover:bg-muted/50">
              <TableCell className="font-medium">
                <span
                  className="cursor-pointer text-primary hover:underline hover:text-primary/80 transition-colors"
                  onClick={() => onSelectProject(project.id)}
                >
                  {project.id}
                </span>
              </TableCell>
              <TableCell>{project.translationType || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <span>{getLanguageLabel(project.sourceLang)}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span>{getLanguageLabel(project.targetLang)}</span>
                </div>
              </TableCell>
              <TableCell>{project.documentType || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{project.documents}</span> docs
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="font-medium text-foreground">{project.laudas}</span> laudas
                </div>
              </TableCell>
              <TableCell>
                {project.dueDate ? format(parseISO(project.dueDate), 'dd/MM/yyyy') : '-'}
              </TableCell>
              <TableCell className="text-right font-medium">
                {typeof project.value === 'number'
                  ? `R$ ${project.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '-'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none">
                      <Badge
                        className={cn(
                          'cursor-pointer border-transparent transition-colors font-medium',
                          STATUS_COLORS[project.status],
                        )}
                      >
                        {project.status}
                      </Badge>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    {ALL_STATUSES.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => updateProjectStatus(project.id, status)}
                        className={cn(
                          'flex items-center gap-2 cursor-pointer',
                          project.status === status && 'bg-muted font-medium',
                        )}
                      >
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            STATUS_COLORS[status].split(' ')[0],
                          )}
                        />
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 data-[state=open]:opacity-100"
                    >
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEditProject(project.id)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteProject(project.id)}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {projects.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                Nenhum projeto encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
