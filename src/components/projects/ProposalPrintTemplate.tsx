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
import logoUrl from '@/assets/image-ab962.png'
import { CheckCircle2, XCircle } from 'lucide-react'

export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ProposalPrintTemplate({ project, items, autoPrint, onClose }: any) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print()
        if (onClose) onClose()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [autoPrint, onClose])

  // Extract variables, supporting both DB format and Client (Project) format
  const clientName =
    project?.client ||
    project?.expand?.cliente?.nome_fantasia ||
    project?.expand?.cliente?.razao_social ||
    'CLIENTE NÃO INFORMADO'
  const ref = project?.id || project?.cod_referencia || '----'
  const status = project?.status || '-'
  const serviceType = project?.translationType || project?.tipo_servico || '-'
  const sourceLang = project?.sourceLang || project?.idioma_origem || '-'
  const targetLang = project?.targetLang || project?.idioma_destino || '-'
  const docType = project?.documentType || project?.tipo_documento || 'Não definido'
  const docCount = project?.documents || project?.qtd_documentos || '1'
  const paymentMethod = project?.paymentMethod || project?.forma_pagamento || 'Não definida'
  const entryDate = project?.entryDate || project?.data_entrada
  const dueDate = project?.dueDate || project?.data_entrega

  const isInternacional =
    (sourceLang.toLowerCase() !== 'português' && sourceLang !== 'pt') ||
    (targetLang.toLowerCase() !== 'português' && targetLang !== 'pt')

  const additionalServices = [
    { label: 'Urgente', active: project?.urgent || project?.urgente },
    { label: 'Internacional', active: isInternacional },
    { label: 'Via Digital', active: project?.digitalCopy || project?.digital },
    { label: 'Via Física', active: project?.physicalCopy || project?.fisico },
    { label: 'Apostilamento de Haia', active: project?.hagueApostille || project?.apostilamento },
    {
      label: 'Apostilamento Digital',
      active: project?.digitalApostille || project?.apostilamento_digital,
    },
    {
      label: 'Apostilamento Físico',
      active: project?.physicalApostille || project?.apostilamento_fisico,
    },
    { label: 'Reconhecimento', active: project?.notarization || project?.reconhecimento },
    {
      label: 'Autenticação documento Digital',
      active: project?.digitalAuthentication || project?.autenticacao_digital,
    },
    { label: 'Frete', active: project?.shipping || project?.frete },
    { label: 'DHL (Exterior)', active: project?.internationalShipping || project?.dhl },
  ]

  const printItems = items || project?.items || []
  const total = printItems.reduce((acc: number, item: any) => {
    const itemTotal =
      item.total ||
      item.valor_total ||
      (item.laudas || item.quantidade || 0) * (item.valorLauda || item.valor_unitario || 0)
    return acc + itemTotal
  }, 0)

  return (
    <div
      className={`bg-white p-8 max-w-4xl mx-auto text-slate-800 font-sans shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 ${
        autoPrint ? 'fixed inset-0 z-[9999] overflow-auto' : ''
      }`}
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <img src={logoUrl} alt="Tradeezer" className="h-24 object-contain mb-8" />

        <div className="w-full flex justify-between items-end border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-medium text-slate-800">Orçamento Comercial</h1>
          <div className="text-right text-sm text-slate-500">
            <p className="font-medium text-slate-700 mb-1">
              Ref: <span className="font-bold text-slate-800">TRD-{ref.replace('TRD-', '')}</span>
            </p>
            <p>Data: {format(new Date(), 'dd/MM/yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Client & Service Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Para</h3>
          <p className="font-bold text-slate-800 text-lg mb-2 uppercase">{clientName}</p>
          <p className="text-sm text-slate-600">Status: {status}</p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Detalhes do Serviço
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-700">Categoria:</span> {serviceType}
            </p>
            <p>
              <span className="font-medium text-slate-700">Idiomas:</span> {sourceLang} &rarr;{' '}
              {targetLang}
            </p>
            <p>
              <span className="font-medium text-slate-700">Tipo de Documento:</span> {docType}
            </p>
            <p>
              <span className="font-medium text-slate-700">Qtd. Documentos:</span> {docCount}
            </p>
            <p>
              <span className="font-medium text-slate-700">Forma de Pagamento:</span>{' '}
              {paymentMethod}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Box */}
      <div className="bg-slate-50 rounded-xl p-6 grid grid-cols-2 gap-8 mb-10 border border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Data de Entrada
          </h3>
          <p className="font-bold text-slate-800 text-base">
            {entryDate ? format(new Date(entryDate), 'dd/MM/yyyy') : '-'}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Prazo Estimado
          </h3>
          <p className="font-bold text-slate-800 text-base">
            {dueDate ? format(new Date(dueDate), 'dd/MM/yyyy') : '-'}
          </p>
        </div>
      </div>

      {/* Project Items Table */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Itens do Projeto
        </h3>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 hover:bg-transparent">
              <TableHead className="font-bold text-slate-500 h-10 px-0">Item / Descrição</TableHead>
              <TableHead className="text-center font-bold text-slate-500 h-10">
                Qtd. Laudas
              </TableHead>
              <TableHead className="text-right font-bold text-slate-500 h-10">
                Valor Unitário
              </TableHead>
              <TableHead className="text-right font-bold text-slate-500 h-10 px-0">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {printItems.length > 0 ? (
              printItems.map((item: any, idx: number) => {
                const itemTotal =
                  item.total ||
                  item.valor_total ||
                  (item.laudas || item.quantidade || 0) *
                    (item.valorLauda || item.valor_unitario || 0)
                return (
                  <TableRow
                    key={item.id || idx}
                    className="border-b border-slate-100 hover:bg-transparent"
                  >
                    <TableCell className="py-4 font-bold text-slate-800 px-0">
                      {item.description || item.descricao}
                    </TableCell>
                    <TableCell className="py-4 text-center text-slate-600">
                      {item.laudas || item.quantidade || 0}
                    </TableCell>
                    <TableCell className="py-4 text-right text-slate-600">
                      {formatCurrency(item.valorLauda || item.valor_unitario || 0)}
                    </TableCell>
                    <TableCell className="py-4 text-right font-bold text-slate-800 px-0">
                      {formatCurrency(itemTotal)}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="text-center py-6 text-slate-500 px-0">
                  Nenhum item adicionado ao orçamento
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {printItems.length > 0 && (
          <div className="flex justify-end mt-6">
            <div className="flex items-center gap-6 bg-slate-50 px-6 py-4 rounded-xl border border-slate-100">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Total
              </span>
              <span className="text-2xl font-bold text-emerald-600">{formatCurrency(total)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Additional Services Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">
          Serviços Adicionais e Logística
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
          {additionalServices.map((service, index) => (
            <div key={index} className="flex items-center gap-3">
              {service.active ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={2} />
              ) : (
                <XCircle className="w-5 h-5 text-slate-200 shrink-0" strokeWidth={1.5} />
              )}
              <span
                className={`text-sm ${service.active ? 'text-slate-800 font-medium' : 'text-slate-400'}`}
              >
                {service.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
