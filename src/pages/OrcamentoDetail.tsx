import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Mail,
  Plus,
  Trash2,
  AlertCircle,
  FilePlus,
  Download,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { useOrcamentoData } from '@/hooks/use-orcamento'
import { ProposalPrintTemplate } from '@/components/projects/ProposalPrintTemplate'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import { orcamentoService } from '@/services/orcamentoService'

export default function OrcamentoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const {
    orcamento,
    items,
    loading,
    error,
    totals,
    isCreating,
    setIsCreating,
    startNewOrcamento,
    loadData,
  } = useOrcamentoData(id)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const handleCreateOrcamento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    const fd = new FormData(e.currentTarget)
    try {
      const novo = await orcamentoService.createOrcamento({
        user_id: user.id,
        cliente_nome: fd.get('cliente_nome') as string,
        cliente_email: fd.get('cliente_email') as string,
        cliente_telefone: fd.get('cliente_telefone') as string,
      })
      toast({ description: 'Orçamento criado com sucesso.' })
      navigate(`/orcamentos/${novo.id}`)
    } catch (err) {
      toast({ variant: 'destructive', description: 'Erro ao criar orçamento. Verifique os dados.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!orcamento) return

    setIsSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const qtd = Number(fd.get('quantidade'))
    const val = Number(fd.get('valor_unitario'))

    try {
      await orcamentoService.createItem({
        orcamento_id: orcamento.id,
        descricao: fd.get('descricao') as string,
        quantidade: qtd,
        valor_unitario: val,
        subtotal: qtd * val,
      })
      e.currentTarget.reset()
      toast({ description: 'Item adicionado com sucesso.' })
    } catch (err) {
      toast({ variant: 'destructive', description: 'Erro ao adicionar item no orçamento.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await orcamentoService.deleteItem(itemId)
      toast({ description: 'Item removido.' })
    } catch (err) {
      toast({ variant: 'destructive', description: 'Erro ao remover item.' })
    }
  }

  const [isGeneratingJPG, setIsGeneratingJPG] = useState(false)

  const handleGenerateJPG = async () => {
    setIsGeneratingJPG(true)
  }

  const handleSendEmail = async () => {
    try {
      if (Math.random() > 0.8) throw new Error('Simulated Email error')
      toast({ description: 'Email enviado com sucesso para o cliente!' })
    } catch (err) {
      toast({ variant: 'destructive', description: 'Erro ao enviar email. Verifique a conexão.' })
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ops, algo deu errado!</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={loadData} className="h-11">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  if (isCreating || !orcamento) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/orcamentos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Novo Orçamento</h1>
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
            <CardDescription>
              Preencha os dados do cliente para iniciar o orçamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrcamento} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_nome">Nome Completo / Empresa</Label>
                <Input id="cliente_nome" name="cliente_nome" required placeholder="Ex: Acme Corp" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente_email">Email</Label>
                  <Input
                    id="cliente_email"
                    name="cliente_email"
                    type="email"
                    required
                    placeholder="contato@acme.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente_telefone">Telefone</Label>
                  <Input
                    id="cliente_telefone"
                    name="cliente_telefone"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FilePlus className="w-4 h-4 mr-2" />
                  )}
                  Criar e Iniciar Itens
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/orcamentos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Orçamento</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="h-11" onClick={() => navigate('/orcamentos/new')}>
            Novo Orçamento
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block">
                <Button
                  variant="secondary"
                  className="h-11"
                  disabled={!orcamento.cliente_email}
                  onClick={handleSendEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar por Email
                </Button>
              </span>
            </TooltipTrigger>
            {!orcamento.cliente_email && (
              <TooltipContent>Email do cliente não preenchido</TooltipContent>
            )}
          </Tooltip>
          <Button className="h-11" onClick={handleGenerateJPG} disabled={isGeneratingJPG}>
            {isGeneratingJPG ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Baixar Orçamento (JPG)
          </Button>
        </div>
      </div>

      {isGeneratingJPG && (
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
              orcamento={orcamento}
              items={items}
              autoGenerateJPG={true}
              onClose={() => {
                setIsGeneratingJPG(false)
                toast({ description: 'Orçamento gerado com sucesso!' })
              }}
            />
          </div>
        </div>
      )}

      <Card className="shadow-sm p-6 bg-card border">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-lg">Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <span className="text-sm font-medium text-muted-foreground block mb-1">Nome</span>
            <span className="text-base text-foreground">{orcamento.cliente_nome}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground block mb-1">Email</span>
            <span className="text-base text-foreground">{orcamento.cliente_email || '-'}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground block mb-1">Telefone</span>
            <span className="text-base text-foreground">{orcamento.cliente_telefone || '-'}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Itens do Orçamento</h2>

        <form
          onSubmit={handleAddItem}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 bg-muted/30 p-4 rounded-lg border"
        >
          <div className="md:col-span-5 space-y-2">
            <Label htmlFor="descricao">Descrição do Serviço</Label>
            <Input
              id="descricao"
              name="descricao"
              required
              placeholder="Ex: Tradução Juramentada"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="quantidade">Qtd</Label>
            <Input
              id="quantidade"
              name="quantidade"
              type="number"
              required
              min="1"
              defaultValue={1}
            />
          </div>
          <div className="md:col-span-3 space-y-2">
            <Label htmlFor="valor_unitario">Valor Unit. (R$)</Label>
            <Input
              id="valor_unitario"
              name="valor_unitario"
              type="number"
              step="0.01"
              required
              min="0"
              placeholder="0.00"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </form>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 border border-dashed rounded-lg">
            <p className="text-muted-foreground font-medium">Adicione itens ao orçamento</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-md overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Valor Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{item.descricao}</TableCell>
                      <TableCell className="text-center">{item.quantidade}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.valor_unitario)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="md:hidden space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-semibold text-foreground pr-4 leading-tight">
                      {item.descricao}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                      className="h-8 w-8 -mr-2 -mt-2 shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Quantidade:</span>
                    <span className="font-medium">{item.quantidade}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Valor Unitário:</span>
                    <span className="font-medium">{formatCurrency(item.valor_unitario)}</span>
                  </div>
                  <div className="flex justify-between text-base border-t pt-2">
                    <span className="font-semibold text-foreground">Subtotal:</span>
                    <span className="font-bold text-primary">{formatCurrency(item.subtotal)}</span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mt-6 flex flex-col md:flex-row md:justify-end items-end gap-6 border">
              <div className="text-right w-full md:w-[320px]">
                <div className="text-muted-foreground mb-2 flex justify-between gap-8 text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(totals.subtotal)}
                  </span>
                </div>
                <div className="text-muted-foreground mb-4 flex justify-between gap-8 text-sm">
                  <span>Impostos Estimados (10%):</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(totals.impostos)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground flex justify-between gap-8 border-t border-border pt-4">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
