import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Calendar as CalendarIcon,
  UploadCloud,
  CheckCircle2,
  Cloud,
  FolderOpen,
  Loader2,
  ExternalLink,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import useProjectStore, { CloudFile } from '@/stores/useProjectStore'
import useSettingsStore from '@/stores/useSettingsStore'
import { cn } from '@/lib/utils'

export default function CreateProject() {
  const navigate = useNavigate()
  const { addProject } = useProjectStore()
  const { activeCloudProvider, oneDriveNetworkLink } = useSettingsStore()
  const { toast } = useToast()

  const [reference] = useState(`TRD-${Date.now().toString().slice(-6)}`)
  const [clientType, setClientType] = useState('PJ')
  const [clientName, setClientName] = useState('')
  const [sourceLang, setSourceLang] = useState('pt')
  const [targetLang, setTargetLang] = useState('en')
  const [deadline, setDeadline] = useState<Date>()
  const [laudas, setLaudas] = useState('')
  const [deliveryFormat, setDeliveryFormat] = useState('digital')
  const [docCount, setDocCount] = useState('0')
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([])

  const folderUrl =
    activeCloudProvider === 'google_drive'
      ? `https://drive.google.com/drive/folders/${reference}`
      : activeCloudProvider === 'onedrive'
        ? oneDriveNetworkLink
          ? `${oneDriveNetworkLink.replace(/\/$/, '')}/${reference}`
          : `https://onedrive.live.com/?id=root/Projetos/${reference}`
        : `https://www.dropbox.com/sh/${reference}`

  const providerName =
    activeCloudProvider === 'google_drive'
      ? 'Google Drive'
      : activeCloudProvider === 'onedrive'
        ? 'Microsoft OneDrive / SharePoint'
        : 'Dropbox'

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)

      const newCloudFiles = newFiles.map((f) => {
        const id = Math.random().toString(36).substr(2, 9)
        return {
          id,
          name: f.name,
          size: f.size,
          status: 'uploading' as const,
          url:
            activeCloudProvider === 'google_drive'
              ? `https://drive.google.com/file/d/${id}/view`
              : activeCloudProvider === 'onedrive'
                ? folderUrl
                  ? `${folderUrl}/${f.name}`
                  : `https://onedrive.live.com/view.aspx?resid=${id}`
                : `https://www.dropbox.com/s/${id}/${f.name}`,
        }
      })

      setCloudFiles((prev) => [...prev, ...newCloudFiles])
      setDocCount((prev) => (Number(prev) + newFiles.length).toString())

      newCloudFiles.forEach((cf) => {
        setTimeout(
          () => {
            const isMissingLink = activeCloudProvider === 'onedrive' && !oneDriveNetworkLink
            const isError = isMissingLink ? true : Math.random() > 0.85

            setCloudFiles((prev) =>
              prev.map((p) =>
                p.id === cf.id ? { ...p, status: isError ? 'error' : 'synced' } : p,
              ),
            )

            if (isError) {
              toast({
                title: 'Erro de Sincronização',
                description: isMissingLink
                  ? `Falha ao transferir ${cf.name}. Link de rede Microsoft ausente ou inválido.`
                  : `Falha ao transferir ${cf.name}. Verifique a estabilidade da rede.`,
                variant: 'destructive',
              })
            }
          },
          1500 + Math.random() * 2000,
        )
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName)
      return toast({
        title: 'Erro',
        description: 'Nome do cliente é obrigatório.',
        variant: 'destructive',
      })
    if (!deadline)
      return toast({ title: 'Erro', description: 'Prazo é obrigatório.', variant: 'destructive' })

    addProject({
      title: `Ordem de Serviço ${reference}`,
      client: clientName,
      status: 'Orçamento',
      urgent: false,
      international: targetLang !== 'pt',
      physicalCopy: deliveryFormat === 'fisico',
      dueDate: deadline.toISOString(),
      laudas: Number(laudas) || 0,
      value: 0,
      documents: Number(docCount) || cloudFiles.length || 1,
      cloudProvider: activeCloudProvider,
      cloudFolderUrl: folderUrl,
      files: cloudFiles,
    })

    toast({ title: 'Projeto Criado com Sucesso!', description: `Referência: ${reference}` })
    navigate('/projects')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Criar Novo Projeto</h1>
        <p className="text-muted-foreground mt-1">
          Inicie uma nova ordem de serviço e defina as especificações.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Configuração do Projeto</CardTitle>
                <CardDescription>Preencha os detalhes navegando pelas abas abaixo.</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Cód. Referência
                </p>
                <p className="text-lg font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded">
                  {reference}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="client" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="client">1. Dados do Cliente</TabsTrigger>
                <TabsTrigger value="specs">2. Especificações</TabsTrigger>
                <TabsTrigger value="docs">3. Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Tipo de Pessoa</Label>
                  <RadioGroup
                    value={clientType}
                    onValueChange={setClientType}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-3 px-4 hover:bg-muted cursor-pointer transition-colors w-full">
                      <RadioGroupItem value="PJ" id="pj" />
                      <Label htmlFor="pj" className="cursor-pointer">
                        Pessoa Jurídica (PJ)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3 px-4 hover:bg-muted cursor-pointer transition-colors w-full">
                      <RadioGroupItem value="PF" id="pf" />
                      <Label htmlFor="pf" className="cursor-pointer">
                        Pessoa Física (PF)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName">
                    Nome / Razão Social <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="clientName"
                    placeholder="Ex: TechCorp Global S.A."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
              </TabsContent>

              <TabsContent value="specs" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Idioma de Origem</Label>
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">Português (BR)</SelectItem>
                        <SelectItem value="en">Inglês</SelectItem>
                        <SelectItem value="es">Espanhol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Idioma de Destino</Label>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">Inglês</SelectItem>
                        <SelectItem value="pt">Português (BR)</SelectItem>
                        <SelectItem value="es">Espanhol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <Label>
                      Prazo Esperado <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !deadline && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deadline ? (
                            format(deadline, 'dd/MM/yyyy')
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={deadline}
                          onSelect={setDeadline}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade de Laudas Estimada</Label>
                    <Input
                      type="number"
                      placeholder="Opcional"
                      value={laudas}
                      onChange={(e) => setLaudas(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <Label className="text-base font-semibold">Formato de Entrega Logística</Label>
                  <RadioGroup
                    value={deliveryFormat}
                    onValueChange={setDeliveryFormat}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="digital" id="digital" />
                      <Label htmlFor="digital">Apenas Digital</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fisico" id="fisico" />
                      <Label htmlFor="fisico">Via Física</Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>

              <TabsContent value="docs" className="space-y-6">
                {activeCloudProvider === 'onedrive' && !oneDriveNetworkLink && (
                  <Alert variant="destructive" className="bg-destructive/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuração Pendente</AlertTitle>
                    <AlertDescription className="flex items-center justify-between mt-2">
                      <span className="text-sm">
                        Link de rede do Microsoft SharePoint/OneDrive não configurado. As
                        sincronizações podem falhar.
                      </span>
                      <Button variant="destructive" size="sm" asChild className="h-8 shrink-0">
                        <Link to="/settings">Configurar Link</Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {activeCloudProvider && (
                  <Alert className="bg-primary/5 border-primary/20">
                    <Cloud className="h-4 w-4 text-primary" />
                    <AlertTitle>Sincronização em Nuvem Ativa</AlertTitle>
                    <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
                      <span className="text-sm truncate max-w-[400px]">
                        Pasta mapeada no <strong>{providerName}</strong>:{' '}
                        {activeCloudProvider === 'onedrive' && oneDriveNetworkLink
                          ? `.../${reference}`
                          : `/${reference}`}
                      </span>
                      {!(activeCloudProvider === 'onedrive' && !oneDriveNetworkLink) && (
                        <Button variant="outline" size="sm" asChild className="h-8 shrink-0">
                          <a href={folderUrl} target="_blank" rel="noreferrer">
                            <FolderOpen className="h-3 w-3 mr-2" /> Abrir Diretório
                          </a>
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div
                  className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-10 text-center cursor-pointer bg-slate-50/30 dark:bg-slate-900/30"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFiles({ target: { files: e.dataTransfer.files } } as any)
                  }}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    onChange={handleFiles}
                  />
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">Upload de Arquivos</h3>
                  <p className="text-sm text-muted-foreground">
                    Arraste os documentos aqui para sincronizar direto com a nuvem.
                  </p>
                </div>

                {cloudFiles.length > 0 && (
                  <div className="bg-card border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Arquivo</TableHead>
                          <TableHead>Tamanho</TableHead>
                          <TableHead>Status Nuvem</TableHead>
                          <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cloudFiles.map((f) => (
                          <TableRow key={f.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[200px]" title={f.name}>
                                {f.name}
                              </span>
                            </TableCell>
                            <TableCell>{(f.size / 1024).toFixed(1)} KB</TableCell>
                            <TableCell>
                              {f.status === 'uploading' ? (
                                <Badge
                                  variant="outline"
                                  className="text-amber-500 border-amber-500/30 bg-amber-500/10 gap-1 whitespace-nowrap"
                                >
                                  <Loader2 className="h-3 w-3 animate-spin" /> Sincronizando
                                </Badge>
                              ) : f.status === 'error' ? (
                                <Badge
                                  variant="outline"
                                  className="text-destructive border-destructive/30 bg-destructive/10 gap-1 whitespace-nowrap"
                                >
                                  <AlertCircle className="h-3 w-3" /> Falha
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 gap-1 whitespace-nowrap"
                                >
                                  <CheckCircle2 className="h-3 w-3" /> Sincronizado
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
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t p-6 flex justify-between">
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" className="min-w-[150px]">
              Registrar Projeto
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
