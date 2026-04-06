import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarIcon, ChevronRight, Loader2, Download, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LanguageCombobox } from '@/components/LanguageCombobox'
import useProjectStore, { ProjectStatus, ALL_STATUSES } from '@/stores/useProjectStore'
import { useToast } from '@/hooks/use-toast'
import { ProposalPrintTemplate } from './ProposalPrintTemplate'

const TRANSLATION_TYPES = [
  'Tradução Juramentada',
  'Tradução Técnica',
  'Tradução Simultânea',
  'Tradução Consecutiva',
  'Locação de Equipamentos',
]
const SERVICES_OPTS = [
  { id: 'edit-digital', label: 'Via Digital', key: 'digital' as const },
  { id: 'edit-fisico', label: 'Via Física', key: 'fisico' as const },
  { id: 'edit-apostilamento', label: 'Apostilamento de Haia', key: 'apostilamento' as const },
  {
    id: 'edit-apostilamento-digital',
    label: 'Apostilamento Digital',
    key: 'apostilamentoDigital' as const,
  },
  {
    id: 'edit-apostilamento-fisico',
    label: 'Apostilamento Físico',
    key: 'apostilamentoFisico' as const,
  },
  { id: 'edit-reconhecimento', label: 'Reconhecimento', key: 'reconhecimentoFirma' as const },
  {
    id: 'edit-autenticacao-digital',
    label: 'Autenticação documento Digital',
    key: 'autenticacaoDigital' as const,
  },
  { id: 'edit-frete', label: 'Frete', key: 'frete' as const },
  { id: 'edit-dhl', label: 'DHL (Exterior)', key: 'dhl' as const },
  { id: 'edit-frete-jk', label: 'Frete JK', key: 'freteJk' as const },
]

interface ItemInput {
  id?: string
  description: string
  laudas: string
  valorLauda: string
}

