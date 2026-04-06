import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getCustosProjeto, CustoProjetoRecord } from '@/services/projetos'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Search, DollarSign, TrendingUp, Percent } from 'lucide-react'

type ExtendedCusto = CustoProjetoRecord

export default function ProjectCosts() {
  const { user } = useAuth()
  const [costs, setCosts] = useState<ExtendedCusto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadData = async () => {
    if (!user) return
    try {
      const records = (await getCustosProjeto()) as ExtendedCusto[]
      setCosts(records)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('CustosProjeto', () => loadData(), !!user)
  useRealtime('Projetos', () => loadData(), !!user)

  const filteredCosts = costs.filter((cost) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const proj = cost.expand?.projeto
    return (
      (proj?.cod_referencia && proj.cod_referencia.toLowerCase().includes(term)) ||
      (proj?.cliente && proj.cliente.toLowerCase().includes(term)) ||
      (cost.freelancer && cost.freelancer.toLowerCase().includes(term))
    )
  })

  const calculateTotalCost = (cost: ExtendedCusto, projectValue: number) => {
    const baseCost =
      (cost.custo_documento || 0) +
      (cost.custo_laudas || 0) +
      (cost.custo_frete || 0) +
      (cost.custo_envio_cartorio || 0) +
      (cost.custo_cartorio || 0) +
      (cost.custo_apostilamento || 0) +
      (cost.custo_reconhecimento || 0) +
      (cost.custo_envio_cliente || 0) +
      (cost.imposto || 0) +
      (cost.custo_assinatura_tradutor || 0) +
      (cost.custo_link_cartao || 0) +
      (cost.comissao_venda || 0) +
      (cost.comissao_secundaria || 0) +
      (cost.custo_revisao || 0) +
      (cost.custo_diagramacao || 0) +
      (cost.emissao_certidao || 0) +
      (cost.custo_portador || 0) +
      (cost.custo_copia_autenticada || 0) +
      (cost.autenticacao_digital || 0)

    const opCostPerc = cost.percentual_custo_operacional || 0
    const opCostValue = projectValue * (opCostPerc / 100)

    return baseCost + opCostValue
  }

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const totalProjectsValue = filteredCosts.reduce(
    (acc, cost) => acc + (cost.expand?.projeto?.valor_total || 0),
    0,
  )
  const totalCostsValue = filteredCosts.reduce((acc, cost) => {
    const projValue = cost.expand?.projeto?.valor_total || 0
    return acc + calculateTotalCost(cost, projValue)
  }, 0)
  const totalProfit = totalProjectsValue - totalCostsValue
  const avgMargin = totalProjectsValue > 0 ? (totalProfit / totalProjectsValue) * 100 : 0

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1200px] mx-auto w-full animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Custos de Projeto</h1>
        <p className="text-muted-foreground">
          Monitore os custos de freelancers e serviços associados aos projetos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Total dos Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProjectsValue)}</div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
              <TrendingUp className="h-4 w-4 text-destructive rotate-180" />
              Custo Acumulado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalCostsValue)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
              Lucro Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
              {formatCurrency(totalProfit)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600 dark:text-blue-500">
              <Percent className="h-4 w-4 text-blue-600 dark:text-blue-500" />
              Margem Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
              {avgMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por OS, cliente ou freelancer..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Cód. Referência</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Freelancer</TableHead>
                <TableHead className="text-right">Valor Projeto</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead className="text-right">Lucro Líquido</TableHead>
                <TableHead className="w-[100px] text-center">Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Carregando custos...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhum custo registrado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCosts.map((cost) => {
                  const proj = cost.expand?.projeto
                  const projectValue = proj?.valor_total || 0
                  const totalCost = calculateTotalCost(cost, projectValue)
                  const profit = projectValue - totalCost
                  const margin = projectValue > 0 ? (profit / projectValue) * 100 : 0

                  return (
                    <TableRow key={cost.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-primary">
                        {proj?.cod_referencia || 'N/A'}
                      </TableCell>
                      <TableCell>{proj?.cliente || '-'}</TableCell>
                      <TableCell>{cost.freelancer}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(projectValue)}
                      </TableCell>
                      <TableCell className="text-right text-destructive font-medium">
                        {formatCurrency(totalCost)}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 dark:text-emerald-500 font-medium">
                        {formatCurrency(profit)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            margin >= 30 ? 'default' : margin >= 15 ? 'secondary' : 'destructive'
                          }
                        >
                          {margin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
