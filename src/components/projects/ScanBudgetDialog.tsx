import { useState, useRef } from 'react'
import { FileScan, Loader2, UploadCloud, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { orcamentoService } from '@/services/orcamentoService'
import { useAuth } from '@/hooks/use-auth'

interface ScanBudgetDialogProps {
  onImport: (data: { orcamento: any; itens: any[] }) => void
}

export function ScanBudgetDialog({ onImport }: ScanBudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    setError(null)

    // Simulate OCR delay
    await new Promise((r) => setTimeout(r, 2500))

    try {
      // Mock extraction logic
      const isMissingRef = Math.random() > 0.7 // 30% chance to miss reference for testing
      const extractedRef = isMissingRef ? '' : `TRD-${Math.floor(Math.random() * 90000) + 10000}`

      const extractedData = {
        cliente_nome: 'Cliente Documento Scaneado',
        cliente_email: 'contato@docscaneado.com.br',
        cod_referencia: extractedRef,
        itens: [
          {
            descricao: 'Tradução Juramentada - Inglês',
            quantidade: 5,
            valor_unitario: 120.0,
            subtotal: 600.0,
          },
          {
            descricao: 'Taxa de Urgência',
            quantidade: 1,
            valor_unitario: 150.0,
            subtotal: 150.0,
          },
        ],
      }

      if (extractedData.cod_referencia) {
        // Validate duplicity
        try {
          await pb
            .collection('Projetos')
            .getFirstListItem(`cod_referencia="${extractedData.cod_referencia}"`)
          setError(
            `Este orçamento (Ref: ${extractedData.cod_referencia}) já está cadastrado no sistema.`,
          )
          setScanning(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
          return
        } catch (err) {
          // Not found, safe to proceed
        }
      } else {
        toast({
          title: 'Atenção',
          description:
            'O scanner não conseguiu ler o código de referência. Por favor, insira-o manualmente no formulário.',
          variant: 'destructive',
          duration: 6000,
        })
      }

      const orcamento = await orcamentoService.createOrcamento({
        user_id: user?.id || '',
        cliente_nome: extractedData.cliente_nome,
        cliente_email: extractedData.cliente_email,
      })

      if (extractedData.cod_referencia) {
        await pb
          .collection('orcamentos')
          .update(orcamento.id, { cod_referencia: extractedData.cod_referencia })
        orcamento.cod_referencia = extractedData.cod_referencia
      }

      const createdItens = []
      for (const item of extractedData.itens) {
        const created = await orcamentoService.createItem({
          orcamento_id: orcamento.id,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          subtotal: item.subtotal,
        })
        createdItens.push(created)
      }

      onImport({ orcamento, itens: createdItens })
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o documento.')
    } finally {
      setScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full sm:w-auto font-medium">
          <FileScan className="w-4 h-4 mr-2" />
          Escanear Orçamento Comercial
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear Orçamento Comercial</DialogTitle>
          <DialogDescription>
            Faça upload do arquivo (PDF ou Imagem) para extração automática dos dados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro de Validação</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!scanning ? (
            <div
              className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-10 text-center cursor-pointer bg-slate-50/30 dark:bg-slate-900/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                accept="application/pdf,image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-1">Selecionar Arquivo</h3>
              <p className="text-sm text-muted-foreground">Clique para escolher PDF ou imagem.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground animate-pulse">
                Processando documento via IA...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
