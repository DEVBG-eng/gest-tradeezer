import { useState, useEffect } from 'react'
import { Search, DownloadCloud, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { orcamentoService } from '@/services/orcamentoService'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

interface ImportBudgetDialogProps {
  onImport: (data: { orcamento: any; itens: any[] }) => void
}

export function ImportBudgetDialog({ onImport }: ImportBudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!open) return
    let isMounted = true
    const fetchOrcamentos = async () => {
      setLoading(true)
      try {
        const result = await orcamentoService.searchOrcamentos(query)
        if (isMounted) setOrcamentos(result.items || [])
      } catch (e) {
        console.error(e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    const timer = setTimeout(fetchOrcamentos, 300)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [query, open])

  const handleSelect = async (orcamento: any) => {
    setImportingId(orcamento.id)
    try {
      if (orcamento.cod_referencia) {
        try {
          await pb
            .collection('Projetos')
            .getFirstListItem(`cod_referencia="${orcamento.cod_referencia}"`)
          toast({
            title: 'Código duplicado',
            description: 'Já existe um projeto com o código de referência deste orçamento.',
            variant: 'destructive',
          })
          setImportingId(null)
          return
        } catch (e) {
          // Not found in Projetos, which means it's safe to use
        }
      }

      const itens = await orcamentoService.getItemsByOrcamento(orcamento.id)
      onImport({ orcamento, itens })
      setOpen(false)
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Falha ao importar orçamento.',
        variant: 'destructive',
      })
    } finally {
      setImportingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="w-full sm:w-auto bg-primary/10 text-primary hover:bg-primary/20 font-medium"
        >
          <DownloadCloud className="w-4 h-4 mr-2" />
          Importar de Orçamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Importar Orçamento Comercial</DialogTitle>
          <DialogDescription>Busque por nome do cliente ou código de referência.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar orçamento..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[300px] border rounded-md p-2">
            {loading ? (
              <div className="flex justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : orcamentos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum orçamento encontrado.
              </div>
            ) : (
              <div className="space-y-2">
                {orcamentos.map((orc) => (
                  <div
                    key={orc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col mb-2 sm:mb-0">
                      <span className="font-medium text-sm">{orc.cliente_nome}</span>
                      <span className="text-xs text-muted-foreground">
                        {orc.cod_referencia || 'Sem referência'} •{' '}
                        {new Date(orc.created).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelect(orc)}
                      disabled={importingId === orc.id}
                    >
                      {importingId === orc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Importar'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
