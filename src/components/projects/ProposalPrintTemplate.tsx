import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
}: {
  data: PrintProjectData
  onClose?: () => void
}) {
  const total =
    data.items?.reduce(
      (acc: number, item: any) =>
        acc +
        (item.subtotal ||
          item.total ||
          item.valor_total ||
          (item.quantidade || 0) * (item.valor_unitario || 0) ||
          (item.laudas || 0) * (item.valorLauda || 0) ||
          (item.qtd_laudas || 0) * (item.valor_lauda || 0)),
      0,
    ) ||
    data.value ||
    0

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-auto print:relative print:block print:w-full print:h-auto print:bg-white print:overflow-visible print:m-0 print:p-0">
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

      <div className="bg-white p-10 max-w-4xl mx-auto w-full text-slate-900 font-sans shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0 my-8 print:my-0 print:block print:w-full print:max-w-full">
        {/* Header */}
        <div className="flex flex-col items-start mb-8 border-b-2 border-slate-900 pb-6">
          <h1 className="text-3xl font-bold tracking-tight uppercase">Tradeezer</h1>
          <h2 className="text-xl font-medium text-slate-600 mt-1 uppercase tracking-wide">
            Orçamento Comercial
          </h2>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          {/* Client Info */}
          <div>
            <h3 className="font-bold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              Dados do Cliente
            </h3>
            <div className="space-y-1">
              <p>
                <span className="font-semibold">Cliente:</span> {data.client || 'Não informado'}
              </p>
              {data.clientCnpj && (
                <p>
                  <span className="font-semibold">CNPJ/CPF:</span> {data.clientCnpj}
                </p>
              )}
              {data.clientContact && (
                <p>
                  <span className="font-semibold">Contato:</span> {data.clientContact}
                </p>
              )}
              {data.email && (
                <p>
                  <span className="font-semibold">E-mail:</span> {data.email}
                </p>
              )}
              {data.phone && (
                <p>
                  <span className="font-semibold">Telefone:</span> {data.phone}
                </p>
              )}
              {data.clientAddress && (
                <p>
                  <span className="font-semibold">Endereço:</span> {data.clientAddress}
                </p>
              )}
            </div>
          </div>

          {/* Project Info */}
          <div>
            <h3 className="font-bold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              Detalhes do Projeto
            </h3>
            <div className="space-y-1">
              <p>
                <span className="font-semibold">Ref:</span>{' '}
                {data.referenceCode.startsWith('TRD')
                  ? data.referenceCode
                  : `TRD-${data.referenceCode}`}
              </p>
              <p>
                <span className="font-semibold">Data de Solicitação:</span>{' '}
                {data.entryDate
                  ? format(data.entryDate, 'dd/MM/yyyy')
                  : format(new Date(), 'dd/MM/yyyy')}
              </p>
              {data.deadline && (
                <p>
                  <span className="font-semibold">Data de Entrega:</span>{' '}
                  {format(data.deadline, 'dd/MM/yyyy')}
                </p>
              )}
              {data.serviceType && (
                <p>
                  <span className="font-semibold">Tipo de Serviço:</span> {data.serviceType}
                </p>
              )}
              {(data.sourceLang || data.targetLang) && (
                <p>
                  <span className="font-semibold">Idiomas:</span> {data.sourceLang || '-'} &rarr;{' '}
                  {data.targetLang || '-'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        {data.items && data.items.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1 text-sm">
              Detalhamento de Itens
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800">
                  <th className="py-2 text-left font-bold w-1/2">Descrição</th>
                  <th className="py-2 text-center font-bold">Qtd</th>
                  <th className="py-2 text-right font-bold">Valor Unitário</th>
                  <th className="py-2 text-right font-bold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.items.map((item: any, idx: number) => {
                  const itemTotal =
                    item.subtotal ||
                    item.total ||
                    item.valor_total ||
                    (item.quantidade || 0) * (item.valor_unitario || 0) ||
                    (item.laudas || 0) * (item.valorLauda || 0) ||
                    (item.qtd_laudas || 0) * (item.valor_lauda || 0) ||
                    0
                  return (
                    <tr key={idx} className="print:break-inside-avoid">
                      <td className="py-3 text-left">
                        {item.description || item.descricao || '-'}
                      </td>
                      <td className="py-3 text-center">
                        {item.laudas || item.quantidade || item.qtd_laudas || 0}
                      </td>
                      <td className="py-3 text-right">
                        {formatCurrency(
                          item.valorLauda || item.valor_unitario || item.valor_lauda || 0,
                        )}
                      </td>
                      <td className="py-3 text-right font-medium">{formatCurrency(itemTotal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Additional Services */}
        {data.services && data.services.some((s) => s.active) && (
          <div className="mb-8 print:break-inside-avoid">
            <h3 className="font-bold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 text-sm">
              Serviços Adicionais Inclusos
            </h3>
            <ul className="list-disc list-inside ml-4 text-sm space-y-1">
              {data.services
                .filter((s) => s.active)
                .map((service: any, index: number) => (
                  <li key={index}>{service.label}</li>
                ))}
            </ul>
          </div>
        )}

        {/* Observações e Forma de Pagamento */}
        <div className="grid grid-cols-2 gap-8 mb-10 print:break-inside-avoid text-sm">
          <div>
            {data.observations && (
              <>
                <h3 className="font-bold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                  Observações
                </h3>
                <p className="whitespace-pre-wrap">{data.observations}</p>
              </>
            )}
          </div>
          <div>
            {data.paymentMethod && (
              <>
                <h3 className="font-bold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                  Condições de Pagamento
                </h3>
                <p className="whitespace-pre-wrap">{data.paymentMethod}</p>
              </>
            )}
          </div>
        </div>

        {/* Total Footer */}
        <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center print:break-inside-avoid">
          <div className="text-sm text-slate-500 uppercase tracking-widest font-medium">
            Valor Total do Orçamento
          </div>
          <div className="text-2xl font-bold">{formatCurrency(total)}</div>
        </div>
      </div>
    </div>
  )
}
