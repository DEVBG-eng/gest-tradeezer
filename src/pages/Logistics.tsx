import { Package, Plane, CheckCircle2, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import useProjectStore from '@/stores/useProjectStore'

export default function Logistics() {
  const { projects } = useProjectStore()
  const logisticsProjects = projects.filter((p) => p.status === 'Logística')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Centro de Logística</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhamento de envios nacionais e internacionais (DHL / Motoboy).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {logisticsProjects.map((project) => (
          <Card key={project.id} className="hover:-translate-y-1 transition-transform duration-200">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base text-primary leading-tight">
                  {project.title}
                </CardTitle>
                <Badge variant="secondary">Em Trânsito</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">{project.id}</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-6 text-sm">
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <Package size={16} />
                  </div>
                  <span className="text-xs text-muted-foreground">Origem</span>
                </div>
                <div className="flex-1 mx-2 relative">
                  <div className="absolute inset-0 top-1/2 border-t-2 border-dashed border-primary/30"></div>
                  <div className="absolute inset-0 flex justify-center -top-3">
                    <Plane size={16} className="text-primary/50" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-slate-100 text-slate-400 p-2 rounded-full">
                    <MapPin size={16} />
                  </div>
                  <span className="text-xs text-muted-foreground">Destino</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded p-3 text-xs border">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Previsão:</span>
                  <span className="font-medium">
                    {new Date(project.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking ID:</span>
                  <span className="font-mono text-primary cursor-pointer hover:underline">
                    DHL-8492011
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {logisticsProjects.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            Nenhum projeto em fase de logística no momento.
          </div>
        )}
      </div>
    </div>
  )
}
