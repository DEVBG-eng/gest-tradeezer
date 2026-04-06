import pb from '@/lib/pocketbase/client'

export interface ItemProjetoRecord {
  id?: string
  projeto: string
  descricao: string
  qtd_laudas: number
  valor_lauda: number
  valor_total: number
  created?: string
  updated?: string
}

export interface ProjetoRecord {
  id?: string
  cod_referencia: string
  cliente: string
  cliente_ref?: string
  status: string
  qtd_laudas?: number
  valor_lauda?: number
  valor_total?: number
  data_entrega?: string
  data_entrada?: string
  tipo_servico?: string
  idioma_origem?: string
  idioma_destino?: string
  tipo_documento?: string
  qtd_documentos?: number
  urgente?: boolean
  internacional?: boolean
  fisico?: boolean
  digital?: boolean
  apostilamento?: boolean
  apostilamento_digital?: boolean
  apostilamento_fisico?: boolean
  reconhecimento?: boolean
  autenticacao_digital?: boolean
  frete?: boolean
  dhl?: boolean
  frete_jk?: boolean
  observacoes?: string
  pasta_url?: string
  created?: string
  updated?: string
  expand?: {
    ItensProjeto_via_projeto?: ItemProjetoRecord[]
  }
}

export const getProjetos = () =>
  pb
    .collection('Projetos')
    .getFullList<ProjetoRecord>({ sort: '-created', expand: 'ItensProjeto_via_projeto' })

export const getNextProjectReference = async (): Promise<string> => {
  try {
    const result = await pb.collection('Projetos').getFullList<{ cod_referencia: string }>({
      filter: 'cod_referencia ~ "TRD-"',
      fields: 'cod_referencia',
    })

    let maxNum = 7412
    for (const item of result) {
      const match = item.cod_referencia.match(/TRD-(\d+)/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (!isNaN(num) && num > maxNum) {
          maxNum = num
        }
      }
    }

    return `TRD-${maxNum + 1}`
  } catch (e) {
    return 'TRD-7413'
  }
}
export const getProjeto = (id: string) =>
  pb.collection('Projetos').getOne<ProjetoRecord>(id, { expand: 'ItensProjeto_via_projeto' })
export const createProjeto = (data: Partial<ProjetoRecord>) =>
  pb.collection('Projetos').create<ProjetoRecord>(data)
export const updateProjeto = (id: string, data: Partial<ProjetoRecord>) =>
  pb.collection('Projetos').update<ProjetoRecord>(id, data)
export const deleteProjeto = (id: string) => pb.collection('Projetos').delete(id)

export interface CustoProjetoRecord {
  id?: string
  projeto: string
  freelancer: string
  custo_documento?: number
  custo_laudas?: number
  custo_frete?: number
  custo_envio_cartorio?: number
  custo_cartorio?: number
  custo_apostilamento?: number
  custo_reconhecimento?: number
  custo_envio_cliente?: number
  imposto?: number
  custo_assinatura_tradutor?: number
  custo_link_cartao?: number
  comissao_venda?: number
  comissao_secundaria?: number
  custo_revisao?: number
  custo_diagramacao?: number
  emissao_certidao?: number
  observacoes_extras?: string
  custo_portador?: number
  custo_copia_autenticada?: number
  autenticacao_digital?: number
  percentual_custo_operacional?: number
  created?: string
  updated?: string
  expand?: {
    projeto?: ProjetoRecord
  }
}

export const getCustosProjeto = () =>
  pb
    .collection('CustosProjeto')
    .getFullList<CustoProjetoRecord>({ sort: '-created', expand: 'projeto' })
export const getCustoProjetoByProjeto = async (projetoId: string) => {
  try {
    return await pb
      .collection('CustosProjeto')
      .getFirstListItem<CustoProjetoRecord>(`projeto="${projetoId}"`)
  } catch (e) {
    return null
  }
}
export const createCustoProjeto = (data: Partial<CustoProjetoRecord>) =>
  pb.collection('CustosProjeto').create<CustoProjetoRecord>(data)
export const updateCustoProjeto = (id: string, data: Partial<CustoProjetoRecord>) =>
  pb.collection('CustosProjeto').update<CustoProjetoRecord>(id, data)

export const createItemProjeto = (data: Partial<ItemProjetoRecord>) =>
  pb.collection('ItensProjeto').create<ItemProjetoRecord>(data)
export const updateItemProjeto = (id: string, data: Partial<ItemProjetoRecord>) =>
  pb.collection('ItensProjeto').update<ItemProjetoRecord>(id, data)
export const deleteItemProjeto = (id: string) => pb.collection('ItensProjeto').delete(id)
