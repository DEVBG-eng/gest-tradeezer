import { Link } from 'react-router-dom'
import { ArrowRight, AlertCircle, Clock, CheckCircle2, Truck, FileText, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import useProjectStore from '@/stores/useProjectStore'

const chartData = [
  { language: 'Inglês', volume: 145, fill: 'hsl(var(--primary))' },
  { language: 'Espanhol', volume: 90, fill: 'hsl(var(--accent))' },
  { language: 'Alemão', volume: 45, fill: 'hsl(var(--chart-3))' },
  { language: 'Italiano', volume: 30, fill: 'hsl(var(--chart-4))' },
]

export default function Index() {
  const { projects } = useProjectStore()
  const activeCount = projects.filter((p) => p.status !== 'Concluído').length
  const quoteCount = projects.filter((p) => p.status === 'Orçamento').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tradeezer</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral das operações e alertas do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 desde ontem</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quoteCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando aprovação do cliente</p>
          </CardContent>
        </Card>
        <Card className="border-warning/50 bg-warning/5 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-warning-foreground">
              Atrasos&nbsp;
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-foreground">3</div>
            <p className="text-xs text-warning-foreground/80 mt-1">Vencem nas próximas 24h</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Envios em Trânsito</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Via DHL / Correios</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Volume de Traduções por Idioma</CardTitle>
            <CardDescription>Distribuição de laudas nos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ChartContainer config={{ volume: { label: 'Laudas' } }} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="language"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="volume" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-between" variant="default">
                <Link to="/projects/new">
                  Criar Novo Projeto Manual
                  <Plus className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-between" variant="outline">
                <Link to="/projects">
                  Ir para Quadro de Projetos
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 text-sm">
                <div className="mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-medium">Projeto Criado - PRJ-1005</p>
                  <p className="text-muted-foreground text-xs">
                    Estatuto Global Invest - 45 laudas
                  </p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="mt-0.5">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Coletado - DHL 8493</p>
                  <p className="text-muted-foreground text-xs">Certidão de Casamento - PRJ-1004</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
