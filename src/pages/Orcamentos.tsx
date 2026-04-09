import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Plus, Search, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { orcamentoService } from '@/services/orcamentoService'
import { useRealtime } from '@/hooks/use-realtime'

export default function OrcamentosList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = React.useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const records = await orcamentoService.getOrcamentosByUser(user.id, search)
      setOrcamentos(records)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user, search])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      load()
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [load, search])

  useRealtime(
    'orcamentos',
    () => {
      load()
    },
    !!user,
  )

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Orçamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e visualize todos os orçamentos gerados.
          </p>
        </div>
        <Button onClick={() => navigate('/orcamentos/new')} className="h-11">
          <Plus className="w-4 h-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Histórico de Orçamentos</CardTitle>
              <CardDescription>Lista de todos os orçamentos criados na plataforma.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : orcamentos.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 border border-dashed rounded-lg">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                {search
                  ? 'Tente buscar com outros termos.'
                  : 'Você ainda não gerou nenhum orçamento.'}
              </p>
              {!search && (
                <Button onClick={() => navigate('/orcamentos/new')} variant="outline">
                  Criar Primeiro Orçamento
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamentos.map((orcamento) => (
                    <TableRow
                      key={orcamento.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/orcamentos/${orcamento.id}`)}
                    >
                      <TableCell className="font-medium whitespace-nowrap text-muted-foreground">
                        {format(new Date(orcamento.created), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {orcamento.cliente_nome}
                      </TableCell>
                      <TableCell>{orcamento.cliente_email || '-'}</TableCell>
                      <TableCell>{orcamento.cliente_telefone || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
