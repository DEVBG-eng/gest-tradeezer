import { useState, useCallback, useMemo } from 'react'
import useProjectStore from '@/stores/useProjectStore'
import type { PrintProjectData } from '@/components/projects/ProposalPrintTemplate'

export function useProposalPrint() {
  const [projectId, setProjectId] = useState<string | null>(null)
  const { projects } = useProjectStore()

  const handlePrintRequest = useCallback((id: string) => {
    setProjectId(id)
  }, [])

  const closePrint = useCallback(() => {
    setProjectId(null)
  }, [])

  const printData = useMemo(() => {
    if (!projectId) return null
    const project = projects.find((p) => p.id === projectId)
    if (!project) return null

    const services = [
      { label: 'Apostilamento Físico', active: !!project.apostilamento_fisico },
      { label: 'Apostilamento Digital', active: !!project.apostilamento_digital },
      { label: 'Apostilamento', active: !!project.apostilamento },
      { label: 'Autenticação Digital', active: !!project.autenticacao_digital },
      { label: 'Reconhecimento', active: !!project.reconhecimento },
      { label: 'Certidão', active: !!project.certidao },
      { label: 'Divórcio', active: !!project.divorcio },
      { label: 'Declaração', active: !!project.declaracao },
      { label: 'Procuração', active: !!project.procuracao },
      { label: 'Certidão Objeto e Pé', active: !!project.certidao_objeto_pe },
      { label: 'Físico', active: !!project.fisico },
      { label: 'Digital', active: !!project.digital },
      { label: 'Frete', active: !!project.frete },
      { label: 'Frete JK', active: !!project.frete_jk },
      { label: 'DHL', active: !!project.dhl },
      { label: 'Urgente', active: !!project.urgente },
    ].filter((s) => s.active)

    const data: PrintProjectData = {
      referenceCode: project.cod_referencia || '',
      client: project.cliente || '',
      status: project.status,
      translationType: project.tipo_servico || '',
      sourceLang: project.idioma_origem,
      targetLang: project.idioma_destino,
      documentType: project.tipo_documento,
      documents: project.qtd_documentos,
      laudas: project.qtd_laudas,
      rate: project.valor_lauda,
      value: project.valor_total,
      entryDate: project.data_entrada ? new Date(project.data_entrada) : undefined,
      deadline: project.data_entrega ? new Date(project.data_entrega) : undefined,
      services,
      observations: project.observacoes,
      items: project.expand?.['ItensProjeto(projeto)'] || [],
      paymentMethod: project.forma_pagamento,
    }

    return data
  }, [projectId, projects])

  return {
    projectId,
    printData,
    handlePrintRequest,
    closePrint,
  }
}