export function EditProjectDialog({
  projectId,
  onClose,
}: {
  projectId: string
  onClose: () => void
}) {
  const { projects, updateProject } = useProjectStore()
  const { toast } = useToast()
  const project = projects.find((p) => p.id === projectId)

  const [saving, setSaving] = useState(false)
  const [referenceCode, setReferenceCode] = useState(project?.id || '')
  const [client, setClient] = useState(project?.client || '')
  const [status, setStatus] = useState<ProjectStatus>(project?.status || 'Orçamento')
  const [translationType, setTranslationType] = useState(project?.translationType || '')
  const [sourceLang, setSourceLang] = useState(project?.sourceLang || 'pt')
  const [targetLang, setTargetLang] = useState(project?.targetLang || 'en')
  const [documentType, setDocumentType] = useState(project?.documentType || '')
  const [documents, setDocuments] = useState(project?.documents?.toString() || '1')
  const [observations, setObservations] = useState(project?.observations || '')
  const [entryDate, setEntryDate] = useState<Date | undefined>(
    project?.entryDate ? parseISO(project.entryDate) : undefined,
  )
  const [deadline, setDeadline] = useState<Date | undefined>(
    project?.dueDate ? parseISO(project.dueDate) : undefined,
  )

  const [services, setServices] = useState({
    digital: project?.digitalCopy ?? true,
    fisico: project?.physicalCopy ?? false,
    apostilamento: project?.hagueApostille ?? false,
    apostilamentoDigital: project?.digitalApostille ?? false,
    apostilamentoFisico: project?.physicalApostille ?? false,
    reconhecimentoFirma: project?.notarization ?? false,
    autenticacaoDigital: project?.digitalAuthentication ?? false,
    frete: project?.shipping ?? false,
    dhl: project?.internationalShipping ?? false,
    freteJk: project?.freteJk ?? false,
  })

  const [items, setItems] = useState<ItemInput[]>(
    project?.items?.length
      ? project.items.map((i) => ({
          id: i.id,
          description: i.description,
          laudas: i.laudas.toString().replace('.', ','),
          valorLauda: i.valorLauda.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        }))
      : [{ description: '', laudas: '', valorLauda: '' }],
  )

  if (!project) return null

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

  const isItemsValid = items.every((i) => i.description.trim() !== '' && i.laudas && i.valorLauda)

  const handleSave = async () => {
    setSaving(true)
    try {
      const projectItems = items.map((i) => ({
        id: i.id,
        description: i.description,
        laudas: Number(i.laudas.replace(',', '.')) || 0,
        valorLauda: Number(i.valorLauda.replace(/\./g, '').replace(',', '.')) || 0,
        total:
          (Number(i.laudas.replace(',', '.')) || 0) *
          (Number(i.valorLauda.replace(/\./g, '').replace(',', '.')) || 0),
      }))

      await updateProject(projectId, {
        id: referenceCode,
        client,
        status,
        translationType,
        sourceLang,
        targetLang,
        documentType,
        documents: Number(documents) || 1,
        laudas: computedLaudas,
        valorLauda: computedLaudas > 0 ? computedValue / computedLaudas : 0,
        value: computedValue,
        entryDate: entryDate ? entryDate.toISOString() : project.entryDate,
        dueDate: deadline ? deadline.toISOString() : project.dueDate,
        observations,
        digitalCopy: services.digital,
        physicalCopy: services.fisico,
        hagueApostille: services.apostilamento,
        digitalApostille: services.apostilamentoDigital,
        physicalApostille: services.apostilamentoFisico,
        notarization: services.reconhecimentoFirma,
        digitalAuthentication: services.autenticacaoDigital,
        shipping: services.frete,
        internationalShipping: services.dhl,
        freteJk: services.freteJk,
        items: projectItems,
      })
      toast({ title: 'Projeto atualizado', description: 'As alterações foram salvas com sucesso.' })
      onClose()
    } catch (e) {
      // Error handled by store
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    const originalTitle = document.title
    document.title = `Orcamento_${referenceCode}`
    setTimeout(() => {
      window.print()
      document.title = originalTitle
    }, 100)
  }

  const projectItemsForPrint = items.map((i) => ({
    description: i.description,
    laudas: Number(i.laudas.replace(',', '.')) || 0,
    valorLauda: Number(i.valorLauda.replace(/\./g, '').replace(',', '.')) || 0,
    total:
      (Number(i.laudas.replace(',', '.')) || 0) *
      (Number(i.valorLauda.replace(/\./g, '').replace(',', '.')) || 0),
  }))

  const printData = {
    referenceCode,
    client,
    status,
    translationType,
    sourceLang,
    targetLang,
    documentType,
    documents: Number(documents) || 1,
    laudas: computedLaudas,
    rate: computedLaudas > 0 ? computedValue / computedLaudas : 0,
    value: computedValue,
    entryDate,
    deadline,
    services: [
      { label: 'Urgente', active: project.urgent || false },
      { label: 'Internacional', active: project.international || false },
      ...SERVICES_OPTS.map((opt) => ({
        label: opt.label,
        active: services[opt.key],
      })),
    ],
    observations,
    items: projectItemsForPrint,
  }

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2 md:col-span-2">
              <Label>
                Cód. Referência <span className="text-destructive">*</span>
              </Label>
              <Input
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                required
                className="font-mono"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>
                Cliente <span className="text-destructive">*</span>
              </Label>
              <Input value={client} onChange={(e) => setClient(e.target.value)} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>
                Status <span className="text-destructive">*</span>
              </Label>
              <Select value={status} onValueChange={(val) => setStatus(val as ProjectStatus)}>
                <SelectTrigger>
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

            <div className="space-y-2 md:col-span-2">
              <Label>
                1. Categoria do Serviço <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={translationType}
                onValueChange={setTranslationType}
                className="grid grid-cols-2 lg:grid-cols-3 gap-2"
              >
                {TRANSLATION_TYPES.map((type) => (
                  <label
                    key={type}
                    className={cn(
                      'flex items-center space-x-2 border rounded-md p-2 cursor-pointer',
                      translationType === type ? 'border-primary bg-primary/5' : 'hover:bg-muted',
                    )}
                  >
                    <RadioGroupItem value={type} />
                    <span className="flex-1 text-xs font-medium">{type}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>
                2. Idiomas <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <LanguageCombobox label="Origem" value={sourceLang} onChange={setSourceLang} />
                </div>
                <ChevronRight className="w-4 h-4 mb-3 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <LanguageCombobox label="Destino" value={targetLang} onChange={setTargetLang} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>3. Tipo de Documento</Label>
              <Input value={documentType} onChange={(e) => setDocumentType(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>4. Qtd. de Documentos</Label>
              <Input
                type="number"
                value={documents}
                onChange={(e) => setDocuments(e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Entrada</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !entryDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {entryDate ? format(entryDate, 'dd/MM/yyyy') : 'Selecione'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={entryDate}
                    onSelect={setEntryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>
                5. Data de Entrega <span className="text-destructive">*</span>
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
                    {deadline ? format(deadline, 'dd/MM/yyyy') : 'Selecione'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4 md:col-span-2 pt-2">
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
                            placeholder="Ex: Documento X..."
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
                            className="h-8 w-8"
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

            <div className="space-y-2 md:col-span-2 bg-muted/30 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center mt-2">
              <div className="text-center md:text-left mb-2 md:mb-0">
                <span className="text-sm text-muted-foreground block">Total de Laudas</span>
                <span className="font-semibold text-lg">{computedLaudas}</span>
              </div>
              <div className="text-center md:text-right">
                <span className="text-sm text-muted-foreground block">Valor Final do Projeto</span>
                <span className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                  {computedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Instruções especiais, notas internas, ou outras observações do documento..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="min-h-[100px] resize-y"
              />
            </div>

            <div className="space-y-3 md:col-span-2 mt-2">
              <Label>Serviços e Logística</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border rounded-lg p-3 bg-muted/30">
                {SERVICES_OPTS.map(({ id, label, key }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Checkbox
                      id={id}
                      checked={services[key]}
                      onCheckedChange={(c) => setServices((prev) => ({ ...prev, [key]: !!c }))}
                    />
                    <Label htmlFor={id} className="font-normal text-xs cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between items-center w-full mt-4">
            <div className="flex-shrink-0 w-full sm:w-auto mb-2 sm:mb-0">
              <Button
                variant="outline"
                type="button"
                onClick={handlePrint}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar Orçamento
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  saving ||
                  !referenceCode ||
                  !client ||
                  !translationType ||
                  !sourceLang ||
                  !targetLang ||
                  !deadline ||
                  !isItemsValid
                }
                className="w-full sm:w-auto"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ProposalPrintTemplate data={printData} />
    </>
  )
}
