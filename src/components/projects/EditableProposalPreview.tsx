import { useState, useMemo, useEffect } from 'react'
import { Download, Loader2, Plus, Trash2 } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Project, ProjectItem } from '@/stores/useProjectStore'
import { ProposalPrintTemplate, formatCurrency } from './ProposalPrintTemplate'

interface EditableProposalPreviewProps {
  initialData: Project
  isOpen: boolean
  onClose: () => void
  onSave: (data: Project) => Promise<void>
  onPrintClose: () => void
}

export function EditableProposalPreview({
  initialData,
  isOpen,
  onClose,
  onSave,
  onPrintClose,
}: EditableProposalPreviewProps) {
  const [draft, setDraft] = useState<Project>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [showPrint, setShowPrint] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setDraft(initialData)
      setShowPrint(false)
    }
  }, [initialData, isOpen])

  const totals = useMemo(() => {
    let totalLaudas = 0
    let totalValue = 0
    draft.items?.forEach((item) => {
      const l = Number(item.laudas) || 0
      const v = Number(item.valorLauda) || 0
      totalLaudas += l
      totalValue += l * v
    })
    return { totalLaudas, totalValue }
  }, [draft.items])

  const handleItemChange = (index: number, field: keyof ProjectItem, value: any) => {
    const newItems = [...(draft.items || [])]
    newItems[index] = { ...newItems[index], [field]: value }
    newItems[index].total =
      (Number(newItems[index].laudas) || 0) * (Number(newItems[index].valorLauda) || 0)
    setDraft({ ...draft, items: newItems })
  }

  const handleAddItem = () => {
    setDraft({
      ...draft,
      items: [
        ...(draft.items || []),
        { description: 'Novo Item', laudas: 1, valorLauda: 0, total: 0 },
      ],
    })
  }

  const handleRemoveItem = (index: number) => {
    setDraft({
      ...draft,
      items: (draft.items || []).filter((_, i) => i !== index),
    })
  }

  const handleSaveAndGenerateJPG = async () => {
    setIsSaving(true)
    try {
      const finalDraft = {
        ...draft,
        laudas: totals.totalLaudas,
        value: totals.totalValue,
        valorLauda: totals.totalLaudas > 0 ? totals.totalValue / totals.totalLaudas : 0,
      }
      await onSave(finalDraft)
      setShowPrint(true)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  if (showPrint) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-xl flex flex-col items-center gap-6 shadow-2xl animate-in zoom-in-95">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">Gerando Imagem...</p>
            <p className="text-sm text-slate-500">Por favor, aguarde um momento.</p>
          </div>
        </div>
        <div
          className="absolute pointer-events-none overflow-hidden"
          style={{ width: '800px', left: '-9999px', top: '-9999px' }}
        >
          <ProposalPrintTemplate
            project={draft}
            items={draft.items}
            autoGenerateJPG={true}
            onClose={() => {
              setShowPrint(false)
              onPrintClose()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-6 bg-slate-50/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Revisar e Gerar Orçamento (JPG)</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 px-1">
          <Card className="shadow-sm">
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Nome do Cliente</Label>
                <Input
                  value={draft.client || ''}
                  onChange={(e) => setDraft({ ...draft, client: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cód. Referência</Label>
                <Input
                  value={draft.id || ''}
                  onChange={(e) => setDraft({ ...draft, id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria do Serviço</Label>
                <Input
                  value={draft.translationType || ''}
                  onChange={(e) => setDraft({ ...draft, translationType: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Entrada</Label>
                <Input
                  type="date"
                  value={draft.entryDate ? draft.entryDate.split('T')[0] : ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      entryDate: e.target.value ? new Date(e.target.value).toISOString() : '',
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Prazo Estimado</Label>
                <Input
                  type="date"
                  value={draft.dueDate ? draft.dueDate.split('T')[0] : ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      dueDate: e.target.value ? new Date(e.target.value).toISOString() : '',
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Input
                  value={draft.paymentMethod || ''}
                  onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-lg text-primary">Itens do Projeto</h3>
              </div>
              <div className="border rounded-md overflow-hidden bg-background">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-[120px]">Qtd.</TableHead>
                      <TableHead className="w-[150px]">Valor Unit. (R$)</TableHead>
                      <TableHead className="w-[150px] text-right">Subtotal</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draft.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.laudas === undefined ? '' : item.laudas}
                            onChange={(e) =>
                              handleItemChange(index, 'laudas', Number(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.valorLauda === undefined ? '' : item.valorLauda}
                            onChange={(e) =>
                              handleItemChange(index, 'valorLauda', Number(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell className="font-bold text-right align-middle text-emerald-600">
                          {formatCurrency((item.laudas || 0) * (item.valorLauda || 0))}
                        </TableCell>
                        <TableCell className="align-middle">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!draft.items || draft.items.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Nenhum item adicionado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddItem} className="mt-2">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Item
              </Button>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="border-t pt-4 flex flex-row items-center justify-between sm:justify-between w-full">
          <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg border">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Calculado
            </span>
            <span className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totals.totalValue)}
            </span>
          </div>
          <div className="space-x-3 flex items-center">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAndGenerateJPG} disabled={isSaving} size="lg">
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Gerar JPG
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
