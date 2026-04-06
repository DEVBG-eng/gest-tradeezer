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

  const [formData, setFormData] = useState({
    freelancer: '',
    custo_documento: '0',
    custo_laudas: '0',
    custo_frete: '0',
    custo_envio_cartorio: '0',
    custo_cartorio: '0',
    custo_apostilamento: '0',
    custo_reconhecimento: '0',
    custo_envio_cliente: '0',
  })

  useEffect(() => {
    if (open && project) {
      loadCost()
    }
  }, [open, project])

  const loadCost = async () => {
    setLoading(true)
    try {
      const cost = await getCustoProjetoByProjeto(project.pbId)
      if (cost) {
        setCostId(cost.id || null)
        setFormData({
          freelancer: cost.freelancer || '',
          custo_documento: (cost.custo_documento || 0).toString(),
          custo_laudas: (cost.custo_laudas || 0).toString(),
          custo_frete: (cost.custo_frete || 0).toString(),
          custo_envio_cartorio: (cost.custo_envio_cartorio || 0).toString(),
          custo_cartorio: (cost.custo_cartorio || 0).toString(),
          custo_apostilamento: (cost.custo_apostilamento || 0).toString(),
          custo_reconhecimento: (cost.custo_reconhecimento || 0).toString(),
          custo_envio_cliente: (cost.custo_envio_cliente || 0).toString(),
        })
      } else {
        setCostId(null)
        setFormData({
          freelancer: '',
          custo_documento: '0',
          custo_laudas: '0',
          custo_frete: '0',
          custo_envio_cartorio: '0',
          custo_cartorio: '0',
          custo_apostilamento: '0',
          custo_reconhecimento: '0',
          custo_envio_cliente: '0',
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.freelancer.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O nome do freelancer é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const payload = {
        projeto: project.pbId,
        freelancer: formData.freelancer,
        custo_documento: parseFloat(formData.custo_documento) || 0,
        custo_laudas: parseFloat(formData.custo_laudas) || 0,
        custo_frete: parseFloat(formData.custo_frete) || 0,
        custo_envio_cartorio: parseFloat(formData.custo_envio_cartorio) || 0,
        custo_cartorio: parseFloat(formData.custo_cartorio) || 0,
        custo_apostilamento: parseFloat(formData.custo_apostilamento) || 0,
        custo_reconhecimento: parseFloat(formData.custo_reconhecimento) || 0,
        custo_envio_cliente: parseFloat(formData.custo_envio_cliente) || 0,
      }

      if (costId) {
        await updateCustoProjeto(costId, payload)
        toast({ title: 'Sucesso', description: 'Custos atualizados com sucesso.' })
      } else {
        await createCustoProjeto(payload)
        toast({ title: 'Sucesso', description: 'Custos registrados com sucesso.' })
      }
      onSaved()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar os custos do projeto.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custos do Projeto: {project.id}</DialogTitle>
          <DialogDescription>
            Insira os custos referentes a este projeto para manter o painel financeiro atualizado.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form id="cost-form" onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="freelancer">Freelancer *</Label>
              <Input
                id="freelancer"
                name="freelancer"
                value={formData.freelancer}
                onChange={handleChange}
                placeholder="Nome do profissional"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custo_documento">Custo Documento (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  id="custo_documento"
                  name="custo_documento"
                  value={formData.custo_documento}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_laudas">Custo de Laudas (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  id="custo_laudas"
                  name="custo_laudas"
                  value={formData.custo_laudas}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_frete">Custo de Frete Físico (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  id="custo_frete"
                  name="custo_frete"
                  value={formData.custo_frete}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_envio_cartorio">Envio para Cartório (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  id="custo_envio_cartorio"
                  name="custo_envio_cartorio"
                  value={formData.custo_envio_cartorio}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_cartorio">Custo do Cartório (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  id="custo_cartorio"
                  name="custo_cartorio"
                  value={formData.custo_cartorio}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_apostilamento">Custo Apostilamento (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  id="custo_apostilamento"
                  name="custo_apostilamento"
                  value={formData.custo_apostilamento}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_reconhecimento">Rec. de Firma (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  id="custo_reconhecimento"
                  name="custo_reconhecimento"
                  value={formData.custo_reconhecimento}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_envio_cliente">Envio para o Cliente (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  id="custo_envio_cliente"
                  name="custo_envio_cliente"
                  value={formData.custo_envio_cliente}
                  onChange={handleChange}
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
