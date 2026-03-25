import { useState } from 'react'
import useProjectStore, { ProjectStatus } from '@/stores/useProjectStore'
import { KanbanColumn } from './KanbanColumn'

const COLUMNS: ProjectStatus[] = [
  'Triagem',
  'Orçamento',
  'Produção',
  'Cartório',
  'Logística',
  'Concluído',
]

export function KanbanBoard({ onSelectProject }: { onSelectProject: (id: string) => void }) {
  const { projects, updateProjectStatus } = useProjectStore()
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDragStart = (id: string) => setDraggedId(id)
  const handleDrop = (status: ProjectStatus) => {
    if (draggedId) {
      updateProjectStatus(draggedId, status)
      setDraggedId(null)
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 h-[calc(100vh-140px)] custom-scrollbar">
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col}
          title={col}
          projects={projects.filter((p) => p.status === col)}
          onDragStart={handleDragStart}
          onDrop={() => handleDrop(col)}
          onCardClick={onSelectProject}
        />
      ))}
    </div>
  )
}
