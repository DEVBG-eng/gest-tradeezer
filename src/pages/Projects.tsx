import { useState, useEffect } from 'react'
import { KanbanBoard } from '@/components/projects/KanbanBoard'
import { ProjectDetailsSheet } from '@/components/projects/ProjectDetailsSheet'
import { ProposalPrintTemplate } from '@/components/projects/ProposalPrintTemplate'
import useProjectStore from '@/stores/useProjectStore'

export default function Projects() {
  const { projects } = useProjectStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [printingId, setPrintingId] = useState<string | null>(null)

  useEffect(() => {
    const handlePrintEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      setPrintingId(customEvent.detail)
    }

    window.addEventListener('print-project', handlePrintEvent)

    return () => {
      window.removeEventListener('print-project', handlePrintEvent)
    }
  }, [])

  const printingProject = projects.find((p) => p.id === printingId)

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
    </div>
  )
}
