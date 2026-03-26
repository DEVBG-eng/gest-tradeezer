import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Project } from '@/stores/useProjectStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ProposalPrintTemplate({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  useEffect(() => {
    const originalTitle = document.title
    const dateStr = format(new Date(), 'dd-MM-yyyy')
    const safeTitle = project.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
    document.title = `Proposta_Tradeezer_${safeTitle}_${dateStr}`

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

  const content = (
    <div className="print-only bg-white text-black p-10 font-sans min-h-screen z-[9999] absolute inset-0">
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

      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-teal-600 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-[3px] border-teal-600 text-teal-600">
            <span className="text-4xl font-black italic">T</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-teal-600 tracking-tight leading-none">
              tradeezer.
            </h1>
            <p className="text-[10px] text-teal-600 font-medium mt-1">
              sua comunicação com o mundo
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
            Proposta de Serviço
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            <strong>Ref:</strong> {project.id}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Data:</strong> {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Projeto: {project.title}</h3>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Informações Gerais */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <h4 className="font-bold text-teal-700 border-b border-gray-200 pb-2 mb-3 uppercase text-sm tracking-wide">
            Informações Gerais
          </h4>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-semibold text-gray-900">{project.client}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Data de Entrada:</span>
              <span className="font-semibold text-gray-900">
                {project.entryDate ? format(new Date(project.entryDate), 'dd/MM/yyyy') : '-'}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Prazo de Entrega:</span>
              <span className="font-semibold text-gray-900">
                {project.dueDate ? format(new Date(project.dueDate), 'dd/MM/yyyy') : '-'}
              </span>
            </p>
          </div>
        </div>

        {/* Especificações Técnicas */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <h4 className="font-bold text-teal-700 border-b border-gray-200 pb-2 mb-3 uppercase text-sm tracking-wide">
            Especificações Técnicas
          </h4>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-gray-600">Tipo de Documento:</span>
              <span className="font-semibold text-gray-900">{project.documentType || '-'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Qtd. Documentos:</span>
              <span className="font-semibold text-gray-900">{project.documents}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Qtd. Laudas:</span>
              <span className="font-semibold text-gray-900">
                {project.laudas.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}
              </span>
            </p>
          </div>
        </div>

        {/* Logística */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <h4 className="font-bold text-teal-700 border-b border-gray-200 pb-2 mb-3 uppercase text-sm tracking-wide">
            Logística
          </h4>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-gray-600">Via Digital:</span>
              <span className="font-semibold text-gray-900">
                {project.digitalCopy ? 'Sim' : 'Não'}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Via Física:</span>
              <span className="font-semibold text-gray-900">
                {project.physicalCopy ? 'Sim' : 'Não'}
              </span>
            </p>
          </div>
        </div>

        {/* Serviços Adicionais */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <h4 className="font-bold text-teal-700 border-b border-gray-200 pb-2 mb-3 uppercase text-sm tracking-wide">
            Serviços Adicionais
          </h4>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-gray-600">Apostilamento de Haia:</span>
              <span className="font-semibold text-gray-900">
                {project.hagueApostille ? 'Sim' : 'Não'}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Reconhecimento de Firma:</span>
              <span className="font-semibold text-gray-900">
                {project.notarization ? 'Sim' : 'Não'}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Frete Nacional:</span>
              <span className="font-semibold text-gray-900">
                {project.shipping ? 'Sim' : 'Não'}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Envio Internacional (DHL):</span>
              <span className="font-semibold text-gray-900">
                {project.internationalShipping ? 'Sim' : 'Não'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Observações */}
      {project.observations && (
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 mb-8">
          <h4 className="font-bold text-teal-700 border-b border-gray-200 pb-2 mb-3 uppercase text-sm tracking-wide">
            Observações
          </h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {project.observations}
          </p>
        </div>
      )}

      {/* Footer / Assinatura */}
      <div className="mt-20 pt-8 border-t border-gray-200 flex justify-between items-end">
        <div className="text-xs text-gray-500">
          <p>Documento gerado eletronicamente.</p>
          <p>Tradeezer © {new Date().getFullYear()} - Todos os direitos reservados.</p>
        </div>
        <div className="w-64 text-center">
          <div className="border-t border-gray-400 mb-2 pt-2">
            <p className="text-sm font-semibold text-gray-800">Assinatura do Cliente</p>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
