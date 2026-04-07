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
  urgent?: boolean
  international?: boolean
  digitalCopy?: boolean
  physicalCopy?: boolean
  hagueApostille?: boolean
  digitalApostille?: boolean
  physicalApostille?: boolean
  notarization?: boolean
  digitalAuthentication?: boolean
  shipping?: boolean
  internationalShipping?: boolean
}

export const ProposalPrintTemplate: React.FC<{
  data?: PrintProjectData
  autoPrint?: boolean
  onClose?: () => void
}> = ({ data, autoPrint, onClose }) => {
  const safeData: Partial<PrintProjectData> = data || {}

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

  const gridServices = [
    { label: 'Urgente', active: !!safeData.urgent },
    { label: 'Internacional', active: !!safeData.international },
    { label: 'Via Digital', active: !!safeData.digitalCopy },
    { label: 'Via Física', active: !!safeData.physicalCopy },
    { label: 'Apostilamento de Haia', active: !!safeData.hagueApostille },
    { label: 'Apostilamento Digital', active: !!safeData.digitalApostille },
    { label: 'Apostilamento Físico', active: !!safeData.physicalApostille },
    { label: 'Reconhecimento', active: !!safeData.notarization },
    { label: 'Autenticação documento Digital', active: !!safeData.digitalAuthentication },
    { label: 'Frete', active: !!safeData.shipping },
    { label: 'DHL (Exterior)', active: !!safeData.internationalShipping },
  ]

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

  const getLang = (code: string) => LANGUAGES?.find((l) => l.value === code)?.label || code

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
      <div className="w-full max-w-[210mm] mx-auto text-slate-900 font-sans bg-white p-8">
        {/* Header Section with Logo - Centered */}
        <div className="flex flex-col items-center mb-10">
          <img src={logoUrl} alt="Tradeezer Logo" className="h-24 w-auto object-contain mb-8" />
          <div className="w-full flex justify-between items-end border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-light text-slate-800 tracking-tight">
              Orçamento Comercial
            </h1>
            <div className="text-right flex flex-col gap-1">
              <p className="text-slate-500 text-sm">
                Ref: <span className="text-slate-800 font-bold">{refCode}</span>
              </p>
              <p className="text-slate-400 text-sm">Data: {formatDate(new Date())}</p>
            </div>
          </div>
        </div>

        {/* Primary Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Para
            </h3>
            <p className="font-bold text-base text-slate-800 mb-1">{clientName}</p>
            <p className="text-sm text-slate-600">Status: {status}</p>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Detalhes do Serviço
            </h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-700">Categoria:</span> {translationType}
              </p>
              <p>
                <span className="font-medium text-slate-700">Idiomas:</span> {getLang(sourceLang)} →{' '}
                {getLang(targetLang)}
              </p>
              <p>
                <span className="font-medium text-slate-700">Tipo de Documento:</span>{' '}
                {documentType}
              </p>
              <p>
                <span className="font-medium text-slate-700">Qtd. Documentos:</span>{' '}
                {documentsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="mb-10 grid grid-cols-2 gap-4 bg-slate-50/80 p-5 rounded-xl break-inside-avoid">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Data de Entrada
            </span>
            <span className="text-sm font-bold text-slate-800">{formatDate(entryDate)}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Prazo Estimado
            </span>
            <span className="text-sm font-bold text-slate-800">{formatDate(deadline)}</span>
          </div>
        </div>

        {/* Documents Table Section */}
        {items.length > 0 && (
          <div className="mb-10 break-inside-avoid">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Itens do Projeto
            </h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 text-slate-500 font-semibold w-1/2">Item / Descrição</th>
                  <th className="py-2 text-slate-500 font-semibold text-center">Qtd. Laudas</th>
                  <th className="py-2 text-slate-500 font-semibold text-right">Valor Unitário</th>
                  <th className="py-2 text-slate-500 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-3 font-bold text-slate-800">{item.description}</td>
                    <td className="py-3 text-center text-slate-600">{item.laudas}</td>
                    <td className="py-3 text-right text-slate-600">
                      {formatCurrency(item.valorLauda)}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-800">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Additional Services */}
        <div className="mb-12 break-inside-avoid">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">
            Serviços Adicionais e Logística
          </h3>
          <div className="grid grid-cols-3 gap-y-5 gap-x-4">
            {gridServices.map((srv, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-sm">
                {srv.active ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className={srv.active ? 'text-slate-800 font-bold' : 'text-slate-400'}>
                  {srv.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Section */}
        <div className="mb-8 flex justify-end break-inside-avoid">
          <div className="w-full sm:w-2/3 lg:w-1/2 bg-slate-50/80 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Investimento Total
              </span>
              <span className="text-xl font-bold text-slate-800">{formatCurrency(totalValue)}</span>
            </div>
            {laudasCount > 0 && (
              <div className="text-right text-[11px] text-slate-400 mt-1">
                Total de {laudasCount} lauda(s)
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1 break-inside-avoid">
          <p className="font-bold text-slate-500 uppercase tracking-widest">
            Tradeezer - Sua comunicação com o mundo
          </p>
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
