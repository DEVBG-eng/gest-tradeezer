import pb from '@/lib/pocketbase/client'

export interface CreateOrcamentoDto {
  user_id: string
  cliente_nome: string
  cliente_email: string
  cliente_telefone?: string
}

export interface CreateOrcamentoItemDto {
  orcamento_id: string
  descricao: string
  quantidade: number
  valor_unitario: number
  subtotal: number
}

export const orcamentoService = {
  getLatestOrcamentoByUser: async (userId: string) => {
    const result = await pb.collection('orcamentos').getFullList({
      filter: `user_id = "${userId}"`,
      sort: '-created',
      limit: 1,
    })
    return result[0] || null
  },

  createOrcamento: async (data: CreateOrcamentoDto) => {
    return await pb.collection('orcamentos').create(data)
  },

  deleteOrcamento: async (id: string) => {
    return await pb.collection('orcamentos').delete(id)
  },

  getItemsByOrcamento: async (orcamentoId: string) => {
    return await pb.collection('orcamento_itens').getFullList({
      filter: `orcamento_id = "${orcamentoId}"`,
      sort: 'created',
    })
  },

  createItem: async (data: CreateOrcamentoItemDto) => {
    return await pb.collection('orcamento_itens').create(data)
  },

  deleteItem: async (id: string) => {
    return await pb.collection('orcamento_itens').delete(id)
  },
}
