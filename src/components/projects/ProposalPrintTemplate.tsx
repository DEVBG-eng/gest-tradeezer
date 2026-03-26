import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Project } from '@/stores/useProjectStore'
import { format, parseISO } from 'date-fns'

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
  useEffect(() => {
    const originalTitle = document.title
    const safeTitle = project.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
    document.title = `Protocolo_${safeTitle}`

    const timer = setTimeout(() => {
      window.print()
      document.title = originalTitle
      onClose()
    }, 500)

    return () => {
      document.title = originalTitle
      clearTimeout(timer)
    }
  }, [onClose, project.title])

  const sourceLangName = project.sourceLang
    ? LANGUAGES[project.sourceLang] || project.sourceLang
    : ''
  const targetLangName = project.targetLang
    ? LANGUAGES[project.targetLang] || project.targetLang
    : ''

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      const date = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T12:00:00')
      return format(date, 'dd/MM/yyyy')
    } catch {
      return dateStr
    }
  }

  const content = (
    <div className="print-only bg-white text-black p-12 font-sans min-h-screen z-[9999] absolute inset-0">
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
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 2cm !important;
            box-sizing: border-box;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      <div className="w-full border border-[#2d1b4e] flex flex-col text-black text-[16px]">
        {/* Header */}
        <div className="flex border-b border-[#2d1b4e]">
          <div className="w-1/2 p-5 flex items-center">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-[46px] h-[46px] rounded-full border-[3px] border-[#a5d8d1] text-[#a5d8d1] bg-white">
                <span
                  className="text-[28px] font-bold italic"
                  style={{ fontFamily: 'serif', marginTop: '2px', marginLeft: '2px' }}
                >
                  T
                </span>
              </div>
              <span className="text-[36px] font-extrabold text-[#a5d8d1] tracking-tighter leading-none mt-1">
                tradeezer.
              </span>
            </div>
          </div>
          <div className="w-1/2 p-5 flex items-center justify-center border-l border-[#2d1b4e]">
            <span className="text-2xl font-medium tracking-wide">PROTOCOLO</span>
          </div>
        </div>

        {/* Vendedor */}
        <div className="p-3 border-b border-[#2d1b4e] min-h-[3.5rem] flex items-center uppercase tracking-wide">
          VENDEDOR:
        </div>

        {/* Cliente */}
        <div className="flex border-b border-[#2d1b4e]">
          <div className="p-3 border-r border-[#2d1b4e] min-w-[120px] flex items-center">
            Cliente:
          </div>
          <div className="p-3 flex-1 flex items-center font-medium">{project.client}</div>
        </div>

        {/* Dates */}
        <div className="flex border-b border-[#2d1b4e]">
          <div className="p-3 w-1/2 border-r border-[#2d1b4e] flex items-center">
            Data de ENTRADA: <span className="ml-2">{formatDate(project.entryDate)}</span>
          </div>
          <div className="p-3 w-1/2 flex items-center">
            <span className="font-bold">Data de ENTREGA:</span>{' '}
            <span className="ml-2 font-bold">{formatDate(project.dueDate)}</span>
          </div>
        </div>

        {/* Languages */}
        <div className="flex border-b border-[#2d1b4e]">
          <div className="p-3 w-1/2 border-r border-[#2d1b4e] flex items-center">
            Idioma Origem: <span className="ml-2">{sourceLangName}</span>
          </div>
          <div className="p-3 w-1/2 flex items-center">
            Idioma destino: <span className="ml-2">{targetLangName}</span>
          </div>
        </div>

        {/* Tipo de Tradução */}
        <div className="p-3 border-b border-[#2d1b4e] min-h-[4rem] flex items-center">
          Tipo de Tradução:{' '}
          <span className="ml-2 font-medium">{project.translationType || ''}</span>
        </div>

        {/* Valor */}
        <div className="p-3 border-b border-[#2d1b4e] min-h-[4rem] flex items-center">
          Valor:{' '}
          <span className="ml-2 font-medium">
            {project.value
              ? `R$ ${project.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : ''}
          </span>
        </div>

        {/* Tipo de documento */}
        <div className="p-3 min-h-[4rem] flex items-center">
          Tipo de documento:{' '}
          <span className="ml-2">
            {project.documentType || ''}
            {project.documentType && project.laudas ? ' - ' : ''}
            {project.laudas
              ? `${project.laudas.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} laudas`
              : ''}
          </span>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
