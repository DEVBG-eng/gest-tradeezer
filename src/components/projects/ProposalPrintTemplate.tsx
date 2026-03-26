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
}

export const ProposalPrintTemplate: React.FC<{
  data: PrintProjectData
  autoPrint?: boolean
  onClose?: () => void
}> = ({ data, autoPrint, onClose }) => {
  useEffect(() => {
    if (autoPrint) {
      const originalTitle = document.title
      document.title = `Orcamento_${data.referenceCode}`

      const timer = setTimeout(() => {
        window.print()
        document.title = originalTitle
        if (onClose) onClose()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [autoPrint, data.referenceCode, onClose])

  if (typeof document === 'undefined') return null

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const formatDate = (date?: Date) => (date ? format(date, 'dd/MM/yyyy') : 'Não definida')

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
              Ref: <span className="text-slate-800 font-bold">{data.referenceCode}</span>
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
            <p className="font-semibold text-lg text-slate-800">{data.client}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-500">Status:</span> {data.status}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
              Detalhes do Serviço
            </h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-500">Categoria:</span>{' '}
                {data.translationType || 'Não definida'}
              </p>
              <p>
                <span className="font-medium text-slate-500">Idiomas:</span>{' '}
                {getLang(data.sourceLang)} → {getLang(data.targetLang)}
              </p>
              <p>
                <span className="font-medium text-slate-500">Tipo de Documento:</span>{' '}
                {data.documentType || 'Não definido'}
              </p>
              <p>
                <span className="font-medium text-slate-500">Qtd. Documentos:</span>{' '}
                {data.documents}
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
            <span className="text-sm font-medium text-slate-700">{formatDate(data.entryDate)}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Prazo Estimado
            </span>
            <span className="text-sm font-medium text-slate-700">{formatDate(data.deadline)}</span>
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
            Serviços Adicionais e Logística
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
            {data.services.map((srv, idx) => (
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
          </div>
        </div>

        {/* Financial Section */}
        <div className="mb-8 flex justify-end break-inside-avoid">
          <div className="w-full sm:w-2/3 lg:w-1/2 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Volume Estimado</span>
                <span className="text-slate-700 font-medium">{data.laudas} lauda(s)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Taxa por Lauda</span>
                <span className="text-slate-700 font-medium">{formatCurrency(data.rate)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Investimento Total
              </span>
              <span className="text-2xl font-bold text-teal-600">{formatCurrency(data.value)}</span>
            </div>
          </div>
        </div>

        {/* Observations Section */}
        {data.observations && (
          <div className="mb-10 break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
              Observações e Condições
            </h3>
            <p className="whitespace-pre-wrap text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {data.observations}
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
