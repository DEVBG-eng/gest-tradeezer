import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  ChevronsUpDown,
  Check,
  Info,
} from 'lucide-react'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useToast } from '@/hooks/use-toast'
import useProjectStore, {
  CloudFile,
  ProjectStatus,
  Project,
  ALL_STATUSES,
} from '@/stores/useProjectStore'
import useClientStore from '@/stores/useClientStore'
import { getNextProjectReference } from '@/services/projetos'
import { cn } from '@/lib/utils'
import { LanguageCombobox, LANGUAGES } from '@/components/LanguageCombobox'
import { ProposalPrintTemplate } from '@/components/projects/ProposalPrintTemplate'
import { mapProjectToPrintData } from '@/lib/project-utils'
import { EditableProposalPreview } from '@/components/projects/EditableProposalPreview'

const SERVICES_OPTS = [
  { id: 'digital', label: 'Via Digital', key: 'digital' as const },
  { id: 'fisico', label: 'Via Física', key: 'fisico' as const },
  { id: 'certidao', label: 'Certidão', key: 'certidao' as const },
  { id: 'divorcio', label: 'Divórcio', key: 'divorcio' as const },
  { id: 'declaracao', label: 'Declaração', key: 'declaracao' as const },
  { id: 'procuracao', label: 'Procuração', key: 'procuracao' as const },
  { id: 'certidaoObjetoPe', label: 'Certidão Objeto e pé', key: 'certidao_objeto_pe' as const },
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
  { id: 'frete-jk', label: 'Frete JK', key: 'freteJk' as const },
]

const TRANSLATION_TYPES = [
  'Tradução Juramentada',
  'Tradução Técnica',
  'Tradução Simultânea',
  'Tradução Consecutiva',
  'Locação de Equipamentos',
]

const STEPS = [
  { id: 'client', label: 'Dados do Cliente' },
  { id: 'specs', label: 'Especificações' },
  { id: 'docs', label: 'Documentos' },
  { id: 'budget', label: 'Resumo' },
]

interface ItemInput {
  id?: string
  description: string
  laudas: string
  valorLauda: string
  _sourceServiceKey?: string
  _isDirty?: boolean
}

