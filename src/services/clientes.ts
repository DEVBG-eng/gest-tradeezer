import pb from '@/lib/pocketbase/client'

export interface ClienteRecord {
  id?: string
  nome: string
  cnpj?: string
  endereco?: string
  valor_lauda_padrao?: number
  valor_documento_padrao?: number
  idiomas_frequentes?: string
  observacoes?: string

  razao_social?: string
  prospeccao?: string
  forma_pagamento?: string
  valor_certidao_digital?: number
  valor_procuracao_digital?: number
  valor_certidao_fisica?: number
  valor_procuracao_fisica?: number
  valor_frete?: number
  ramo?: string
  contato?: string
  email?: string
  telefone?: string
  informacoes_frete?: string

  created?: string
  updated?: string
}

export const getClientes = () =>
  pb.collection('Clientes').getFullList<ClienteRecord>({ sort: 'nome' })
export const getCliente = (id: string) => pb.collection('Clientes').getOne<ClienteRecord>(id)
export const createCliente = (data: Partial<ClienteRecord>) =>
  pb.collection('Clientes').create<ClienteRecord>(data)
export const updateCliente = (id: string, data: Partial<ClienteRecord>) =>
  pb.collection('Clientes').update<ClienteRecord>(id, data)
export const deleteCliente = (id: string) => pb.collection('Clientes').delete(id)
