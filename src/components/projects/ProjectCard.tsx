import { Project } from '@/stores/useProjectStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Globe, FileText, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  project: Project
  onDragStart: () => void
  onClick: () => void
}

export function ProjectCard({ project, onDragStart, onClick }: Props) {
  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent('print-project', { detail: project.id }))
  }

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        'group cursor-grab hover:-translate-y-[2px] transition-transform duration-200 active:cursor-grabbing border-l-4 relative',
        project.urgent ? 'border-l-destructive' : 'border-l-primary/30',
      )}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-mono text-muted-foreground">{project.id}</span>
          <div className="flex gap-1.5 items-center bg-background/80 rounded-sm px-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity -ml-1"
              onClick={handlePrint}
              title="Gerar Proposta PDF"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
            </Button>
            {project.urgent && <AlertCircle className="w-3.5 h-3.5 text-destructive" />}
            {project.international && <Globe className="w-3.5 h-3.5 text-accent" />}
          </div>
        </div>
        <h4 className="font-semibold text-sm leading-tight mb-1 pr-6">{project.title}</h4>
        <p className="text-xs text-muted-foreground mb-3 truncate">{project.client}</p>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span>{project.laudas} laudas</span>
          </div>
          {project.physicalCopy && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4">
              Físico
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
