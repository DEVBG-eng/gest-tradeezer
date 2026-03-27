import { useState, useCallback } from 'react'
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
  CheckCircle,
  ChevronRight,
  Trash2,
  Plus,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import useProjectStore, {
  CloudFile,
  ProjectStatus,
  Project,
  ALL_STATUSES,
} from '@/stores/useProjectStore'
import useSettingsStore from '@/stores/useSettingsStore'
import { cn } from '@/lib/utils'
import { LanguageCombobox, LANGUAGES } from '@/components/LanguageCombobox'
import { ProposalPrintTemplate } from '@/components/projects/ProposalPrintTemplate'
import { mapProjectToPrintData } from '@/lib/project-utils'

const SERVICES_OPTS = [
  { id: 'digital', label: 'Via Digital', key: 'digital' as const },
  { id: 'fisico', label: 'Via Física', key: 'fisico' as const },
  { id: 'apostilamento', label: 'Apostilamento de Haia', key: 'apostilamento' as const },
  {
    id: 'apostilamentoDigital',
    label: 'Apostilamento Digital',
    key: 'apostilamentoDigital' as const,
  },
  { id: 'apostilamentoFisico', label: 'Apostilamento Físico', key: 'apostilamentoFisico' as const },
  { id: 'reconhecimento', label: 'Reconhecimento de Firma', key: 'reconhecimentoFirma' as const },
  {
    id: 'autenticacaoDigital',
    label: 'Autenticação documento Digital',
    key: 'autenticacaoDigital' as const,
  },
  { id: 'frete', label: 'Frete', key: 'frete' as const },
  { id: 'dhl', label: 'DHL (envio para fora do Brasil)', key: 'dhl' as const },
]

const TRANSLATION_TYPES = [
  'Tradução Juramentada',
  'Tradução Técnica',
  'Tradução Simultânea',
  'Tradução Consecutiva',
  'Locação de Equipamentos',
]

interface ItemInput {
  id?: string
  description: string
  laudas: string
  valorLauda: string
}

