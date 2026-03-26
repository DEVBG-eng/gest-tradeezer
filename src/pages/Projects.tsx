import { useState, useEffect } from 'react'
import { KanbanBoard } from '@/components/projects/KanbanBoard'
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

export default function Projects() {
  const { projects, deleteProject } = useProjectStore()
  const { toast } = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [printingId, setPrintingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const confirmDelete = () => {
    if (deletingId) {
      deleteProject(deletingId)
      toast({
        title: 'Projeto removido',
        description: `O projeto foi removido com sucesso.`,
      })
      if (selectedId === deletingId) setSelectedId(null)
      setDeletingId(null)
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quadro de Projetos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o fluxo completo, do Intake à Logística.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard onSelectProject={setSelectedId} />
      </div>

      {selectedId && (
        <ProjectDetailsSheet projectId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {printingProject && (
        <ProposalPrintTemplate project={printingProject} onClose={() => setPrintingId(null)} />
      )}

      {editingId && <EditProjectDialog projectId={editingId} onClose={() => setEditingId(null)} />}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O projeto e todos os seus dados serão permanentemente
              removidos do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Excluir Projeto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
