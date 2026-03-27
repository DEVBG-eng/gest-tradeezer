import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { format } from 'date-fns'
import { CheckCircle2, XCircle } from 'lucide-react'
import logoUrl from '@/assets/fundo-branco-azul-turquesa-vibrante-14fd6.jpg'
import { LANGUAGES } from '@/components/LanguageCombobox'

export interface PrintProjectData {
  referenceCode: string
  client: string
  status: string
  translationType: string
  sourceLang: string
  targetLang: string
  documentType: string
  documents: number
  laudas: number
  rate: number
  value: number
  entryDate?: Date
  deadline?: Date
  services: { label: string; active: boolean }[]
  observations: string
  items: {
    description: string
    laudas: number
    valorLauda: number
    total: number
  }[]
}

export const ProposalPrintTemplate: React.FC<{
  data?: PrintProjectData
  autoPrint?: boolean
  onClose?: () => void
}> = ({ data, autoPrint, onClose }) => {
  const safeData: Partial<PrintProjectData> = data || {}

  // Safe fallbacks to prevent undefined pointer exceptions
  const refCode = safeData.referenceCode || 'N/A'
  const clientName = safeData.client || 'Cliente não informado'
  const status = safeData.status || 'Não definido'
  const translationType = safeData.translationType || 'Não definida'
  const sourceLang = safeData.sourceLang || 'pt'
  const targetLang = safeData.targetLang || 'en'
  const documentType = safeData.documentType || 'Não definido'
  const documentsCount = safeData.documents || 0
  const laudasCount = safeData.laudas || 0
  const totalValue = safeData.value || 0
  const entryDate = safeData.entryDate
  const deadline = safeData.deadline
  const items = safeData.items || []
  const services = safeData.services || []
  const observations = safeData.observations || ''

  useEffect(() => {
    if (autoPrint) {
      const originalTitle = document.title
      document.title = `Orcamento_${refCode}`

      const timer = setTimeout(() => {
        window.print()
        document.title = originalTitle
        if (onClose) onClose()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [autoPrint, refCode, onClose])

  if (typeof document === 'undefined') return null

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const formatDate = (date?: Date) => {
    try {
      return date ? format(date, 'dd/MM/yyyy') : 'Não definida'
    } catch (error) {
      return 'Data inválida'
    }
  }

  const getLang = (code: string) => LANGUAGES.find((l) => l.value === code)?.label || code

  return createPortal(
    <div id="print-portal-root" className="hidden print:block w-full bg-white z-[99999]">
      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 15mm; }
          body > *:not(#print-portal-root) { display: none !important; }
          #print-portal-root { display: block !important; position: relative; width: 100%; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
        `}
      </style>
      <div className="w-full max-w-[210mm] mx-auto text-slate-900 font-sans bg-white">
        {/* Header Section with Logo */}
        <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-8 mt-4">
          <div className="flex-shrink-0">
            <img src={logoUrl} alt="Tradeezer Logo" className="h-16 w-auto object-contain" />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-light text-slate-800 tracking-tight mb-1">
              Orçamento Comercial
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Ref: <span className="text-slate-800 font-bold">{refCode}</span>
            </p>
            <p className="text-slate-400 text-sm mt-1">Data: {formatDate(new Date())}</p>
          </div>
        </div>

        {/* Primary Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
              Para
            </h3>
            <p className="font-semibold text-lg text-slate-800">{clientName}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-500">Status:</span> {status}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
              Detalhes do Serviço
            </h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-500">Categoria:</span> {translationType}
              </p>
              <p>
                <span className="font-medium text-slate-500">Idiomas:</span> {getLang(sourceLang)} →{' '}
                {getLang(targetLang)}
              </p>
              <p>
                <span className="font-medium text-slate-500">Tipo de Documento:</span>{' '}
                {documentType}
              </p>
              <p>
                <span className="font-medium text-slate-500">Qtd. Documentos:</span>{' '}
                {documentsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="mb-8 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 break-inside-avoid">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Data de Entrada
            </span>
            <span className="text-sm font-medium text-slate-700">{formatDate(entryDate)}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Prazo Estimado
            </span>
            <span className="text-sm font-medium text-slate-700">{formatDate(deadline)}</span>
          </div>
        </div>

        {/* Documents Table Section */}
        {items.length > 0 && (
          <div className="mb-8 break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
              Itens do Projeto
            </h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 text-slate-500 font-semibold">Item / Descrição</th>
                  <th className="py-2 text-slate-500 font-semibold text-center">Qtd. Laudas</th>
                  <th className="py-2 text-slate-500 font-semibold text-right">Valor Unitário</th>
                  <th className="py-2 text-slate-500 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-3 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3 text-center text-slate-600">{item.laudas}</td>
                    <td className="py-3 text-right text-slate-600">
                      {formatCurrency(item.valorLauda)}
                    </td>
                    <td className="py-3 text-right font-medium text-slate-800">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Additional Services */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
            Serviços Adicionais e Logística
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
            {services.map((srv, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-sm">
                {srv.active ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className={srv.active ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                  {srv.label}
                </span>
              </div>
            ))}
            {services.length === 0 && (
              <div className="col-span-full text-slate-500 italic text-sm">
                Nenhum serviço adicional selecionado
              </div>
            )}
          </div>
        </div>

        {/* Financial Section */}
        <div className="mb-8 flex justify-end break-inside-avoid">
          <div className="w-full sm:w-2/3 lg:w-1/2 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Investimento Total
              </span>
              <span className="text-2xl font-bold text-teal-600">{formatCurrency(totalValue)}</span>
            </div>
            <div className="text-right text-xs text-slate-400">Total de {laudasCount} lauda(s)</div>
          </div>
        </div>

        {/* Observations Section */}
        {observations && (
          <div className="mb-10 break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
              Observações e Condições
            </h3>
            <p className="whitespace-pre-wrap text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {observations}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1 break-inside-avoid">
          <p className="font-medium text-slate-500">Tradeezer - Sua comunicação com o mundo</p>
          <p>
            Este documento é uma proposta comercial confidencial. Os valores e prazos estão sujeitos
            a alterações após o período de validade.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
