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
