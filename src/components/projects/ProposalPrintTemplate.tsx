import { useEffect } from 'react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import logoUrl from '@/assets/fundo-branco-azul-turquesa-vibrante-f595e.jpg'

export interface PrintProjectData {
  referenceCode: string
  client: string
  clientCnpj?: string
  clientAddress?: string
  clientContact?: string
  email?: string
  phone?: string
  value?: number
  entryDate?: Date
  deadline?: Date
  serviceType?: string
  translationType?: string
  sourceLang?: string
  targetLang?: string
  services?: { label: string; active: boolean }[]
  observations?: string
  items?: any[]
  paymentMethod?: string
}

export function ProposalPrintTemplate({
  data,
  onClose,
  autoPrint,
}: {
  data: PrintProjectData
  onClose?: () => void
  autoPrint?: boolean
}) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        const originalTitle = document.title
        document.title = `Orcamento_${data.referenceCode}`
        window.print()
        document.title = originalTitle
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [autoPrint, data.referenceCode])

  const total = data.items?.length
    ? data.items.reduce(
        (acc: number, item: any) =>
          acc +
          (item.subtotal ??
            item.total ??
            item.valor_total ??
            ((item.quantidade || item.laudas || item.qtd_laudas || 0) *
              (item.valor_unitario || item.valorLauda || item.valor_lauda || 0) ||
              0)),
        0,
      )
    : data.value || 0

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 overflow-auto print:absolute print:inset-0 print:bg-white print:m-0 print:p-0 print:z-[9999]">
      {/* Esconde todos os elementos de UI não pertinentes durante a impressão */}
      <style>
        {`
          @media print {
            body { background: white !important; }
            nav, header, aside, .sidebar { display: none !important; }
            #root { overflow: visible !important; }
            @page { size: A4; margin: 20mm; }
          }
        `}
      </style>
      <div className="bg-white p-4 flex justify-end gap-2 print:hidden sticky top-0 border-b z-10 shadow-sm shrink-0">
        <Button
          variant="default"
          onClick={() => {
            const originalTitle = document.title
            document.title = `Orcamento_${data.referenceCode}`
            setTimeout(() => {
              window.print()
              document.title = originalTitle
            }, 100)
          }}
        >
          <Download className="w-4 h-4 mr-2" /> Baixar Proposta
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" /> Fechar
          </Button>
        )}
      </div>

      <div className="bg-white p-12 max-w-[210mm] min-h-[297mm] mx-auto w-full text-slate-900 font-sans shadow-md print:shadow-none print:border-none print:p-0 my-8 print:my-0 print:block print:w-full print:min-h-0 print:max-w-none">
        {/* Header Documento */}
        <div className="flex justify-between items-end mb-10 border-b-2 border-slate-800 pb-6">
          <div>
            <img src={logoUrl} alt="Tradeezer Logo" className="h-20 w-auto object-contain" />
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-2">
              Proposta Comercial
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-black">
              Ref:{' '}
              {data.referenceCode?.startsWith('TRD')
                ? data.referenceCode
                : `TRD-${data.referenceCode}`}
            </p>
            <p className="text-slate-600">
              Data:{' '}
              {data.entryDate
                ? format(data.entryDate, 'dd/MM/yyyy')
                : format(new Date(), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>

        {/* Informações Cliente e Projeto */}
        <div className="grid grid-cols-2 gap-12 mb-10 text-sm">
          <div>
            <h3 className="font-bold uppercase tracking-wider text-black mb-3 border-b border-slate-200 pb-1 text-xs">
              Para
            </h3>
            <div className="space-y-1.5 text-slate-700">
              <p className="text-base font-semibold text-black">
                {data.client || 'Cliente não informado'}
              </p>
              {data.clientCnpj && <p>CNPJ/CPF: {data.clientCnpj}</p>}
              {data.clientContact && <p>A/C: {data.clientContact}</p>}
              {data.email && <p>Email: {data.email}</p>}
              {data.phone && <p>Telefone: {data.phone}</p>}
              {data.clientAddress && <p>Endereço: {data.clientAddress}</p>}
            </div>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-black mb-3 border-b border-slate-200 pb-1 text-xs">
              Detalhes do Projeto
            </h3>
            <div className="space-y-1.5 text-slate-700">
              {data.serviceType && (
                <p>
                  <span className="font-medium text-black">Serviço:</span> {data.serviceType}
                </p>
              )}
              {data.translationType && !data.serviceType && (
                <p>
                  <span className="font-medium text-black">Tipo:</span> {data.translationType}
                </p>
              )}
              {(data.sourceLang || data.targetLang) && (
                <p>
                  <span className="font-medium text-black">Idiomas:</span> {data.sourceLang || '-'}{' '}
                  &rarr; {data.targetLang || '-'}
                </p>
              )}
              {data.deadline && (
                <p>
                  <span className="font-medium text-black">Previsão de Entrega:</span>{' '}
                  {format(data.deadline, 'dd/MM/yyyy')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown de Itens */}
        {data.items && data.items.length > 0 ? (
          <div className="mb-10 print:break-inside-auto">
            <h3 className="font-bold uppercase tracking-wider text-black mb-4 border-b border-slate-200 pb-1 text-xs">
              Discriminação de Serviços
            </h3>
            <table className="w-full text-sm border-collapse print:break-inside-auto">
              <thead>
                <tr className="border-b-2 border-slate-800 text-black">
                  <th className="py-2.5 text-left font-semibold w-[50%]">Descrição</th>
                  <th className="py-2.5 text-center font-semibold w-[15%]">Qtd</th>
                  <th className="py-2.5 text-right font-semibold w-[15%]">Valor Unit.</th>
                  <th className="py-2.5 text-right font-semibold w-[20%]">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.items.map((item: any, idx: number) => {
                  const qtd = item.laudas ?? item.quantidade ?? item.qtd_laudas ?? 1
                  const valorUnit = item.valorLauda ?? item.valor_unitario ?? item.valor_lauda ?? 0
                  const itemTotal =
                    item.subtotal ?? item.total ?? item.valor_total ?? qtd * valorUnit
                  return (
                    <tr key={idx} className="print:break-inside-avoid text-slate-700">
                      <td className="py-3 text-left pr-4">
                        {item.description || item.descricao || '-'}
                      </td>
                      <td className="py-3 text-center">{qtd}</td>
                      <td className="py-3 text-right">{formatCurrency(valorUnit)}</td>
                      <td className="py-3 text-right font-medium text-black">
                        {formatCurrency(itemTotal)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mb-10">
            <h3 className="font-bold uppercase tracking-wider text-black mb-4 border-b border-slate-200 pb-1 text-xs">
              Discriminação de Serviços
            </h3>
            <p className="text-sm text-slate-500 italic">
              Serviços cobrados de forma global (ver total abaixo).
            </p>
          </div>
        )}

        {/* Serviços Adicionais */}
        {data.services && data.services.some((s) => s.active) && (
          <div className="mb-10 print:break-inside-avoid">
            <h3 className="font-bold uppercase tracking-wider text-black mb-3 border-b border-slate-200 pb-1 text-xs">
              Serviços Adicionais Inclusos
            </h3>
            <ul className="list-none text-sm space-y-1.5 text-slate-700 columns-2">
              {data.services
                .filter((s) => s.active)
                .map((service: any, index: number) => (
                  <li
                    key={index}
                    className="flex items-center before:content-['•'] before:mr-2 before:text-slate-400"
                  >
                    {service.label}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Condições e Observações */}
        <div className="grid grid-cols-2 gap-12 mb-12 print:break-inside-avoid text-sm">
          <div>
            {data.observations && (
              <>
                <h3 className="font-bold uppercase tracking-wider text-black mb-3 border-b border-slate-200 pb-1 text-xs">
                  Observações
                </h3>
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {data.observations}
                </p>
              </>
            )}
          </div>
          <div>
            {data.paymentMethod && (
              <>
                <h3 className="font-bold uppercase tracking-wider text-black mb-3 border-b border-slate-200 pb-1 text-xs">
                  Condições de Pagamento
                </h3>
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {data.paymentMethod}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Grand Total */}
        <div className="flex justify-end print:break-inside-avoid">
          <div className="w-1/2 border-t-2 border-slate-800 pt-4 flex justify-between items-end">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
              Valor Total
            </div>
            <div className="text-3xl font-bold text-black">{formatCurrency(total)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
