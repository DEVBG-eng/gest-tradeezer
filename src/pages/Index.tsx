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

  const metrics = [
    {
      title: 'Orçamentos',
      statuses: ['Orçamento', 'Aguardando'],
      icon: FileText,
      iconColor: 'text-blue-500',
      link: '/projects?status=Orçamento&status=Aguardando',
    },
    {
      title: 'Aprovados',
      statuses: ['Aprovado'],
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      link: '/projects?status=Aprovado',
    },
    {
      title: 'Em Andamento',
      statuses: ['Em Andamento', 'Em Revisão', 'Cartório'],
      icon: Clock,
      iconColor: 'text-amber-500',
      link: '/projects?status=Em Andamento&status=Em Revisão&status=Cartório',
    },
    {
      title: 'Concluídos',
      statuses: ['Concluído'],
      icon: CheckSquare,
      iconColor: 'text-indigo-500',
      link: '/projects?status=Concluído',
    },
    {
      title: 'Entregues',
      statuses: ['Entregue'],
      icon: PackageCheck,
      iconColor: 'text-purple-500',
      link: '/projects?status=Entregue',
    },
    {
      title: 'Atrasados/Bloqueados',
      statuses: ['Atrasado/Bloqueado'],
      icon: AlertCircle,
      iconColor: 'text-warning',
      cardClass: 'border-warning/50 bg-warning/5 group-hover:border-warning',
      textClass: 'text-warning-foreground',
      subtitleClass: 'text-warning-foreground/80',
      link: '/projects?status=Atrasado/Bloqueado',
    },
  ]

  const stats = useMemo(() => {
    return metrics.map((m) => {
      const filtered = projects.filter((p: any) => m.statuses.includes(p.status))
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
          LANGUAGES.find((l) => l.value === code)?.label ||
          (code === 'Outros' ? 'Não definido' : code)
        return {
          language: label,
          projetos: count,
          fill: colors[index % colors.length],
        }
      })
      .sort((a, b) => b.projetos - a.projetos)
      .slice(0, 7) // Top 7 languages
  }, [projects])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tradeezer</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral das operações e alertas do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          const baseCardClasses =
            'h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer'
          const cardClasses = stat.cardClass
            ? `${baseCardClasses} ${stat.cardClass}`
            : `${baseCardClasses} group-hover:border-primary/50`

          return (
            <Link
              key={i}
              to={stat.link}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg group"
            >
              <Card className={cardClasses}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className={`text-sm font-medium ${stat.textClass || ''}`}>
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.textClass || ''}`}>{stat.count}</div>
                  <p
                    className={`text-sm font-medium mt-1 ${stat.subtitleClass || 'text-muted-foreground'}`}
                  >
                    {formatCurrency(stat.total)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Projetos por Idioma de Destino</CardTitle>
            <CardDescription>Quantidade de projetos por idioma</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {chartData.length > 0 ? (
              <ChartContainer
                config={{ projetos: { label: 'Projetos' } }}
                className="h-full w-full"
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
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
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
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Nenhum dado disponível.
              </div>
            )}
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
