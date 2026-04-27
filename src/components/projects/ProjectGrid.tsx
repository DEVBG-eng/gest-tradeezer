import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronRight,
  Loader2,
  Download,
  DollarSign,
} from 'lucide-react'
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import useProjectStore, { ProjectStatus, ALL_STATUSES, Project } from '@/stores/useProjectStore'
import { LANGUAGES } from '@/components/LanguageCombobox'
import { cn } from '@/lib/utils'
import { getCustoProjetoByProjeto } from '@/services/projetos'
import { ProjectCostDialog } from './ProjectCostDialog'

const STATUS_COLORS: Record<ProjectStatus, string> = {
  Orçamento: 'bg-slate-400 hover:bg-slate-500 text-white',
  Aprovado: 'bg-blue-500 hover:bg-blue-600 text-white',
  Aguardando: 'bg-slate-500 hover:bg-slate-600 text-white',
  'Em Andamento': 'bg-amber-500 hover:bg-amber-600 text-white',
  'Em Revisão': 'bg-indigo-500 hover:bg-indigo-600 text-white',
  Cartório: 'bg-purple-500 hover:bg-purple-600 text-white',
  Concluído: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  'Atrasado/Bloqueado': 'bg-rose-500 hover:bg-rose-600 text-white',
  Cancelado: 'bg-zinc-500 hover:bg-zinc-600 text-white',
  'Não Aprovado': 'bg-red-500 hover:bg-red-600 text-white',
}

interface ProjectGridProps {
  onSelectProject: (id: string) => void
  onEditProject: (id: string) => void
  onDeleteProject: (id: string) => void
}

export function ProjectGrid({ onSelectProject, onEditProject, onDeleteProject }: ProjectGridProps) {
  const { projects, updateProjectStatus, loading, currentPage, totalPages, totalItems } =
    useProjectStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const [costDialogOpenForProject, setCostDialogOpenForProject] = useState<Project | null>(null)

  const handlePageChange = (page: number) => {
    searchParams.set('page', page.toString())
    setSearchParams(searchParams)
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    if (start > 1) {
      pages.push(
        <PaginationItem key="1">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(1)
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      )
      if (start > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault()
              if (currentPage !== i) handlePageChange(i)
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(totalPages)
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return pages
  }
  const [pendingStatus, setPendingStatus] = useState<ProjectStatus | null>(null)

  const getLanguageLabel = (code?: string) => {
    if (!code) return '-'
    return LANGUAGES.find((l) => l.value === code)?.label || code
  }

  // Filtering is now handled server-side via the store
  const filteredProjects = projects

  const handleStatusChange = async (project: Project, status: ProjectStatus) => {
    if (status === 'Concluído') {
      const custo = await getCustoProjetoByProjeto(project.pbId)
      if (!custo) {
        setCostDialogOpenForProject(project)
        setPendingStatus('Concluído')
        return
      }
    }
    updateProjectStatus(project.id, status)
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
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando projetos...
                </div>
              </TableCell>
            </TableRow>
          ) : filteredProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                {projects.length === 0
                  ? 'Nenhum projeto encontrado.'
                  : 'Nenhum projeto encontrado com os filtros selecionados'}
              </TableCell>
            </TableRow>
          ) : (
            filteredProjects.map((project) => (
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
                          onClick={() => handleStatusChange(project, status)}
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
                      <DropdownMenuItem
                        onClick={() => {
                          const event = new CustomEvent('print-project', { detail: project.id })
                          window.dispatchEvent(event)
                        }}
                        className="cursor-pointer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Orçamento
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setPendingStatus(null)
                          setCostDialogOpenForProject(project)
                        }}
                        className="cursor-pointer"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Lançar Custos
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
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 0 && (
        <div
          className={cn(
            'flex items-center justify-between px-4 py-4 border-t bg-muted/20 mt-auto transition-opacity',
            loading && 'opacity-50 pointer-events-none',
          )}
        >
          <div className="text-sm text-muted-foreground hidden sm:block flex-1">
            Página {currentPage} de {totalPages} ({totalItems} projeto{totalItems !== 1 && 's'})
          </div>
          <Pagination className="flex-1 sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) handlePageChange(currentPage - 1)
                  }}
                  className={cn(currentPage <= 1 && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>

              {renderPageNumbers()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) handlePageChange(currentPage + 1)
                  }}
                  className={cn(currentPage >= totalPages && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {costDialogOpenForProject && (
        <ProjectCostDialog
          project={costDialogOpenForProject}
          open={!!costDialogOpenForProject}
          onOpenChange={(open) => {
            if (!open) {
              setCostDialogOpenForProject(null)
              setPendingStatus(null)
            }
          }}
          onSaved={() => {
            if (pendingStatus) {
              updateProjectStatus(costDialogOpenForProject.id, pendingStatus)
            }
            setCostDialogOpenForProject(null)
            setPendingStatus(null)
          }}
        />
      )}
    </div>
  )
}
