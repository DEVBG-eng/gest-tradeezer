import React from 'react'
import logoUrl from '@/assets/fundo-branco-azul-turquesa-vibrante-14fd6.jpg'

interface ProposalPrintTemplateProps {
  project: any
}

export const ProposalPrintTemplate: React.FC<ProposalPrintTemplateProps> = ({ project }) => {
  if (!project) return null

  const formatCurrency = (value: number | string | undefined) => {
    const num = Number(value)
    if (isNaN(num)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Não definida'
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR')
    } catch {
      return dateStr
    }
  }

  const renderServices = (services: any) => {
    if (!services || (Array.isArray(services) && services.length === 0)) {
      return (
        <p className="text-slate-500 italic text-sm">Nenhum serviço especificado nesta proposta.</p>
      )
    }

    if (Array.isArray(services)) {
      return (
        <table className="w-full text-left border-collapse mt-2">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                Item / Serviço
              </th>
            </tr>
          </thead>
          <tbody>
            {services.map((srv, idx) => (
              <tr key={idx} className="border-b border-slate-100 last:border-0">
                <td className="py-3 text-slate-800 text-sm">
                  {typeof srv === 'string' ? srv : srv.name || srv.title || `Serviço ${idx + 1}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    if (typeof services === 'string') {
      return (
        <p className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed mt-2">
          {services}
        </p>
      )
    }

    return null
  }

  const clientName =
    project.expand?.client_id?.name ||
    project.client_name ||
    project.client ||
    'Cliente não informado'
  const projectName = project.name || project.title || 'Projeto sem nome'
  const projectValue = project.value || project.total_value || project.price || 0

  return (
    <div className="hidden print:block w-full bg-white text-slate-900 font-sans p-8 max-w-4xl mx-auto">
      {/* Header Section with Logo */}
      <div className="flex justify-between items-center border-b-2 border-slate-200 pb-8 mb-8">
        <div className="flex-shrink-0">
          <img src={logoUrl} alt="Tradeezer Logo" className="h-20 w-auto object-contain" />
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-light text-slate-800 tracking-tight mb-1">
            Proposta Comercial
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Ref:{' '}
            <span className="text-slate-800 font-bold">
              {project.reference_code || project.id?.substring(0, 8) || 'N/A'}
            </span>
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Data: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Primary Info Grid */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Para</h3>
          <p className="font-semibold text-lg text-slate-800">{clientName}</p>
          {project.expand?.client_id?.email && (
            <p className="text-slate-500 text-sm mt-1">{project.expand.client_id.email}</p>
          )}
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Detalhes do Projeto
          </h3>
          <p className="font-semibold text-lg text-slate-800">{projectName}</p>

          <div className="mt-4 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Status
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
                {project.status || 'Em Análise'}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Prazo Estimado
              </span>
              <span className="text-sm font-medium text-slate-700">
                {formatDate(project.start_date)} - {formatDate(project.end_date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {project.description && (
        <div className="mb-10 break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
            Descrição do Escopo
          </h3>
          <p className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
            {project.description}
          </p>
        </div>
      )}

      {/* Services Section */}
      <div className="mb-10 break-inside-avoid">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
          Serviços Inclusos
        </h3>
        {renderServices(project.services)}
      </div>

      {/* Financial Section */}
      <div className="mb-10 flex justify-end break-inside-avoid">
        <div className="w-1/2 bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-500 text-sm">Subtotal</span>
            <span className="text-slate-700 font-medium">{formatCurrency(projectValue)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-3">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Investimento Total
            </span>
            <span className="text-xl font-bold text-teal-600">{formatCurrency(projectValue)}</span>
          </div>
        </div>
      </div>

      {/* Observations Section */}
      {project.observations && (
        <div className="mb-10 break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
            Observações e Condições
          </h3>
          <p className="whitespace-pre-wrap text-slate-600 text-xs leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
            {project.observations}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1 break-inside-avoid">
        <p className="font-medium text-slate-500">Tradeezer - Sua comunicação com o mundo</p>
        <p>
          Este documento é uma proposta comercial confidencial. Os valores e prazos estão sujeitos a
          alterações após o período de validade.
        </p>
      </div>
    </div>
  )
}
