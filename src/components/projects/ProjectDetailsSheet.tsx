import { useState, useEffect, useRef } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  Cloud,
  FolderOpen,
  ExternalLink,
  CheckCircle2,
  Loader2,
  AlertCircle,
  UploadCloud,
} from 'lucide-react'
import useProjectStore from '@/stores/useProjectStore'
import { useToast } from '@/hooks/use-toast'
import { ProposalPrintTemplate } from './ProposalPrintTemplate'
import { mapProjectToPrintData } from '@/lib/project-utils'

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

  const projectsRef = useRef(projects)
  useEffect(() => {
    projectsRef.current = projects
  }, [projects])

  const [saving, setSaving] = useState(false)
  const [laudas, setLaudas] = useState(project?.laudas?.toString() || '0')
  const [rate, setRate] = useState((project?.valorLauda || 0).toFixed(2))
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    if (project) {
      setLaudas(project.laudas?.toString() || '0')
      setRate((project.valorLauda || 0).toFixed(2))
    }
  }, [project?.laudas, project?.valorLauda])

  if (!project) return null

  const handleStatusChange = (val: string) => {
    if (val === 'Concluído') {
      window.dispatchEvent(new CustomEvent('request-complete-project', { detail: project.id }))
    } else {
      updateProject(projectId, { status: val })
    }
  }

  const handleSaveQuote = async () => {
    setSaving(true)
    try {
      await updateProject(projectId, {
        laudas: parseFloat(laudas) || 0,
        valorLauda: parseFloat(rate) || 0,
      })
      toast({ title: 'Orçamento Atualizado', description: `Os valores foram salvos.` })
    } catch (e) {
      // Error handled
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => {
        const id = Math.random().toString(36).substr(2, 9)
        return {
          id,
          name: f.name,
          size: f.size,
          status: 'uploading' as const,
          url:
            (project as any).pasta_url || project.cloudFolderUrl
              ? `${(project as any).pasta_url || project.cloudFolderUrl}&FilterField1=LinkFilename&FilterValue1=${encodeURIComponent(f.name)}`
              : `https://example.com/view/${id}`,
        }
      })

      const updatedFiles = [...(project.files || []), ...newFiles]
      updateProject(projectId, { files: updatedFiles, documents: updatedFiles.length }).catch(
        () => {},
      )

      newFiles.forEach((cf) => {
        setTimeout(
          () => {
            const currentProject = projectsRef.current.find((p) => p.id === projectId)
            if (!currentProject) return
            const isError = Math.random() > 0.85
            updateProject(projectId, {
              files: currentProject.files?.map((p) =>
                p.id === cf.id ? { ...p, status: isError ? 'error' : 'synced' } : p,
              ),
            }).catch(() => {})
          },
          1500 + Math.random() * 2000,
        )
      })
    }
  }

  const calculatedTotal = parseFloat(laudas || '0') * parseFloat(rate || '0')

  return (
    <>
      <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-2xl sm:w-[600px] overflow-y-auto" side="right">
          <SheetHeader className="mb-6 pb-4 border-b">
            <div className="flex flex-col gap-1">
              <SheetTitle className="text-xl">{project.title}</SheetTitle>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="font-mono text-sm">{project.id}</span>
                <span className="text-muted-foreground text-sm">•</span>
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  Cliente: {project.client}
                </span>
                <span className="text-muted-foreground text-sm">•</span>
                <Select value={project.status || 'Orçamento'} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-7 text-xs w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Orçamento',
                      'Aprovado',
                      'Aguardando',
                      'Em Andamento',
                      'Em Revisão',
                      'Cartório',
                      'Concluído',
                      'Atrasado/Bloqueado',
                      'Cancelado',
                      'Não Aprovado',
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetHeader>

          <Tabs defaultValue="quote" className="w-full flex flex-col h-full">
            <TabsList className="w-full grid grid-cols-3 mb-4 shrink-0">
              <TabsTrigger value="quote">Orçamento Int.</TabsTrigger>
              <TabsTrigger value="docs">Documentos</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="quote" className="space-y-6 animate-fade-in shrink-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Idioma Origem</Label>
                  <Select defaultValue={project.sourceLang || 'pt'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português (BR)</SelectItem>
                      <SelectItem value="en">Inglês</SelectItem>
                      <SelectItem value="es">Espanhol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Idioma Destino</Label>
                  <Select defaultValue={project.targetLang || 'en'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português (BR)</SelectItem>
                      <SelectItem value="en">Inglês</SelectItem>
                      <SelectItem value="es">Espanhol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Qtd. Laudas</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={laudas}
                    onChange={(e) => setLaudas(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taxa por Lauda (R$)</Label>
                  <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Valor Total Calculado:</span>
                  <span className="text-xs text-muted-foreground">
                    Valor na base: R$ {(project.value || 0).toFixed(2)}
                  </span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  R$ {calculatedTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" className="gap-2" onClick={() => setIsPrinting(true)}>
                  <Download size={16} /> Baixar Orçamento
                </Button>
                <Button onClick={handleSaveQuote} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Orçamento
                </Button>
              </div>
            </TabsContent>

            <TabsContent
              value="docs"
              className="flex-1 py-4 flex flex-col gap-4 animate-fade-in min-h-0 overflow-y-auto pr-2 pb-16"
            >
              {(project as any).pasta_url || project.cloudFolderUrl ? (
                <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-lg shadow-sm">
                      <Cloud className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Diretório SharePoint</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        /Projetos/{(project as any).cod_referencia || project.id}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={(project as any).pasta_url || project.cloudFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FolderOpen className="h-4 w-4 mr-2" /> Abrir
                    </a>
                  </Button>
                </div>
              ) : null}

              <div
                className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-6 text-center cursor-pointer bg-slate-50/30 dark:bg-slate-900/30 shrink-0"
                onClick={() => document.getElementById('sheet-file-upload')?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleFileUpload({ target: { files: e.dataTransfer.files } } as any)
                }}
              >
                <input
                  type="file"
                  id="sheet-file-upload"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                />
                <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium text-sm mb-1">Adicionar Arquivos</h3>
                <p className="text-xs text-muted-foreground">
                  Arraste os documentos para sincronizar.
                </p>
              </div>

              {project.files && project.files.length > 0 ? (
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Documento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {project.files.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[150px]">{f.name}</span>
                          </TableCell>
                          <TableCell>
                            {f.status === 'uploading' ? (
                              <Badge
                                variant="outline"
                                className="text-amber-500 border-amber-500/30 bg-amber-500/10 gap-1"
                              >
                                <Loader2 className="h-3 w-3 animate-spin" /> Sync
                              </Badge>
                            ) : f.status === 'error' ? (
                              <Badge
                                variant="outline"
                                className="text-destructive border-destructive/30 bg-destructive/10 gap-1"
                              >
                                <AlertCircle className="h-3 w-3" /> Falha
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 gap-1"
                              >
                                <CheckCircle2 className="h-3 w-3" /> OK
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              disabled={f.status !== 'synced'}
                            >
                              <a href={f.url} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="w-full h-[150px] bg-slate-100 dark:bg-slate-800/50 rounded-lg border flex flex-col items-center justify-center text-muted-foreground">
                  <FileText size={48} className="mb-4 opacity-40" />
                  <p className="font-medium">Nenhum documento</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="py-4 animate-fade-in shrink-0">
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

      {isPrinting && (
        <ProposalPrintTemplate
          data={mapProjectToPrintData(project)}
          autoPrint={true}
          onClose={() => setIsPrinting(false)}
        />
      )}
    </>
  )
}
