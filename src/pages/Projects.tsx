import { useState } from 'react'
import { KanbanBoard } from '@/components/projects/KanbanBoard'
import { ProjectDetailsSheet } from '@/components/projects/ProjectDetailsSheet'

export default function Projects() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
    </div>
  )
}
