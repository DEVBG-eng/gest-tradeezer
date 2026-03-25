import { ProjectStatus, Project } from '@/stores/useProjectStore'
import { ProjectCard } from './ProjectCard'

interface Props {
  title: ProjectStatus
  projects: Project[]
  onDragStart: (id: string) => void
  onDrop: () => void
  onCardClick: (id: string) => void
}

export function KanbanColumn({ title, projects, onDragStart, onDrop, onCardClick }: Props) {
  return (
    <div
      className="flex-shrink-0 w-80 bg-slate-100/80 dark:bg-slate-800/30 rounded-lg p-3 flex flex-col gap-3 border border-border/50"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
    >
      <div className="flex items-center justify-between px-1 mb-1">
        <h3 className="font-medium text-sm text-slate-700 dark:text-slate-300">{title}</h3>
        <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
          {projects.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pb-2 min-h-[150px]">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onDragStart={() => onDragStart(p.id)}
            onClick={() => onCardClick(p.id)}
          />
        ))}
        {projects.length === 0 && (
          <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-xs py-8">
            Solte aqui
          </div>
        )}
      </div>
    </div>
  )
}
