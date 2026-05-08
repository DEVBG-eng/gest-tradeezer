import { useState, useCallback, useEffect } from 'react'
import useProjectStore from '@/stores/useProjectStore'
import useClientStore from '@/stores/useClientStore'
import pb from '@/lib/pocketbase/client'
import type { PrintProjectData } from '@/components/projects/ProposalPrintTemplate'

export function useProposalPrint() {
  const [projectId, setProjectId] = useState<string | null>(null)
  const [printData, setPrintData] = useState<PrintProjectData | null>(null)
  const { projects } = useProjectStore()
  const { clients } = useClientStore()

  const handlePrintRequest = useCallback((id: string) => {
    setProjectId(id)
  }, [])

  const closePrint = useCallback(() => {
    setProjectId(null)
    setPrintData(null)
  }, [])

  useEffect(() => {
    if (!projectId) {
      setPrintData(null)
      return
    }

    const project = projects.find((p) => p.id === projectId)

    if (project) {
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

      const clientObj = project.cliente_ref
        ? clients.find((c) => c.id === project.cliente_ref)
        : null

      setPrintData({
        referenceCode: project.cod_referencia || '',
        client: clientObj?.razao_social || clientObj?.nome || project.cliente || '',
        clientCnpj: clientObj?.cnpj,
        clientAddress: clientObj?.endereco,
        clientContact: clientObj?.contato,
        email: clientObj?.email,
        phone: clientObj?.telefone,
        value: project.valor_total,
        entryDate: project.data_entrada ? new Date(project.data_entrada) : undefined,
        deadline: project.data_entrega ? new Date(project.data_entrega) : undefined,
        serviceType: project.tipo_servico,
        sourceLang: project.idioma_origem,
        targetLang: project.idioma_destino,
        services,
        observations: project.observacoes,
        items:
          project.expand?.['ItensProjeto_via_projeto'] ||
          project.expand?.['ItensProjeto(projeto)'] ||
          [],
        paymentMethod: project.forma_pagamento,
      })
      return
    }

    const fetchOrcamento = async () => {
      try {
        const orcamento = await pb.collection('orcamentos').getOne(projectId, {
          expand: 'orcamento_itens(orcamento_id)',
        })

        setPrintData({
          referenceCode: orcamento.cod_referencia || '',
          client: orcamento.cliente_nome || '',
          email: orcamento.cliente_email || '',
          phone: orcamento.cliente_telefone || '',
          value: 0,
          entryDate: new Date(orcamento.created),
          items: orcamento.expand?.['orcamento_itens(orcamento_id)'] || [],
        })
      } catch (error) {
        console.error('Failed to load orcamento for PDF generation', error)
      }
    }

    fetchOrcamento()
  }, [projectId, projects])

  return {
    projectId,
    printData,
    handlePrintRequest,
    closePrint,
  }
}