export default function CreateProject() {
  const navigate = useNavigate()
  const { addProject } = useProjectStore()
  const { clients } = useClientStore()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(0)
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [reference, setReference] = useState('')
  const [clientMode, setClientMode] = useState<'registered' | 'manual'>('registered')

  useEffect(() => {
    let mounted = true
    getNextProjectReference().then((ref) => {
      if (mounted && !reference) {
        setReference(ref)
      }
    })
    return () => {
      mounted = false
    }
  }, [reference])
  const [clientType, setClientType] = useState('PJ')
  const [clientName, setClientName] = useState('')
  const [clientRef, setClientRef] = useState<string>('')
  const [clientOpen, setClientOpen] = useState(false)
  const [status, setStatus] = useState<ProjectStatus>('Orçamento')
  const [sourceLang, setSourceLang] = useState('pt')
  const [targetLang, setTargetLang] = useState('en')

  const [startDate, setStartDate] = useState<Date>(new Date())
  const [deadline, setDeadline] = useState<Date>()

  const [docCount, setDocCount] = useState('0')
  const [documentType, setDocumentType] = useState('')
  const [translationType, setTranslationType] = useState('')
  const [observations, setObservations] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [customPaymentMethod, setCustomPaymentMethod] = useState('')
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([])

  const [items, setItems] = useState<ItemInput[]>([{ description: '', laudas: '', valorLauda: '' }])

  const [services, setServices] = useState({
    digital: true,
    fisico: false,
    certidao: false,
    divorcio: false,
    declaracao: false,
    procuracao: false,
    certidao_objeto_pe: false,
    apostilamento: false,
    apostilamentoDigital: false,
    apostilamentoFisico: false,
    reconhecimentoFirma: false,
    autenticacaoDigital: false,
    frete: false,
    dhl: false,
    freteJk: false,
  })

  const [showProposal, setShowProposal] = useState(false)
  const [createdProject, setCreatedProject] = useState<Project | null>(null)

  const sharepointBase =
    'https://gbtraducoes.sharepoint.com/sites/tradeezer/Documentos%20Compartilhados/Forms/AllItems.aspx?id=%2Fsites%2Ftradeezer%2FDocumentos%20Compartilhados%2FProjetos%2FProtocolos'
  const folderUrl = reference
    ? `${sharepointBase}%2F${encodeURIComponent(reference)}`
    : sharepointBase

  const handleClientSelect = (val: string) => {
    setClientRef(val)
    setStepErrors((p) => ({ ...p, clientRef: '' }))
    if (val) {
      const c = clients.find((cl) => cl.id === val)
      if (c) {
        setClientName(c.nome)
        if (c.cnpj && c.cnpj.replace(/\D/g, '').length > 11) setClientType('PJ')
        else if (c.cnpj) setClientType('PF')

        if (c.valor_lauda_padrao) {
          const formatted = c.valor_lauda_padrao.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          setItems(items.map((i) => ({ ...i, valorLauda: formatted, _isDirty: true })))
        } else {
          setItems(items.map((i) => ({ ...i, valorLauda: '', _isDirty: true })))
        }

        if (c.forma_pagamento) {
          if (
            ['Link Cartão de Crédito', 'Boleto Bancário', 'Pix à Vista', 'Dinheiro'].includes(
              c.forma_pagamento,
            )
          ) {
            setPaymentMethod(c.forma_pagamento)
          } else {
            setPaymentMethod('Outro')
            setCustomPaymentMethod(c.forma_pagamento)
          }
        } else {
          setPaymentMethod('')
          setCustomPaymentMethod('')
        }

        if (c.idiomas_frequentes) {
          const freq = c.idiomas_frequentes.toLowerCase()
          const foundLangs = LANGUAGES.filter(
            (l) => freq.includes(l.label.toLowerCase()) || freq.includes(l.value.toLowerCase()),
          )

          if (foundLangs.length > 0) {
            const foreignLang = foundLangs.find((l) => l.value !== 'pt')
            if (foreignLang) {
              setTargetLang(foreignLang.value)
              setSourceLang('pt')
            } else {
              setSourceLang('pt')
            }
          }
        }
      }
    } else {
      setClientName('')
      setItems(items.map((i) => ({ ...i, valorLauda: '', _isDirty: true })))
    }
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const newFiles = Array.from(e.target.files)

    const newCloudFiles = newFiles.map((f) => {
      const id = Math.random().toString(36).substring(2, 11)
      const url = `${folderUrl}&FilterField1=LinkFilename&FilterValue1=${encodeURIComponent(f.name)}`

      return { id, name: f.name, size: f.size, status: 'uploading' as const, url }
    })

    setCloudFiles((prev) => [...prev, ...newCloudFiles])
    setDocCount((prev) => (Number(prev) + newFiles.length).toString())

    newCloudFiles.forEach((cf) => {
      setTimeout(
        () => {
          const isError = Math.random() > 0.85

          setCloudFiles((prev) =>
            prev.map((p) => (p.id === cf.id ? { ...p, status: isError ? 'error' : 'synced' } : p)),
          )

          if (isError) {
            toast({
              title: 'Erro de Sincronização',
              description: `Falha ao transferir ${cf.name}. Verifique a estabilidade da rede.`,
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
    newItems[index] = { ...newItems[index], [field]: value, _isDirty: true }
    setItems(newItems)
    setStepErrors((p) => ({ ...p, items: '' }))
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
    } else {
      setItems([{ description: '', laudas: '', valorLauda: '' }])
    }
  }

  const handleServiceToggle = (key: keyof typeof services, checked: boolean, label: string) => {
    setServices((prev) => ({ ...prev, [key]: checked }))

    if (checked) {
      let price = 0
      const clientObj = clientRef ? clients.find((c) => c.id === clientRef) : null

      if (clientObj) {
        if (key === 'certidao') {
          price = services.digital
            ? clientObj.valor_certidao_digital || 0
            : services.fisico
              ? clientObj.valor_certidao_fisica || 0
              : 0
        } else if (key === 'procuracao') {
          price = services.digital
            ? clientObj.valor_procuracao_digital || 0
            : services.fisico
              ? clientObj.valor_procuracao_fisica || 0
              : 0
        } else if (key === 'frete') {
          price = clientObj.valor_frete || 0
        }
      }

      const formattedPrice = price.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

      setItems((prevItems) => {
        const isFirstEmpty =
          prevItems.length === 1 &&
          !prevItems[0].description &&
          !prevItems[0].laudas &&
          !prevItems[0].valorLauda

        const newItem: ItemInput = {
          description: label,
          laudas: '1',
          valorLauda: formattedPrice,
          _sourceServiceKey: key,
          _isDirty: false,
        }

        return isFirstEmpty ? [newItem] : [...prevItems, newItem]
      })
    } else {
      setItems((prevItems) => {
        const filtered = prevItems.filter(
          (item) =>
            !(item._sourceServiceKey === key && item.description === label && !item._isDirty),
        )
        return filtered.length === 0 ? [{ description: '', laudas: '', valorLauda: '' }] : filtered
      })
    }

    if (key === 'digital' || key === 'fisico') {
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item._isDirty) return item
          const clientObj = clientRef ? clients.find((c) => c.id === clientRef) : null
          if (!clientObj) return item

          if (item._sourceServiceKey === 'certidao' && item.description === 'Certidão') {
            const isDigital = key === 'digital' ? checked : services.digital
            const isFisico = key === 'fisico' ? checked : services.fisico
            const newPrice = isDigital
              ? clientObj.valor_certidao_digital || 0
              : isFisico
                ? clientObj.valor_certidao_fisica || 0
                : 0
            const formatted = newPrice.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
            return { ...item, valorLauda: formatted }
          }

          if (item._sourceServiceKey === 'procuracao' && item.description === 'Procuração') {
            const isDigital = key === 'digital' ? checked : services.digital
            const isFisico = key === 'fisico' ? checked : services.fisico
            const newPrice = isDigital
              ? clientObj.valor_procuracao_digital || 0
              : isFisico
                ? clientObj.valor_procuracao_fisica || 0
                : 0
            const formatted = newPrice.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
            return { ...item, valorLauda: formatted }
          }

          return item
        }),
      )
    }
  }

  const handleNext = () => {
    const errors: Record<string, string> = {}
    let isValid = true

    if (currentStep === 0) {
      if (clientMode === 'registered' && !clientRef) {
        errors.clientRef = 'A seleção do cliente é obrigatória.'
        isValid = false
      }
      if (clientMode === 'manual' && !clientName.trim()) {
        errors.clientName = 'O nome do cliente é obrigatório.'
        isValid = false
      }
    } else if (currentStep === 1) {
      if (!translationType) {
        errors.translationType = 'A Categoria do Serviço é obrigatória.'
        isValid = false
      }
      if (!startDate) {
        errors.startDate = 'A Data de Entrada é obrigatória.'
        isValid = false
      }
      if (!deadline) {
        errors.deadline = 'A Data de Entrega é obrigatória.'
        isValid = false
      }
      const hasInvalidItem = items.some((i) => !i.description.trim() || !i.laudas || !i.valorLauda)
      if (hasInvalidItem) {
        errors.items = 'Todos os campos dos Itens do Projeto devem estar preenchidos.'
        isValid = false
      }
    }

    setStepErrors(errors)

    if (isValid) {
      setCurrentStep((prev) => prev + 1)
    } else {
      toast({
        title: 'Atenção',
        description: 'Preencha os campos obrigatórios antes de avançar.',
        variant: 'destructive',
      })
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

  const [previewData, setPreviewData] = useState<Project | null>(null)

  const validateAndBuildData = () => {
    const errors: Record<string, string> = {}
    let isValid = true

    if (!reference.trim()) {
      errors.reference = 'Código de Referência é obrigatório.'
      isValid = false
    }

    if (!isValid) {
      setStepErrors(errors)
      toast({
        title: 'Atenção',
        description: 'Preencha os campos obrigatórios.',
        variant: 'destructive',
      })
      return null
    }

    const projectItems = items.map((i) => ({
      description: i.description,
      laudas: Number(i.laudas.replace(',', '.')) || 0,
      valorLauda: Number(i.valorLauda.replace(/\./g, '').replace(',', '.')) || 0,
      total:
        (Number(i.laudas.replace(',', '.')) || 0) *
        (Number(i.valorLauda.replace(/\./g, '').replace(',', '.')) || 0),
    }))

    return {
      id: reference,
      title: `Ordem de Serviço ${reference}`,
      client: clientName,
      clientRef: clientMode === 'registered' ? clientRef : '',
      status,
      urgent: false,
      international: sourceLang !== 'pt' || targetLang !== 'pt',
      physicalCopy: services.fisico,
      dueDate: deadline!.toISOString(),
      entryDate: startDate!.toISOString(),
      laudas: computedLaudas,
      valorLauda: computedLaudas > 0 ? computedValue / computedLaudas : 0,
      value: computedValue,
      documents: Number(docCount) || cloudFiles.length || 1,
      cloudProvider: 'sharepoint',
      cloudFolderUrl: folderUrl,
      pasta_url: folderUrl,
      files: cloudFiles,
      sourceLang,
      targetLang,
      documentType,
      translationType,
      observations,
      paymentMethod: paymentMethod === 'Outro' ? customPaymentMethod : paymentMethod,
      digitalCopy: services.digital,
      certidao: services.certidao,
      divorcio: services.divorcio,
      declaracao: services.declaracao,
      procuracao: services.procuracao,
      certidao_objeto_pe: services.certidao_objeto_pe,
      hagueApostille: services.apostilamento,
      digitalApostille: services.apostilamentoDigital,
      physicalApostille: services.apostilamentoFisico,
      notarization: services.reconhecimentoFirma,
      digitalAuthentication: services.autenticacaoDigital,
      shipping: services.frete,
      internationalShipping: services.dhl,
      freteJk: services.freteJk,
      items: projectItems,
    } as unknown as Project
  }

  const handleSave = async () => {
    const newProjectData = validateAndBuildData()
    if (!newProjectData) return

    setSaving(true)
    setStepErrors({})
    try {
      await addProject(newProjectData as any)
      toast({ title: 'Projeto Criado com Sucesso!', description: `Referência: ${reference}` })
      navigate('/projects')
    } catch (e: any) {
      if (e?.message === 'Cód. Referência duplicado' || String(e).includes('duplicado')) {
        setStepErrors({
          reference: 'O código de referência já está em uso. Por favor, utilize um código único.',
        })
      } else {
        toast({ title: 'Erro ao criar', description: String(e), variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleOpenPreview = () => {
    const data = validateAndBuildData()
    if (data) setPreviewData(data)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {previewData && (
        <EditableProposalPreview
          initialData={previewData}
          isOpen={true}
          onClose={() => setPreviewData(null)}
          onSave={async (finalData) => {
            await addProject(finalData as any)
          }}
          onPrintClose={() => {
            setPreviewData(null)
            toast({ title: 'Projeto Criado com Sucesso!', description: `Referência: ${reference}` })
            navigate('/projects')
          }}
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
          if (currentStep === STEPS.length - 1) handleSave()
          else handleNext()
        }}
      >
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-8">
            {/* Visual Stepper */}
            <div className="mb-10 px-2 sm:px-8">
              <div className="flex items-center justify-between relative z-0">
                <div className="absolute left-0 top-[15px] transform w-full h-0.5 bg-muted -z-10" />
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center gap-2 bg-card px-2">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                        currentStep > index
                          ? 'border-primary bg-primary text-primary-foreground'
                          : currentStep === index
                            ? 'border-primary text-primary bg-background'
                            : 'border-muted bg-muted text-muted-foreground',
                      )}
                    >
                      {currentStep > index ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium hidden sm:block',
                        currentStep >= index ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full mt-4">
              {currentStep === 0 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Modo de Inserção</Label>
                    <RadioGroup
                      value={clientMode}
                      onValueChange={(val) => {
                        setClientMode(val as 'registered' | 'manual')
                        setStepErrors({})
                        if (val === 'manual') {
                          setClientRef('')
                          setClientName('')
                          setClientType('PF')
                          setPaymentMethod('')
                          setCustomPaymentMethod('')
                        } else {
                          setClientRef('')
                          setClientName('')
                          setClientType('PJ')
                          setPaymentMethod('')
                          setCustomPaymentMethod('')
                        }
                      }}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <label
                        className={cn(
                          'flex items-center space-x-2 border rounded-md p-3 px-4 cursor-pointer transition-colors w-full',
                          clientMode === 'registered'
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted',
                        )}
                      >
                        <RadioGroupItem value="registered" />
                        <span className="flex-1 text-sm font-medium">Cliente Cadastrado</span>
                      </label>
                      <label
                        className={cn(
                          'flex items-center space-x-2 border rounded-md p-3 px-4 cursor-pointer transition-colors w-full',
                          clientMode === 'manual'
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted',
                        )}
                      >
                        <RadioGroupItem value="manual" />
                        <span className="flex-1 text-sm font-medium">
                          Entrada Manual (Avulso / PF)
                        </span>
                      </label>
                    </RadioGroup>
                  </div>

                  {clientMode === 'registered' ? (
                    <div className="space-y-2 flex flex-col">
                      <Label className={cn(stepErrors.clientRef && 'text-destructive')}>
                        Cliente <span className="text-destructive">*</span>
                      </Label>
                      <Popover open={clientOpen} onOpenChange={setClientOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={clientOpen}
                            className={cn(
                              'w-full justify-between font-normal',
                              !clientRef && 'text-muted-foreground',
                              stepErrors.clientRef && 'border-destructive',
                            )}
                          >
                            {clientRef
                              ? clients.find((c) => c.id === clientRef)?.nome
                              : 'Busque e selecione um cliente...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[var(--radix-popover-trigger-width)] p-0"
                          align="start"
                        >
                          <Command>
                            <CommandInput placeholder="Buscar cliente por nome ou documento..." />
                            <CommandList>
                              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                              <CommandGroup>
                                {clients.map((c) => (
                                  <CommandItem
                                    key={c.id!}
                                    value={`${c.nome} ${c.cnpj || ''}`}
                                    onSelect={() => {
                                      handleClientSelect(c.id!)
                                      setClientOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4 shrink-0',
                                        clientRef === c.id ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{c.nome}</span>
                                      {c.cnpj && (
                                        <span className="text-xs text-muted-foreground">
                                          {c.cnpj}
                                        </span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {stepErrors.clientRef && (
                        <p className="text-sm font-medium text-destructive">
                          {stepErrors.clientRef}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Os dados do cliente (valor de lauda, idiomas frequentes) serão preenchidos
                        automaticamente.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 flex flex-col animate-fade-in">
                      <Label className={cn(stepErrors.clientName && 'text-destructive')}>
                        Nome do Cliente <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="Digite o nome completo do cliente..."
                        value={clientName}
                        onChange={(e) => {
                          setClientName(e.target.value)
                          setStepErrors((p) => ({ ...p, clientName: '' }))
                        }}
                        className={cn(
                          stepErrors.clientName &&
                            'border-destructive focus-visible:ring-destructive',
                        )}
                      />
                      {stepErrors.clientName && (
                        <p className="text-sm font-medium text-destructive">
                          {stepErrors.clientName}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        O cliente será salvo apenas para este projeto, sem criar cadastro.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4 pt-2">
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
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  {clientMode === 'registered' &&
                    clientRef &&
                    (() => {
                      const selectedClient = clients.find((c) => c.id === clientRef)
                      if (!selectedClient) return null

                      const hasObs = !!selectedClient.observacoes?.trim()
                      const hasFrete = !!selectedClient.informacoes_frete?.trim()

                      if (!hasObs && !hasFrete) {
                        return (
                          <Alert className="bg-muted/30 border-border border-dashed text-muted-foreground">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <AlertTitle className="text-sm font-medium">
                              Informações do Cliente
                            </AlertTitle>
                            <AlertDescription className="text-xs mt-1">
                              Nenhuma observação cadastrada para este cliente no CRM.
                            </AlertDescription>
                          </Alert>
                        )
                      }

                      return (
                        <Alert className="bg-primary/5 border-primary/20">
                          <Info className="h-4 w-4 text-primary" />
                          <AlertTitle className="text-primary font-semibold">
                            Informações do Cliente (Referência)
                          </AlertTitle>
                          <AlertDescription className="space-y-3 mt-3 text-foreground">
                            {hasObs && (
                              <div className="bg-background/50 rounded-md p-3 border border-primary/10">
                                <span className="font-semibold text-[10px] uppercase text-primary/80 tracking-wider flex items-center gap-1 mb-1">
                                  <FileText className="w-3 h-3" />
                                  Observações do CRM
                                </span>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                  {selectedClient.observacoes}
                                </p>
                              </div>
                            )}
                            {hasFrete && (
                              <div className="bg-background/50 rounded-md p-3 border border-primary/10">
                                <span className="font-semibold text-[10px] uppercase text-primary/80 tracking-wider flex items-center gap-1 mb-1">
                                  <Info className="w-3 h-3" />
                                  Regras de Frete/Endereço
                                </span>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                  {selectedClient.informacoes_frete}
                                </p>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )
                    })()}

                  <div className="space-y-4">
                    <Label
                      className={cn(
                        'text-base font-semibold',
                        stepErrors.translationType && 'text-destructive',
                      )}
                    >
                      Categoria do Serviço <span className="text-destructive">*</span>
                    </Label>
                    {stepErrors.translationType && (
                      <p className="text-sm font-medium text-destructive -mt-2 mb-2">
                        {stepErrors.translationType}
                      </p>
                    )}
                    <RadioGroup
                      value={translationType}
                      onValueChange={(val) => {
                        setTranslationType(val)
                        setStepErrors((p) => ({ ...p, translationType: '' }))
                      }}
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
                      <Label>Informações/OBS*</Label>
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
                      <Label className={cn(stepErrors.startDate && 'text-destructive')}>
                        Data de Entrada <span className="text-destructive">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !startDate && 'text-muted-foreground',
                              stepErrors.startDate && 'border-destructive',
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
                            onSelect={(d) => {
                              if (d) setStartDate(d)
                              setStepErrors((p) => ({ ...p, startDate: '' }))
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {stepErrors.startDate && (
                        <p className="text-sm font-medium text-destructive">
                          {stepErrors.startDate}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 flex flex-col">
                      <Label className={cn(stepErrors.deadline && 'text-destructive')}>
                        Data de Entrega <span className="text-destructive">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !deadline && 'text-muted-foreground',
                              stepErrors.deadline && 'border-destructive',
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
                            onSelect={(d) => {
                              setDeadline(d)
                              setStepErrors((p) => ({ ...p, deadline: '' }))
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {stepErrors.deadline && (
                        <p className="text-sm font-medium text-destructive">
                          {stepErrors.deadline}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <Label
                        className={cn(
                          'text-base font-semibold',
                          stepErrors.items && 'text-destructive',
                        )}
                      >
                        Itens do Projeto <span className="text-destructive">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const defaultValor = clientRef
                            ? clients.find((c) => c.id === clientRef)?.valor_lauda_padrao
                            : undefined
                          const formatted = defaultValor
                            ? defaultValor.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : ''
                          setItems([
                            ...items,
                            { description: '', laudas: '', valorLauda: formatted, _isDirty: true },
                          ])
                          setStepErrors((p) => ({ ...p, items: '' }))
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Adicionar Item
                      </Button>
                    </div>
                    {stepErrors.items && (
                      <p className="text-sm font-medium text-destructive">{stepErrors.items}</p>
                    )}
                    <div className="bg-card border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Descrição</TableHead>
                            <TableHead className="w-[120px]">Itens&nbsp;</TableHead>
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
                                  (Number(item.valorLauda.replace(/\./g, '').replace(',', '.')) ||
                                    0)
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
                            onCheckedChange={(c) => handleServiceToggle(key, !!c, label)}
                          />
                          <Label htmlFor={id} className="font-normal cursor-pointer">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <Alert className="bg-primary/5 border-primary/20">
                    <Cloud className="h-4 w-4 text-primary" />
                    <AlertTitle>Sincronização com SharePoint</AlertTitle>
                    <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
                      <span className="text-sm truncate max-w-[400px]">
                        Diretório mapeado:{' '}
                        <strong>/Projetos/Protocolos/{reference || '[Pendente]'}</strong>
                      </span>
                      {reference && (
                        <Button variant="outline" size="sm" asChild className="h-8 shrink-0">
                          <a href={folderUrl} target="_blank" rel="noreferrer">
                            <FolderOpen className="h-3 w-3 mr-2" /> Abrir Diretório
                          </a>
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>

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
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <Label
                      htmlFor="referenceTab"
                      className={cn(
                        'text-base font-semibold',
                        stepErrors.reference && 'text-destructive',
                      )}
                    >
                      Cód. de referência <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="referenceTab"
                      value={reference}
                      onChange={(e) => {
                        setReference(e.target.value)
                        setStepErrors((p) => ({ ...p, reference: '' }))
                      }}
                      placeholder="Ex: TRD-123456"
                      className={cn(
                        'max-w-md font-mono font-bold',
                        stepErrors.reference
                          ? 'border-destructive text-destructive focus-visible:ring-destructive'
                          : 'text-primary bg-primary/5',
                      )}
                    />
                    {stepErrors.reference && (
                      <p className="text-sm font-medium text-destructive">{stepErrors.reference}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Código único para identificação do projeto e sincronização em nuvem.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Forma de Pagamento</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Link Cartão de Crédito">
                            Link Cartão de Crédito
                          </SelectItem>
                          <SelectItem value="Boleto Bancário">Boleto Bancário</SelectItem>
                          <SelectItem value="Pix à Vista">Pix à Vista</SelectItem>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          {paymentMethod &&
                            ![
                              'Link Cartão de Crédito',
                              'Boleto Bancário',
                              'Pix à Vista',
                              'Dinheiro',
                              'Outro',
                            ].includes(paymentMethod) && (
                              <SelectItem value={paymentMethod}>{paymentMethod}</SelectItem>
                            )}
                          <SelectItem value="Outro">Outro...</SelectItem>
                        </SelectContent>
                      </Select>
                      {paymentMethod === 'Outro' && (
                        <Input
                          placeholder="Especifique a forma de pagamento"
                          value={customPaymentMethod}
                          onChange={(e) => setCustomPaymentMethod(e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>
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

                  <Alert className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <AlertTitle>Validação Concluída</AlertTitle>
                    <AlertDescription>
                      Todos os passos anteriores foram validados. Você pode registrar o projeto ou
                      gerar a proposta.
                    </AlertDescription>
                  </Alert>

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
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t p-6 flex justify-between">
            <Button
              variant="ghost"
              type="button"
              onClick={
                currentStep === 0 ? () => navigate(-1) : () => setCurrentStep((prev) => prev - 1)
              }
              disabled={saving}
            >
              {currentStep === 0 ? 'Cancelar' : 'Voltar'}
            </Button>
            <div className="flex space-x-3">
              {currentStep === STEPS.length - 1 ? (
                <>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleOpenPreview}
                    disabled={saving}
                  >
                    Gerar Orçamento
                  </Button>
                  <Button type="submit" size="lg" className="min-w-[150px]" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrar Projeto
                  </Button>
                </>
              ) : (
                <Button type="button" size="lg" onClick={handleNext} className="min-w-[150px]">
                  Próxima Etapa
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
