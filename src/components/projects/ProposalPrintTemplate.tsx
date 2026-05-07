import { useEffect } from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import logoUrl from '@/assets/image-ab962.png'
import { CheckCircle2, Download, Printer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface PrintProjectData {
  referenceCode: string
  client: string
  status?: string
  translationType?: string
  sourceLang?: string
  targetLang?: string
  documentType?: string
  documents?: number
  laudas?: number
  rate?: number
  value?: number
  entryDate?: Date
  deadline?: Date
  services?: { label: string; active: boolean }[]
  observations?: string
  items?: any[]
  paymentMethod?: string
}

export function ProposalPrintTemplate({
  data,
  autoPrint,
  onClose,
}: {
  data: PrintProjectData
  autoPrint?: boolean
  onClose?: () => void
}) {
  useEffect(() => {
    if (autoPrint) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [autoPrint])

  const total =
    data.items?.reduce(
      (acc: number, item: any) =>
        acc +
        (item.total ||
          item.valor_total ||
          (item.quantidade || 0) * (item.valor_unitario || 0) ||
          (item.laudas || 0) * (item.valorLauda || 0)),
      0,
    ) ||
    data.value ||
    0

  const formatLang = (lang?: string) => {
    if (!lang) return '-'
    if (lang === 'pt') return 'Português (BR)'
    if (lang === 'en') return 'Inglês'
    if (lang === 'es') return 'Espanhol'
    return lang
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-auto print:static print:bg-white print:overflow-visible flex flex-col">
      <div className="bg-white p-4 flex justify-end gap-2 print:hidden sticky top-0 border-b z-10 shadow-sm shrink-0">
        <Button variant="default" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-2" /> Baixar Proposta
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" /> Fechar
          </Button>
        )}
      </div>
      <div className="bg-white p-8 max-w-4xl mx-auto w-full text-slate-800 font-sans shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0 my-8 print:my-0 flex-1">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-full flex justify-between items-end border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-medium text-slate-800">Orçamento Comercial</h1>
            <div className="text-right text-sm text-slate-500">
              <p>Data: {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Project Details Sequenced as requested */}
        <div className="mb-10 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
            <div>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">
                1. Código de Referência
              </h3>
              <p className="font-bold text-slate-800 text-base">
                {data.referenceCode
                  ? data.referenceCode.startsWith('TRD')
                    ? data.referenceCode
                    : `TRD-${data.referenceCode}`
                  : '----'}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">
                2. Nome do Cliente
              </h3>
              <p className="font-medium text-slate-800 text-base">
                {data.client || 'NÃO INFORMADO'}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">
                3. Data de Entrada
              </h3>
              <p className="text-slate-800 font-medium">
                {data.entryDate ? format(new Date(data.entryDate), 'dd/MM/yyyy') : '-'}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">
                4. Data de Entrega
              </h3>
              <p className="text-slate-800 font-medium">
                {data.deadline ? format(new Date(data.deadline), 'dd/MM/yyyy') : '-'}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">
                5. Idioma de Origem
              </h3>
              <p className="text-slate-800 font-medium">{formatLang(data.sourceLang)}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">
                6. Idioma de Destino
              </h3>
              <p className="text-slate-800 font-medium">{formatLang(data.targetLang)}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">
                7. Tipo de Tradução
              </h3>
              <p className="text-slate-800 font-medium">{data.translationType || '-'}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">
                8. Valor total
              </h3>
              <p className="font-bold text-emerald-600 text-lg">{formatCurrency(total)}</p>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">
                9. Forma de pagamento
              </h3>
              <p className="text-slate-800 font-medium">{data.paymentMethod || 'Não definida'}</p>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1.5">
                10. Observações do projeto
              </h3>
              <p className="text-slate-800 font-medium whitespace-pre-wrap bg-white p-4 rounded-md border border-slate-100">
                {data.observations || 'Nenhuma observação informada.'}
              </p>
            </div>
          </div>
        </div>

        {/* Project Items Table (Optional breakdown) */}
        {data.items && data.items.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Detalhamento de Itens
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-slate-50 border-b border-slate-200">
                    <TableHead className="font-bold text-slate-600 h-10">Descrição</TableHead>
                    <TableHead className="text-center font-bold text-slate-600 h-10">
                      Laudas/Qtd
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-600 h-10">
                      Valor Unitário
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-600 h-10">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item: any, idx: number) => {
                    const itemTotal =
                      item.total ||
                      item.valor_total ||
                      (item.quantidade || 0) * (item.valor_unitario || 0) ||
                      (item.laudas || 0) * (item.valorLauda || 0) ||
                      0
                    return (
                      <TableRow
                        key={idx}
                        className="border-b border-slate-100 hover:bg-slate-50/50"
                      >
                        <TableCell className="py-3 font-medium text-slate-800">
                          {item.description || item.descricao || '-'}
                        </TableCell>
                        <TableCell className="py-3 text-center text-slate-600">
                          {item.laudas || item.quantidade || 0}
                        </TableCell>
                        <TableCell className="py-3 text-right text-slate-600">
                          {formatCurrency(item.valorLauda || item.valor_unitario || 0)}
                        </TableCell>
                        <TableCell className="py-3 text-right font-bold text-slate-800">
                          {formatCurrency(itemTotal)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Additional Services Grid */}
        {data.services && data.services.some((s) => s.active) && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
              Serviços Adicionais e Logística Inclusos
            </h3>
            <div className="flex flex-wrap gap-3">
              {data.services
                .filter((s) => s.active)
                .map((service: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-xs text-slate-700 font-medium">{service.label}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
