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
    try {
      const result = await pb.collection('orcamentos').getFullList({
        filter: `user_id = "${userId}"`,
        sort: '-created',
        limit: 1,
      })
      return result[0] || null
    } catch (error) {
      throw error
    }
  },

  createOrcamento: async (data: CreateOrcamentoDto) => {
    try {
      return await pb.collection('orcamentos').create(data)
    } catch (error) {
      throw error
    }
  },

  deleteOrcamento: async (id: string) => {
    try {
      return await pb.collection('orcamentos').delete(id)
    } catch (error) {
      throw error
    }
  },

  getItemsByOrcamento: async (orcamentoId: string) => {
    try {
      return await pb.collection('orcamento_itens').getFullList({
        filter: `orcamento_id = "${orcamentoId}"`,
        sort: 'created',
      })
    } catch (error) {
      throw error
    }
  },

  createItem: async (data: CreateOrcamentoItemDto) => {
    try {
      return await pb.collection('orcamento_itens').create(data)
    } catch (error) {
      throw error
    }
  },

  deleteItem: async (id: string) => {
    try {
      return await pb.collection('orcamento_itens').delete(id)
    } catch (error) {
      throw error
    }
  },
}
