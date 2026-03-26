import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarIcon, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LanguageCombobox } from '@/components/LanguageCombobox'
import useProjectStore, { ProjectStatus, ALL_STATUSES } from '@/stores/useProjectStore'
import { useToast } from '@/hooks/use-toast'

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
  { id: 'edit-reconhecimento', label: 'Reconhecimento', key: 'reconhecimentoFirma' as const },
  { id: 'edit-frete', label: 'Frete', key: 'frete' as const },
  { id: 'edit-dhl', label: 'DHL (Exterior)', key: 'dhl' as const },
]

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
  const [laudas, setLaudas] = useState(project?.laudas?.toString() || '0')
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
    reconhecimentoFirma: project?.notarization ?? false,
    frete: project?.shipping ?? false,
    dhl: project?.internationalShipping ?? false,
  })

  const [rate, setRate] = useState(
    project?.valorLauda
      ? project.valorLauda.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : (project && project.laudas && project.laudas > 0
          ? project.value / project.laudas
          : 45
        ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  )

  const [value, setValue] = useState(
    project?.value?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || '0,00',
  )

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const digits = val.replace(/\D/g, '')
    if (!digits) {
      setValue('')
      return
    }
    const number = parseInt(digits, 10) / 100
    setValue(number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  }

  useEffect(() => {
    const l = Number(laudas.replace(',', '.')) || 0
    const r = Number(rate.replace(/\./g, '').replace(',', '.')) || 0
    if (l > 0 && r > 0 && rate !== '') {
      setValue(
        (l * r).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      )
    }
  }, [laudas, rate])

  if (!project) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProject(projectId, {
        id: referenceCode,
        client,
        status,
        translationType,
        sourceLang,
        targetLang,
        documentType,
        documents: Number(documents) || 1,
        laudas: Number(laudas.replace(',', '.')) || 0,
        valorLauda: Number(rate.replace(/\./g, '').replace(',', '.')) || 0,
        value: Number(value.replace(/\./g, '').replace(',', '.')) || 0,
        entryDate: entryDate ? entryDate.toISOString() : project.entryDate,
        dueDate: deadline ? deadline.toISOString() : project.dueDate,
        digitalCopy: services.digital,
        physicalCopy: services.fisico,
        hagueApostille: services.apostilamento,
        notarization: services.reconhecimentoFirma,
        shipping: services.frete,
        internationalShipping: services.dhl,
      })
      toast({ title: 'Projeto atualizado', description: 'As alterações foram salvas com sucesso.' })
      onClose()
    } catch (e) {
      // Error handled by store
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
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

          <div className="space-y-2 md:col-span-2">
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
            <Label>Qtd. de Laudas</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={laudas}
              onChange={(e) => setLaudas(e.target.value)}
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
                <Calendar mode="single" selected={entryDate} onSelect={setEntryDate} initialFocus />
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

          <div className="space-y-2">
            <Label>Taxa por Lauda (R$)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">R$</span>
              <Input
                type="text"
                inputMode="decimal"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>6. Valor Final (R$)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">R$</span>
              <Input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={handleValueChange}
                className="pl-9 font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>
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

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
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
              !deadline
            }
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
