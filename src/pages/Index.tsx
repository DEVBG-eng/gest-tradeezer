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
  const activeCount = projects.filter((p) =>
    ['Aprovado', 'Em Andamento', 'Em Revisão', 'Cartório'].includes(p.status),
  ).length
  const quoteCount = projects.filter((p) => ['Orçamento', 'Aguardando'].includes(p.status)).length
  const delayCount = projects.filter((p) => p.status === 'Atrasado/Bloqueado').length
  const shippingCount = projects.filter((p) => p.shipping || p.internationalShipping).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tradeezer</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral das operações e alertas do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/projects?status=Aprovado&status=Em Andamento&status=Em Revisão&status=Cartório"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg group"
        >
          <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group-hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Aprovado, Andamento, Revisão ou Cartório
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link
          to="/projects?status=Orçamento&status=Aguardando"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg group"
        >
          <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group-hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orçamentos Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quoteCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Aguardando aprovação ou envio</p>
            </CardContent>
          </Card>
        </Link>

        <Link
          to="/projects?status=Atrasado/Bloqueado"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg group"
        >
          <Card className="h-full border-warning/50 bg-warning/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group-hover:border-warning">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-warning-foreground">Atrasos</CardTitle>
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning-foreground">{delayCount}</div>
              <p className="text-xs text-warning-foreground/80 mt-1">
                Projetos bloqueados ou atrasados
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link
          to="/projects?shipping=true"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg group"
        >
          <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group-hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Envios em Trânsito</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shippingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Com frete ou DHL ativo</p>
            </CardContent>
          </Card>
        </Link>
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
          <Card className="flex-1 pt-[32px]">
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
        </div>
      </div>
    </div>
  )
}
