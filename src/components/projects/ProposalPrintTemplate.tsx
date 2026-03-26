import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Project } from '@/stores/useProjectStore'
import { format, parseISO } from 'date-fns'
import { CheckCircle } from 'lucide-react'

const LANGUAGES: Record<string, string> = {
  pt: 'Português',
  en: 'Inglês',
  es: 'Espanhol',
  de: 'Alemão',
  it: 'Italiano',
  fr: 'Francês',
  'zh-CN': 'Chinês (Mandarim)',
  'zh-HK': 'Chinês (Cantonês)',
  pl: 'Polonês',
  hr: 'Croata',
  ja: 'Japonês',
  ko: 'Coreano',
  ru: 'Russo',
  ar: 'Árabe',
  nl: 'Holandês',
  tr: 'Turco',
  el: 'Grego',
  he: 'Hebraico',
  hi: 'Hindi',
  th: 'Tailandês',
  vi: 'Vietnamita',
  sv: 'Sueco',
  no: 'Norueguês',
  da: 'Dinamarquês',
  fi: 'Finlandês',
  ro: 'Romeno',
  hu: 'Húngaro',
  cs: 'Tcheco',
  sk: 'Eslovaco',
  uk: 'Ucraniano',
  id: 'Indonésio',
  ms: 'Malaio',
}

export function ProposalPrintTemplate({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const originalTitle = document.title
    const safeTitle = project.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
    document.title = `Proposta_${safeTitle}`

    const timer = setTimeout(() => {
      window.print()
      document.title = originalTitle
      onCloseRef.current()
    }, 500)

    return () => {
      document.title = originalTitle
      clearTimeout(timer)
    }
  }, [project.title])

  const sourceLangName = project.sourceLang
    ? LANGUAGES[project.sourceLang] || project.sourceLang
    : ''
  const targetLangName = project.targetLang
    ? LANGUAGES[project.targetLang] || project.targetLang
    : ''

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    try {
      const date = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T12:00:00')
      return format(date, 'dd/MM/yyyy')
    } catch {
      return dateStr
    }
  }

  const activeServices = [
    { key: project.digitalCopy, label: 'Via Digital' },
    { key: project.physicalCopy, label: 'Via Física' },
    { key: project.hagueApostille, label: 'Apostilamento de Haia' },
    { key: project.digitalApostille, label: 'Apostilamento Digital' },
    { key: project.physicalApostille, label: 'Apostilamento Físico' },
    { key: project.digitalAuthentication, label: 'Autenticação Digital' },
    { key: project.notarization, label: 'Reconhecimento de Firma' },
    { key: project.shipping, label: 'Frete' },
    { key: project.internationalShipping, label: 'DHL (Exterior)' },
    { key: project.urgent, label: 'Urgente' },
    { key: project.international, label: 'Internacional' },
  ].filter((s) => s.key)

  const content = (
    <div className="print-only bg-white text-slate-900 p-8 font-sans min-h-screen z-[9999] absolute inset-0">
      <style>{`
        @media screen {
          .print-only { display: none !important; }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 1.5cm !important;
            box-sizing: border-box;
            background: white;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6 text-[15px]">
        {/* Header Section */}
        <div className="space-y-2 mb-6">
          <label className="text-base font-semibold flex items-center">
            Cód. de referência <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-mono font-bold text-slate-800">
            {project.id}
          </div>
          <p className="text-sm text-slate-500">
            Código único para identificação do projeto e sincronização em nuvem.
          </p>
        </div>

        {/* Alert Banner */}
        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg p-4 flex gap-3 text-[#059669] mb-6">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold leading-none mb-1">Validação Concluída</h5>
            <p className="text-sm opacity-90">
              Todos os campos obrigatórios foram preenchidos. Você pode registrar o projeto ou gerar
              a proposta.
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold tracking-tight border-b border-slate-200 pb-2 mb-4">
          Painel de Sincronização e Resumo
        </h3>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Card 1: Cliente e Especificações */}
          <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200">
              <h4 className="font-semibold text-sm">Cliente e Especificações</h4>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nome/Razão Social</span>
                <span className="font-medium">{project.client || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status</span>
                <span className="font-medium">{project.status || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Categoria do Serviço</span>
                <span className="font-medium">{project.translationType || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Tipo de Documento</span>
                <span className="font-medium">{project.documentType || '-'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Prazos e Idiomas */}
          <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200">
              <h4 className="font-semibold text-sm">Prazos e Idiomas</h4>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Data de Entrada</span>
                <span className="font-medium">{formatDate(project.entryDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Prazo de Entrega</span>
                <span className="font-medium">{formatDate(project.dueDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Idioma de Origem</span>
                <span className="font-medium">{sourceLangName || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Idioma de Destino</span>
                <span className="font-medium">{targetLangName || '-'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Serviços e Valores */}
          <div className="col-span-2 border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm mt-2">
            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200">
              <h4 className="font-semibold text-sm">Serviços e Valores</h4>
            </div>
            <div className="p-4 space-y-5 text-sm">
              <div>
                <span className="text-slate-500 block mb-2">Logística e Serviços Adicionais:</span>
                <div className="flex flex-wrap gap-2">
                  {activeServices.length > 0 ? (
                    activeServices.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {service.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">
                      Nenhum serviço adicional selecionado
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <span className="text-slate-500 block mb-1">Quantidade de Laudas</span>
                  <span className="font-medium text-base">{project.laudas || '-'}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block mb-1">Valor Total do Projeto</span>
                  <span className="font-bold text-3xl text-[#10b981]">
                    R${' '}
                    {(project.value || 0).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        {project.observations && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold tracking-tight border-b border-slate-200 pb-2 mb-3">
              Observações
            </h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
              {project.observations}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
