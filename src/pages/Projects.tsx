import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { ProjectDetailsSheet } from '@/components/projects/ProjectDetailsSheet'
import { ProposalPrintTemplate } from '@/components/projects/ProposalPrintTemplate'
import { EditProjectDialog } from '@/components/projects/EditProjectDialog'
import useProjectStore from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2, FilterX, Search } from 'lucide-react'
import { mapProjectToPrintData } from '@/lib/project-utils'
import pb from '@/lib/pocketbase/client'
import { ProjectStatusFilter } from '@/components/projects/ProjectStatusFilter'
import { Input } from '@/components/ui/input'

export default function Projects() {
  const { projects, deleteProject, setSearchQuery } = useProjectStore()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [printingId, setPrintingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [refSearch, setRefSearch] = useState('')

  const hasFilters =
    searchParams.getAll('status').length > 0 || searchParams.has('shipping') || refSearch !== ''

  useEffect(() => {
    setSearchQuery(refSearch)
  }, [refSearch, setSearchQuery])

  useEffect(() => {
    return () => setSearchQuery('')
  }, [setSearchQuery])

  useEffect(() => {
    const projectId = searchParams.get('projectId')
    if (!projectId) return

    const verifyAndOpen = async () => {
      try {
        await pb.collection('Projetos').getOne(projectId)
        setSelectedId(projectId)
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Projeto não encontrado',
          description: 'O projeto que você tentou acessar não existe ou foi removido.',
        })
      } finally {
        setSearchParams(
          (prev) => {
            prev.delete('projectId')
            return prev
          },
          { replace: true },
        )
      }
    }

    verifyAndOpen()
  }, [searchParams, setSearchParams, toast])

  useEffect(() => {
    const handlePrintEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      setPrintingId(customEvent.detail)
    }

    const handleEditEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      setEditingId(customEvent.detail)
    }

    const handleDeleteEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      setDeletingId(customEvent.detail)
    }

    window.addEventListener('print-project', handlePrintEvent)
    window.addEventListener('edit-project', handleEditEvent)
    window.addEventListener('delete-project', handleDeleteEvent)

    return () => {
      window.removeEventListener('print-project', handlePrintEvent)
      window.removeEventListener('edit-project', handleEditEvent)
      window.removeEventListener('delete-project', handleDeleteEvent)
    }
  }, [])

  const printingProject = projects.find((p) => p.id === printingId)

  const confirmDelete = async () => {
    if (deletingId) {
      setIsDeleting(true)
      try {
        await deleteProject(deletingId)
        toast({
          title: 'Projeto removido',
          description: `O projeto foi removido com sucesso.`,
        })
        if (selectedId === deletingId) setSelectedId(null)
      } catch (error) {
        // Handled in store
      } finally {
        setIsDeleting(false)
        setDeletingId(null)
      }
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quadro de Projetos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e acompanhe todos os projetos de forma centralizada e visual.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, ref. ou serviço..."
              value={refSearch}
              onChange={(e) => setRefSearch(e.target.value)}
              className="pl-9 w-[300px] lg:w-[350px] h-10"
            />
          </div>
          <ProjectStatusFilter />
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchParams({})
                setRefSearch('')
              }}
              className="gap-2 shrink-0"
            >
              <FilterX className="h-4 w-4" />
              Limpar Todos
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 pb-4">
        <ProjectGrid
          onSelectProject={setSelectedId}
          onEditProject={setEditingId}
          onDeleteProject={setDeletingId}
          referenceFilter=""
        />
      </div>

      {selectedId && (
        <ProjectDetailsSheet projectId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {printingProject && (
        <ProposalPrintTemplate
          data={mapProjectToPrintData(printingProject)}
          autoPrint={true}
          onClose={() => setPrintingId(null)}
        />
      )}

      {editingId && <EditProjectDialog projectId={editingId} onClose={() => setEditingId(null)} />}

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Projeto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
