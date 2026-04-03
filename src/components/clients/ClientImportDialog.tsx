import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseCSV, parseCurrency } from '@/lib/csv'
import { ClienteRecord } from '@/services/clientes'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (clients: Partial<ClienteRecord>[]) => Promise<void>
}

const columnMapping: Record<string, keyof ClienteRecord> = {
  'Nome Fantasia': 'nome',
  'Razão Social': 'razao_social',
  CNPJ: 'cnpj',
  Prospecção: 'prospeccao',
  'Forma de pagamento': 'forma_pagamento',
  'Certidão Digital': 'valor_certidao_digital',
  'Procuração Digital': 'valor_procuracao_digital',
  'Certidão Física': 'valor_certidao_fisica',
  'Procuração Física': 'valor_procuracao_fisica',
  'Por lauda': 'valor_lauda_padrao',
  Frete: 'valor_frete',
  Observações: 'observacoes',
  Ramo: 'ramo',
  Contato: 'contato',
  Email: 'email',
  Telefone: 'telefone',
  Endereço: 'endereco',
  'INFORMAÇÕES frete': 'informacoes_frete',
}

const numberFields = new Set([
  'valor_certidao_digital',
  'valor_procuracao_digital',
  'valor_certidao_fisica',
  'valor_procuracao_fisica',
  'valor_lauda_padrao',
  'valor_frete',
])

export function ClientImportDialog({ open, onOpenChange, onImport }: Props) {
  const { toast } = useToast()
  const [isImporting, setIsImporting] = useState(false)
  const [importData, setImportData] = useState<Partial<ClienteRecord>[]>([])
  const [importErrors, setImportErrors] = useState<{ row: number; error: string }[]>([])
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const parsed = parseCSV(content)
      const records: Partial<ClienteRecord>[] = []
      const errors: { row: number; error: string }[] = []

      parsed.forEach((row, index) => {
        const record: Partial<ClienteRecord> = {}
        let hasNome = false

        for (const [csvKey, dbKey] of Object.entries(columnMapping)) {
          const actualKey = Object.keys(row).find(
            (k) => k.trim().toLowerCase() === csvKey.toLowerCase(),
          )
          const rawVal = actualKey ? row[actualKey] : ''

          if (dbKey === 'nome' && rawVal) hasNome = true

          if (rawVal) {
            if (numberFields.has(dbKey)) {
              const num = parseCurrency(rawVal)
              if (num !== undefined) record[dbKey as any] = num
            } else {
              record[dbKey as any] = rawVal
            }
          }
        }

        if (hasNome) {
          records.push(record)
        } else {
          errors.push({ row: index + 2, error: 'Falta Nome Fantasia (obrigatório)' })
        }
      })

      setImportData(records)
      setImportErrors(errors)
    }
    reader.readAsText(file)
  }

  const handleConfirm = async () => {
    if (importData.length === 0) return
    setIsImporting(true)
    try {
      await onImport(importData)
      toast({
        title: 'Importação Concluída',
        description: `${importData.length} clientes foram importados com sucesso.`,
      })
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: 'Erro na Importação',
        description: 'Ocorreu um erro ao importar os clientes.',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
    }
  }

  const reset = () => {
    setImportData([])
    setImportErrors([])
    setFileName(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        if (!val) reset()
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Importar Clientes via Planilha</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV. Certifique-se de que a planilha contenha os cabeçalhos
            corretos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input type="file" accept=".csv" onChange={handleFileUpload} disabled={isImporting} />

          {fileName && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{importData.length} registros válidos encontrados.</span>
              </div>
              {importErrors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{importErrors.length} registros com erro (serão ignorados):</span>
                  </div>
                  <ScrollArea className="h-24 border rounded-md p-2">
                    {importErrors.map((e, i) => (
                      <div key={i} className="text-xs text-muted-foreground">
                        Linha {e.row}: {e.error}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isImporting || importData.length === 0}>
            {isImporting ? 'Importando...' : 'Confirmar Importação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
