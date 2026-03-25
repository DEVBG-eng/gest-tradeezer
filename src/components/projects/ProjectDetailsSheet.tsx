import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Download, X } from 'lucide-react'
import useProjectStore from '@/stores/useProjectStore'
import { useToast } from '@/hooks/use-toast'

export function ProjectDetailsSheet({
  projectId,
  onClose,
}: {
  projectId: string
  onClose: () => void
}) {
  const { projects, updateProject } = useProjectStore()
  const { toast } = useToast()
  const project = projects.find((p) => p.id === projectId)

  const [laudas, setLaudas] = useState(project?.laudas?.toString() || '0')
  const [rate, setRate] = useState('45.00')

  if (!project) return null

  const handleSaveQuote = () => {
    const total = parseFloat(laudas) * parseFloat(rate)
    updateProject(projectId, { laudas: parseFloat(laudas), value: total })
    toast({ title: 'Orçamento Atualizado', description: `Valor total: R$ ${total.toFixed(2)}` })
  }

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl sm:w-[600px] overflow-y-auto" side="right">
        <SheetHeader className="mb-6 pb-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-xl">{project.title}</SheetTitle>
              <SheetDescription className="mt-1">
                <span className="font-mono">{project.id}</span> • Cliente: {project.client}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="quote" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="quote">Orçamento Int.</TabsTrigger>
            <TabsTrigger value="docs">Documentos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="quote" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Idioma Origem</Label>
                <Select defaultValue="pt">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português (BR)</SelectItem>
                    <SelectItem value="en">Inglês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Idioma Destino</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português (BR)</SelectItem>
                    <SelectItem value="en">Inglês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Qtd. Laudas</Label>
                <Input type="number" value={laudas} onChange={(e) => setLaudas(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Taxa por Lauda (R$)</Label>
                <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border flex justify-between items-center">
              <span className="text-sm font-medium">Valor Total Calculado:</span>
              <span className="text-2xl font-bold text-primary">
                R$ {(parseFloat(laudas || '0') * parseFloat(rate || '0')).toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" className="gap-2">
                <Download size={16} /> Gerar Proposta PDF
              </Button>
              <Button onClick={handleSaveQuote}>Salvar Orçamento</Button>
            </div>
          </TabsContent>

          <TabsContent value="docs" className="py-4 h-[500px] animate-fade-in">
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-border/60 flex flex-col items-center justify-center text-muted-foreground shadow-inner">
              <FileText size={64} className="mb-4 opacity-40" />
              <p className="font-medium text-slate-500">Visualizador Integrado</p>
              <p className="text-sm opacity-70">(Simulação Adobe Services)</p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="py-4 animate-fade-in">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border bg-card shadow-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold">Projeto Criado</span>
                    <span className="text-xs text-muted-foreground">Ontem</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Documento inserido via Intake OCR.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
