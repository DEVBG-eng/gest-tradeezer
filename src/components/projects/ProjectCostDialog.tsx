import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  getCustoProjetoByProjeto,
  createCustoProjeto,
  updateCustoProjeto,
} from '@/services/projetos'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import type { Project } from '@/stores/useProjectStore'

interface ProjectCostDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ProjectCostDialog({
  project,
  open,
  onOpenChange,
  onSaved,
}: ProjectCostDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [costId, setCostId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Record<string, string>>({
    freelancer: '',
    custo_documento: '0',
    custo_laudas: '0',
    custo_frete: '0',
    custo_envio_cartorio: '0',
    custo_cartorio: '0',
    custo_apostilamento: '0',
    custo_reconhecimento: '0',
    custo_envio_cliente: '0',
    imposto: '0',
    custo_assinatura_tradutor: '0',
    custo_link_cartao: '0',
    comissao_venda: '0',
    comissao_secundaria: '0',
    custo_revisao: '0',
    custo_diagramacao: '0',
    emissao_certidao: '0',
    custo_portador: '0',
    custo_copia_autenticada: '0',
    autenticacao_digital: '0',
    percentual_custo_operacional: '0',
    observacoes_extras: '',
  })

  useEffect(() => {
    if (open && project) loadCost()
  }, [open, project])

  const loadCost = async () => {
    setLoading(true)
    try {
      const cost = (await getCustoProjetoByProjeto(project.pbId)) as any
      if (cost) {
        setCostId(cost.id || null)
        const newForm = { freelancer: cost.freelancer || '' } as any
        Object.keys(formData).forEach((k) => {
          if (k !== 'freelancer' && k !== 'observacoes_extras')
            newForm[k] = (cost[k] || 0).toString()
          if (k === 'observacoes_extras') newForm[k] = cost[k] || ''
        })
        setFormData(newForm)
      } else {
        setCostId(null)
        const empty = { freelancer: '' } as any
        Object.keys(formData).forEach((k) => {
          if (k !== 'freelancer' && k !== 'observacoes_extras') empty[k] = '0'
          if (k === 'observacoes_extras') empty[k] = ''
        })
        setFormData(empty)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.freelancer.trim()) {
      return toast({
        title: 'Erro',
        description: 'O nome do freelancer é obrigatório.',
        variant: 'destructive',
      })
    }

    setSaving(true)
    try {
      const payload: any = { projeto: project.pbId, freelancer: formData.freelancer }
      Object.keys(formData).forEach((k) => {
        if (k !== 'freelancer' && k !== 'observacoes_extras')
          payload[k] = parseFloat(formData[k]) || 0
        if (k === 'observacoes_extras') payload[k] = formData[k]
      })

      if (costId) {
        await updateCustoProjeto(costId, payload)
        toast({ title: 'Sucesso', description: 'Custos atualizados.' })
      } else {
        await createCustoProjeto(payload)
        toast({ title: 'Sucesso', description: 'Custos registrados.' })
      }
      onSaved()
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const NumberInput = ({ name, label, max }: { name: string; label: string; max?: string }) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        type="number"
        step="0.01"
        min="0"
        max={max}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
      />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custos do Projeto: {project.id}</DialogTitle>
          <DialogDescription>Insira os custos referentes a este projeto.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form id="cost-form" onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="freelancer">Freelancer *</Label>
              <Input
                id="freelancer"
                name="freelancer"
                value={formData.freelancer}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NumberInput name="imposto" label="Imposto (%)" max="100" />
              <NumberInput name="custo_documento" label="Custo Documento (R$)" />
              <NumberInput name="custo_laudas" label="Custo de Laudas (R$)" />
              <NumberInput name="custo_assinatura_tradutor" label="Assinatura Tradutor (R$)" />
              <NumberInput name="custo_revisao" label="Custo de Revisão (R$)" />
              <NumberInput name="custo_diagramacao" label="Custo de Diagramação (R$)" />
              <NumberInput name="custo_frete" label="Frete Físico (R$)" />
              <NumberInput name="custo_envio_cartorio" label="Envio para Cartório (R$)" />
              <NumberInput name="custo_cartorio" label="Custo do Cartório (R$)" />
              <NumberInput name="custo_apostilamento" label="Custo Apostilamento (R$)" />
              <NumberInput name="custo_reconhecimento" label="Rec. de Firma (R$)" />
              <NumberInput name="custo_envio_cliente" label="Envio para Cliente (R$)" />
              <NumberInput name="custo_link_cartao" label="Custo Link de Cartão (R$)" />
              <NumberInput name="comissao_venda" label="Comissão de Venda (%)" max="100" />
              <NumberInput name="comissao_secundaria" label="Comissão Secundária (R$)" />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg">Custos Extras</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NumberInput name="emissao_certidao" label="Emissão de Certidão (R$)" />
                <NumberInput name="custo_portador" label="Portador (Motoboy) (R$)" />
                <NumberInput name="custo_copia_autenticada" label="Cópia Autenticada (R$)" />
                <NumberInput name="autenticacao_digital" label="Autenticação Digital (R$)" />
                <NumberInput
                  name="percentual_custo_operacional"
                  label="Custo Operacional %"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes_extras">Observações/Custos Extras</Label>
                <Textarea
                  id="observacoes_extras"
                  name="observacoes_extras"
                  value={formData.observacoes_extras}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, observacoes_extras: e.target.value }))
                  }
                  placeholder="Detalhes sobre os custos extras..."
                />
              </div>
            </div>
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancelar
          </Button>
          <Button type="submit" form="cost-form" disabled={loading || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Custos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
