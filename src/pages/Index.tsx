import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  AlertCircle,
  Clock,
  FileText,
  Plus,
  CheckCircle,
  CheckSquare,
  PackageCheck,
  Ban,
  XCircle,
  CalendarCheck,
  Landmark,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import useProjectStore from '@/stores/useProjectStore'
import { LANGUAGES } from '@/components/LanguageCombobox'
import { useRealtime } from '@/hooks/use-realtime'

export default function Index() {
  const { projects, fetchProjects } = useProjectStore() as any

  useRealtime('Projetos', () => {
    if (typeof fetchProjects === 'function') {
      fetchProjects()
    }
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
  }

  const approvedToday = useMemo(() => {
    const today = new Date()
    const isToday = (dateStr: string) => {
      if (!dateStr) return false
      const d = new Date(dateStr)
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      )
    }

    return projects.filter((p: any) => p.status === 'Aprovado' && isToday(p.updated))
  }, [projects])

  const approvedTodayCount = approvedToday.length
  const approvedTodayTotal = approvedToday.reduce(
    (acc: number, p: any) => acc + (p.valor_total || 0),
    0,
  )

  const STATUSES = [
    { title: 'Orçamento', status: 'Orçamento', icon: FileText, color: 'text-blue-500' },
    { title: 'Aprovado', status: 'Aprovado', icon: CheckCircle, color: 'text-emerald-500' },
    { title: 'Aguardando', status: 'Aguardando', icon: Clock, color: 'text-orange-500' },
    { title: 'Em Andamento', status: 'Em Andamento', icon: Clock, color: 'text-amber-500' },
    { title: 'Em Revisão', status: 'Em Revisão', icon: FileText, color: 'text-indigo-500' },
    { title: 'Cartório', status: 'Cartório', icon: Landmark, color: 'text-purple-500' },
    { title: 'Concluído', status: 'Concluído', icon: CheckSquare, color: 'text-emerald-600' },
    { title: 'Entregue', status: 'Entregue', icon: PackageCheck, color: 'text-indigo-600' },
    {
      title: 'Atrasado/Bloq.',
      status: 'Atrasado/Bloqueado',
      icon: AlertCircle,
      color: 'text-red-500',
      isWarning: true,
    },
    { title: 'Não Aprovado', status: 'Não Aprovado', icon: XCircle, color: 'text-gray-500' },
    { title: 'Cancelado', status: 'Cancelado', icon: Ban, color: 'text-gray-500' },
  ]

  const statusMetrics = useMemo(() => {
    return STATUSES.map((m) => {
      const filtered = projects.filter((p: any) => p.status === m.status)
      const count = filtered.length
      const total = filtered.reduce((acc: number, p: any) => acc + (p.valor_total || 0), 0)
      return { ...m, count, total }
    })
  }, [projects])

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {}
    projects.forEach((p: any) => {
      const lang = p.targetLang || 'Outros'
      counts[lang] = (counts[lang] || 0) + 1
    })

    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ]

    return Object.entries(counts)
      .map(([code, count], index) => {
        const label =
          LANGUAGES?.find((l: any) => l.value === code)?.label ||
          (code === 'Outros' ? 'Não definido' : code)
        return {
          language: label,
          projetos: count,
          fill: colors[index % colors.length],
        }
      })
      .sort((a, b) => b.projetos - a.projetos)
      .slice(0, 7)
  }, [projects])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhamento em tempo real das métricas financeiras e operacionais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Link
          to="/projects?status=Aprovado"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg group"
        >
          <Card className="h-full bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium text-emerald-800 dark:text-emerald-300">
                Projetos Aprovados Hoje
              </CardTitle>
              <CalendarCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                {approvedTodayCount}
              </div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mt-1">
                {formatCurrency(approvedTodayTotal)}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Card className="h-full bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 shadow-sm flex flex-col justify-center">
          <CardContent className="pt-6">
            <Button
              asChild
              className="w-full justify-between bg-blue-600 hover:bg-blue-700 text-white"
              variant="default"
            >
              <Link to="/projects/new">
                Criar Novo Projeto Manual
                <Plus className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-between mt-3 bg-white hover:bg-blue-50 text-blue-700 border-blue-200"
              variant="outline"
            >
              <Link to="/projects">
                Ir para Quadro de Projetos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 tracking-tight">Status dos Projetos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {statusMetrics.map((stat, i) => {
            const Icon = stat.icon
            const isWarning = stat.isWarning
            const baseCardClasses =
              'h-full hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col'
            const cardClasses = isWarning
              ? `${baseCardClasses} border-destructive/50 bg-destructive/5 group-hover:border-destructive`
              : `${baseCardClasses} group-hover:border-primary/50`
            const textClass = isWarning ? 'text-destructive' : ''
            const subtitleClass = isWarning ? 'text-destructive/80' : 'text-muted-foreground'

            return (
              <Link
                key={i}
                to={`/projects?status=${stat.status}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg group h-full"
              >
                <Card className={cardClasses}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
                    <CardTitle
                      className={`text-xs sm:text-sm font-medium truncate ${textClass}`}
                      title={stat.title}
                    >
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 shrink-0 ml-1 ${stat.color}`} />
                  </CardHeader>
                  <CardContent className="p-4 pt-0 mt-auto">
                    <div className={`text-xl sm:text-2xl font-bold ${textClass}`}>{stat.count}</div>
                    <p
                      className={`text-xs sm:text-sm font-medium mt-1 truncate ${subtitleClass}`}
                      title={formatCurrency(stat.total)}
                    >
                      {formatCurrency(stat.total)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Projetos por Idioma de Destino</CardTitle>
            <CardDescription>Quantidade de projetos por idioma</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {chartData.length > 0 ? (
              <ChartContainer
                config={{ projetos: { label: 'Projetos' } }}
                className="h-full w-full max-h-[400px]"
              >
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
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="projetos" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Nenhum dado disponível.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
