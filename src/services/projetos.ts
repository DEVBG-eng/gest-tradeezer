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
export const getProjeto = (id: string) =>
  pb.collection('Projetos').getOne<ProjetoRecord>(id, { expand: 'ItensProjeto_via_projeto' })
export const createProjeto = (data: Partial<ProjetoRecord>) =>
  pb.collection('Projetos').create<ProjetoRecord>(data)
export const updateProjeto = (id: string, data: Partial<ProjetoRecord>) =>
  pb.collection('Projetos').update<ProjetoRecord>(id, data)
export const deleteProjeto = (id: string) => pb.collection('Projetos').delete(id)

export const createItemProjeto = (data: Partial<ItemProjetoRecord>) =>
  pb.collection('ItensProjeto').create<ItemProjetoRecord>(data)
export const updateItemProjeto = (id: string, data: Partial<ItemProjetoRecord>) =>
  pb.collection('ItensProjeto').update<ItemProjetoRecord>(id, data)
export const deleteItemProjeto = (id: string) => pb.collection('ItensProjeto').delete(id)
