import pb from '@/lib/pocketbase/client'

export interface ProjetoRecord {
  id?: string
  cod_referencia: string
  cliente: string
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
  reconhecimento?: boolean
  frete?: boolean
  dhl?: boolean
  observacoes?: string
  created?: string
  updated?: string
}

export const getProjetos = () =>
  pb.collection('Projetos').getFullList<ProjetoRecord>({ sort: '-created' })
export const getProjeto = (id: string) => pb.collection('Projetos').getOne<ProjetoRecord>(id)
export const createProjeto = (data: Partial<ProjetoRecord>) =>
  pb.collection('Projetos').create<ProjetoRecord>(data)
export const updateProjeto = (id: string, data: Partial<ProjetoRecord>) =>
  pb.collection('Projetos').update<ProjetoRecord>(id, data)
export const deleteProjeto = (id: string) => pb.collection('Projetos').delete(id)
