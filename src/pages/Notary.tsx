import { Scale, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import useProjectStore from '@/stores/useProjectStore'

export default function Notary() {
  const { projects, updateProjectStatus } = useProjectStore()
  const notaryProjects = projects.filter((p) => p.status === 'Cartório')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-sm">
          <Scale size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Cartório</h1>
          <p className="text-muted-foreground mt-1">
            Checklist de Apostilamento, Autenticação e Reconhecimento de Firma.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px]">ID Projeto</TableHead>
                <TableHead>Documento / Cliente</TableHead>
                <TableHead>Tipo de Serviço Legal</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notaryProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-mono text-xs">{project.id}</TableCell>
                  <TableCell>
                    <p className="font-medium text-sm leading-none mb-1">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.client}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-normal bg-accent/10 border-accent/20 text-accent-foreground dark:text-accent"
                    >
                      Apostilamento de Haia
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(project.dueDate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => updateProjectStatus(project.id, 'Logística')}
                      className="gap-1.5"
                    >
                      <Check size={14} /> Concluir e Enviar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {notaryProjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Nenhum documento aguardando trâmites de cartório.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
