import { useState, useEffect } from 'react'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { ProjectDetailsSheet } from '@/components/projects/ProjectDetailsSheet'
import { ProposalPrintTemplate } from '@/components/projects/ProposalPrintTemplate'
import { EditProjectDialog } from '@/components/projects/EditProjectDialog'
import useProjectStore from '@/stores/useProjectStore'
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
import { Loader2 } from 'lucide-react'

export default function Projects() {
  const { projects, deleteProject } = useProjectStore()
  const { toast } = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [printingId, setPrintingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
      </div>

      <div className="flex-1 min-h-0 pb-4">
        <ProjectGrid
          onSelectProject={setSelectedId}
          onEditProject={setEditingId}
          onDeleteProject={setDeletingId}
        />
      </div>

      {selectedId && (
        <ProjectDetailsSheet projectId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {printingProject && (
        <ProposalPrintTemplate project={printingProject} onClose={() => setPrintingId(null)} />
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