export default function CreateProject() {
  const navigate = useNavigate()
  const { addProject } = useProjectStore()
  const { activeCloudProvider, oneDriveNetworkLink } = useSettingsStore()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('client')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [reference, setReference] = useState(`TRD-${Date.now().toString().slice(-6)}`)
  const [clientType, setClientType] = useState('PJ')
  const [clientName, setClientName] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('Orçamento')
  const [sourceLang, setSourceLang] = useState('pt')
  const [targetLang, setTargetLang] = useState('en')

  const [startDate, setStartDate] = useState<Date>()
  const [deadline, setDeadline] = useState<Date>()

  const [docCount, setDocCount] = useState('0')
  const [documentType, setDocumentType] = useState('')
  const [translationType, setTranslationType] = useState('')
  const [observations, setObservations] = useState('')
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([])

  const [items, setItems] = useState<ItemInput[]>([{ description: '', laudas: '', valorLauda: '' }])

  const [services, setServices] = useState({
    digital: true,
    fisico: false,
    apostilamento: false,
    apostilamentoDigital: false,
    apostilamentoFisico: false,
    reconhecimentoFirma: false,
    autenticacaoDigital: false,
    frete: false,
    dhl: false,
  })

  const [showProposal, setShowProposal] = useState(false)
  const [createdProject, setCreatedProject] = useState<Project | null>(null)

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
    if (!e.target.files?.length) return
    const newFiles = Array.from(e.target.files)

    const newCloudFiles = newFiles.map((f) => {
      const id = Math.random().toString(36).substring(2, 11)
      const url =
        activeCloudProvider === 'google_drive'
          ? `https://drive.google.com/file/d/${id}/view`
          : activeCloudProvider === 'onedrive'
            ? folderUrl
              ? `${folderUrl}/${f.name}`
              : `https://onedrive.live.com/view.aspx?resid=${id}`
            : `https://www.dropbox.com/s/${id}/${f.name}`

      return { id, name: f.name, size: f.size, status: 'uploading' as const, url }
    })

    setCloudFiles((prev) => [...prev, ...newCloudFiles])
    setDocCount((prev) => (Number(prev) + newFiles.length).toString())

    newCloudFiles.forEach((cf) => {
      setTimeout(
        () => {
          const isMissingLink = activeCloudProvider === 'onedrive' && !oneDriveNetworkLink
          const isError = isMissingLink ? true : Math.random() > 0.85

          setCloudFiles((prev) =>
            prev.map((p) => (p.id === cf.id ? { ...p, status: isError ? 'error' : 'synced' } : p)),
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

  const updateItem = (index: number, field: keyof ItemInput, value: string) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleValorChange = (index: number, val: string) => {
    const digits = val.replace(/\D/g, '')
    if (!digits) {
      updateItem(index, 'valorLauda', '')
      return
    }
    const num = parseInt(digits, 10) / 100
    updateItem(
      index,
      'valorLauda',
      num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    )
  }

  const handleLaudasChange = (index: number, val: string) => {
    if (/^\d*[.,]?\d*$/.test(val)) {
      updateItem(index, 'laudas', val)
    }
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const computedLaudas = items.reduce(
    (acc, item) => acc + (Number(item.laudas.replace(',', '.')) || 0),
    0,
  )
  const computedValue = items.reduce(
    (acc, item) =>
      acc +
      (Number(item.laudas.replace(',', '.')) || 0) *
        (Number(item.valorLauda.replace(/\./g, '').replace(',', '.')) || 0),
    0,
  )

  const handleSave = async (generatePdf: boolean) => {
    if (!reference.trim()) {
      return toast({
        title: 'Erro',
        description: 'Código de Referência é obrigatório.',
        variant: 'destructive',
      })
    }
    if (!clientName.trim()) {
      return toast({
        title: 'Erro',
        description: 'Nome do cliente é obrigatório.',
        variant: 'destructive',
      })
    }
    if (!translationType) {
      return toast({
        title: 'Erro',
        description: 'A Categoria do Serviço é obrigatória.',
        variant: 'destructive',
      })
    }
    if (!startDate) {
      return toast({
        title: 'Erro',
        description: 'Data de Entrada é obrigatória.',
        variant: 'destructive',
      })
    }
    if (!deadline) {
      return toast({
        title: 'Erro',
        description: 'Data de Entrega é obrigatória.',
        variant: 'destructive',
      })
    }

    const projectItems = items.map((i) => ({
      description: i.description,
      laudas: Number(i.laudas.replace(',', '.')) || 0,
      valorLauda: Number(i.valorLauda.replace(/\./g, '').replace(',', '.')) || 0,
      total:
        (Number(i.laudas.replace(',', '.')) || 0) *
        (Number(i.valorLauda.replace(/\./g, '').replace(',', '.')) || 0),
    }))

    const newProjectData = {
      id: reference,
      title: `Ordem de Serviço ${reference}`,
      client: clientName,
      status,
      urgent: false,
      international: sourceLang !== 'pt' || targetLang !== 'pt',
      physicalCopy: services.fisico,
      dueDate: deadline.toISOString(),
      entryDate: startDate.toISOString(),
      laudas: computedLaudas,
      valorLauda: computedLaudas > 0 ? computedValue / computedLaudas : 0,
      value: computedValue,
      documents: Number(docCount) || cloudFiles.length || 1,
      cloudProvider: activeCloudProvider,
      cloudFolderUrl: folderUrl,
      files: cloudFiles,
      sourceLang,
      targetLang,
      documentType,
      translationType,
      observations,
      digitalCopy: services.digital,
      hagueApostille: services.apostilamento,
      digitalApostille: services.apostilamentoDigital,
      physicalApostille: services.apostilamentoFisico,
      notarization: services.reconhecimentoFirma,
      digitalAuthentication: services.autenticacaoDigital,
      shipping: services.frete,
      internationalShipping: services.dhl,
      items: projectItems,
    }

    setSaving(true)
    setFieldErrors({})
    try {
      await addProject(newProjectData)

      if (generatePdf) {
        setCreatedProject({ ...newProjectData, pbId: '' } as Project)
        setShowProposal(true)
      } else {
        toast({ title: 'Projeto Criado com Sucesso!', description: `Referência: ${reference}` })
        navigate('/projects')
      }
    } catch (e: any) {
      if (e?.message === 'Cód. Referência duplicado' || String(e).includes('duplicado')) {
        setFieldErrors({
          reference: 'O código de referência já está em uso. Por favor, utilize um código único.',
        })
        setActiveTab('budget')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCloseProposal = useCallback(() => {
    setShowProposal(false)
    toast({ title: 'Projeto Criado com Sucesso!', description: `Referência: ${reference}` })
    navigate('/projects')
  }, [navigate, reference, toast])

  const missingFields = []
  if (!reference.trim()) missingFields.push('Cód. de referência (Aba 4)')
  if (!clientName.trim()) missingFields.push('Nome / Razão Social (Aba 1)')
  if (!translationType) missingFields.push('Categoria do Serviço (Aba 2)')
  if (!startDate) missingFields.push('Data de Entrada (Aba 2)')
  if (!deadline) missingFields.push('Data de Entrega (Aba 2)')
  if (items.some((i) => !i.description.trim() || !i.laudas || !i.valorLauda)) {
    missingFields.push('Todos os campos dos Itens do Projeto devem estar preenchidos (Aba 2)')
  }

  const isFormValid = missingFields.length === 0

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {showProposal && createdProject && (
        <ProposalPrintTemplate
          data={mapProjectToPrintData(createdProject)}
          autoPrint={true}
          onClose={handleCloseProposal}
        />
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Criar Novo Projeto</h1>
        <p className="text-muted-foreground mt-1">
          Inicie uma nova ordem de serviço e defina as especificações.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSave(false)
        }}
      >
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 mb-6 h-auto p-1 gap-1">
                <TabsTrigger
                  value="client"
                  className="whitespace-normal h-auto py-2 text-xs sm:text-sm"
                >
                  1. Dados do Cliente
                </TabsTrigger>
                <TabsTrigger
                  value="specs"
                  className="whitespace-normal h-auto py-2 text-xs sm:text-sm"
                >
                  2. Especificações / Orçamento
                </TabsTrigger>
                <TabsTrigger
                  value="docs"
                  className="whitespace-normal h-auto py-2 text-xs sm:text-sm"
                >
                  3. Documentos
                </TabsTrigger>
                <TabsTrigger
                  value="budget"
                  className="whitespace-normal h-auto py-2 text-xs sm:text-sm"
                >
                  4. Resumo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Tipo de Pessoa</Label>
                  <RadioGroup
                    value={clientType}
                    onValueChange={setClientType}
                    className="flex gap-6"
                  >
                    <label
                      htmlFor="pj"
                      className="flex items-center space-x-2 border rounded-md p-3 px-4 hover:bg-muted cursor-pointer transition-colors w-full"
                    >
                      <RadioGroupItem value="PJ" id="pj" />
                      <span className="flex-1 text-sm font-medium">Pessoa Jurídica (PJ)</span>
                    </label>
                    <label
                      htmlFor="pf"
                      className="flex items-center space-x-2 border rounded-md p-3 px-4 hover:bg-muted cursor-pointer transition-colors w-full"
                    >
                      <RadioGroupItem value="PF" id="pf" />
                      <span className="flex-1 text-sm font-medium">Pessoa Física (PF)</span>
                    </label>
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
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select value={status} onValueChange={(val) => setStatus(val as ProjectStatus)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    Categoria do Serviço <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={translationType}
                    onValueChange={setTranslationType}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {TRANSLATION_TYPES.map((type) => (
                      <label
                        key={type}
                        htmlFor={`type-${type}`}
                        className={cn(
                          'flex items-center space-x-2 border rounded-md p-4 cursor-pointer transition-colors w-full',
                          translationType === type
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted',
                        )}
                      >
                        <RadioGroupItem value={type} id={`type-${type}`} />
                        <span className="flex-1 text-sm font-medium leading-none">{type}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex items-end gap-2 sm:gap-4">
                  <div className="flex-1">
                    <LanguageCombobox
                      label="Idioma de Origem *"
                      value={sourceLang}
                      onChange={setSourceLang}
                    />
                  </div>
                  <div className="flex items-center justify-center h-10 shrink-0 text-muted-foreground">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <LanguageCombobox
                      label="Idioma de Destino *"
                      value={targetLang}
                      onChange={setTargetLang}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tipo de Documento</Label>
                    <Input
                      placeholder="Ex: Certidão de Nascimento, Manual Técnico, Contrato"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade de Documentos (Estimado)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 1"
                      value={docCount}
                      onChange={(e) => setDocCount(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <Label>
                      Data de Entrada <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !startDate && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, 'dd/MM/yyyy')
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label>
                      Data de Entrega <span className="text-destructive">*</span>
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
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Label className="text-base font-semibold">
                      Itens do Projeto <span className="text-destructive">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setItems([...items, { description: '', laudas: '', valorLauda: '' }])
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" /> Adicionar Item
                    </Button>
                  </div>
                  <div className="bg-card border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Descrição</TableHead>
                          <TableHead className="w-[120px]">Laudas</TableHead>
                          <TableHead className="w-[140px]">Valor (R$)</TableHead>
                          <TableHead className="w-[120px] text-right">Total</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="p-2">
                              <Input
                                value={item.description}
                                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                placeholder="Ex: Certidão..."
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={item.laudas}
                                onChange={(e) => handleLaudasChange(idx, e.target.value)}
                                placeholder="0"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={item.valorLauda}
                                onChange={(e) => handleValorChange(idx, e.target.value)}
                                placeholder="0,00"
                              />
                            </TableCell>
                            <TableCell className="p-2 text-right font-medium">
                              {(
                                (Number(item.laudas.replace(',', '.')) || 0) *
                                (Number(item.valorLauda.replace(/\./g, '').replace(',', '.')) || 0)
                              ).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </TableCell>
                            <TableCell className="p-2 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(idx)}
                                disabled={items.length === 1}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <Label className="text-base font-semibold">Serviços e Logística</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/50">
                    {SERVICES_OPTS.map(({ id, label, key }) => (
                      <div key={id} className="flex items-center space-x-2">
                        <Checkbox
                          id={id}
                          checked={services[key]}
                          onCheckedChange={(c) => setServices((prev) => ({ ...prev, [key]: !!c }))}
                        />
                        <Label htmlFor={id} className="font-normal cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
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

              <TabsContent value="budget" className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="referenceTab"
                    className={cn(
                      'text-base font-semibold',
                      fieldErrors.reference && 'text-destructive',
                    )}
                  >
                    Cód. de referência <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="referenceTab"
                    value={reference}
                    onChange={(e) => {
                      setReference(e.target.value)
                      if (fieldErrors.reference) setFieldErrors({})
                    }}
                    placeholder="Ex: TRD-123456"
                    className={cn(
                      'max-w-md font-mono font-bold',
                      fieldErrors.reference
                        ? 'border-destructive text-destructive focus-visible:ring-destructive'
                        : 'text-primary bg-primary/5',
                    )}
                    required
                  />
                  {fieldErrors.reference && (
                    <p className="text-sm font-medium text-destructive">{fieldErrors.reference}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Código único para identificação do projeto e sincronização em nuvem.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Instruções especiais, notas internas, ou outras observações do documento..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="min-h-[100px] resize-y"
                  />
                </div>

                {missingFields.length > 0 ? (
                  <Alert variant="destructive" className="bg-destructive/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Informações Pendentes</AlertTitle>
                    <AlertDescription>
                      Preencha os seguintes campos obrigatórios antes de finalizar o projeto:
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm font-medium">
                        {missingFields.map((field) => (
                          <li key={field}>{field}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <AlertTitle>Validação Concluída</AlertTitle>
                    <AlertDescription>
                      Todos os campos obrigatórios foram preenchidos. Você pode registrar o projeto
                      ou gerar a proposta.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium tracking-tight border-b pb-2">
                    Painel de Sincronização e Resumo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3 bg-muted/30">
                        <CardTitle className="text-base">Cliente e Especificações</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nome/Razão Social</span>
                          <span className="font-medium text-right">
                            {clientName || '-'} {clientName && `(${clientType})`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <span className="font-medium text-right">{status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Categoria do Serviço</span>
                          <span className="font-medium text-right">{translationType || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo de Documento</span>
                          <span className="font-medium text-right">{documentType || '-'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="pb-3 bg-muted/30">
                        <CardTitle className="text-base">Prazos e Idiomas</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data de Entrada</span>
                          <span className="font-medium text-right">
                            {startDate ? format(startDate, 'dd/MM/yyyy') : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Prazo de Entrega</span>
                          <span className="font-medium text-right">
                            {deadline ? format(deadline, 'dd/MM/yyyy') : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Idioma de Origem</span>
                          <span className="font-medium text-right">
                            {LANGUAGES.find((l) => l.value === sourceLang)?.label || sourceLang}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Idioma de Destino</span>
                          <span className="font-medium text-right">
                            {LANGUAGES.find((l) => l.value === targetLang)?.label || targetLang}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm md:col-span-2">
                      <CardHeader className="pb-3 bg-muted/30">
                        <CardTitle className="text-base">Serviços e Valores</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4 text-sm">
                        <div className="flex flex-col gap-2">
                          <span className="text-muted-foreground">
                            Logística e Serviços Adicionais:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {SERVICES_OPTS.filter((s) => services[s.key]).map((s) => (
                              <Badge
                                key={s.id}
                                variant="secondary"
                                className="bg-primary/10 text-primary hover:bg-primary/20"
                              >
                                {s.label}
                              </Badge>
                            ))}
                            {Object.values(services).every((v) => !v) && (
                              <span className="text-muted-foreground italic">
                                Nenhum serviço adicional selecionado
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-muted-foreground block">
                              Quantidade de Laudas (Itens)
                            </span>
                            <span className="font-medium text-base">{computedLaudas || '-'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground block">
                              Valor Total do Projeto
                            </span>
                            <span className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                              {computedValue.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t p-6 flex justify-between">
            <Button variant="ghost" type="button" onClick={() => navigate(-1)} disabled={saving}>
              Cancelar
            </Button>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSave(true)}
                disabled={!isFormValid || saving}
              >
                Gerar Proposta
              </Button>
              <Button
                type="submit"
                size="lg"
                className="min-w-[150px]"
                disabled={!isFormValid || saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Projeto
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
