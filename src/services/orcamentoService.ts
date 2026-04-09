import { toast } from 'sonner'
import * as htmlToImage from 'html-to-image'
import pb from '@/lib/pocketbase/client'

interface OrcamentoItem {
  id: string
  descricao: string
  quantidade: number
  valor_unitario: number
  subtotal: number
  created_at?: string
  created?: string
}

interface Orcamento {
  id: string
  cliente_nome: string
  cliente_email: string
  cliente_telefone: string
  cod_referencia?: string
  itens: OrcamentoItem[]
  created_at?: string
  created?: string
}

const deduplicateItems = (items: OrcamentoItem[]): OrcamentoItem[] => {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.descricao}|${item.quantidade}|${item.valor_unitario}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const sortItems = (items: OrcamentoItem[]): OrcamentoItem[] => {
  return [...items].sort((a, b) => {
    const dateA = a.created_at || a.created || ''
    const dateB = b.created_at || b.created || ''
    if (dateA && dateB) return new Date(dateA).getTime() - new Date(dateB).getTime()
    return a.id.localeCompare(b.id)
  })
}

const validateOrcamento = (orcamento: Orcamento): boolean => {
  if (!orcamento.id) {
    toast.error('Orçamento inválido: ID ausente')
    return false
  }
  if (!orcamento.cliente_nome || orcamento.cliente_nome.trim() === '') {
    toast.error('Orçamento inválido: Nome do cliente ausente')
    return false
  }
  if (!Array.isArray(orcamento.itens) || orcamento.itens.length === 0) {
    toast.error('Orçamento inválido: Nenhum item adicionado')
    return false
  }
  const validItems = orcamento.itens.every(
    (item) =>
      item.descricao && item.quantidade > 0 && item.valor_unitario >= 0 && item.subtotal >= 0,
  )
  if (!validItems) {
    toast.error('Orçamento inválido: Alguns itens têm dados incompletos')
    return false
  }
  return true
}

const calculateTotals = (items: OrcamentoItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const impostos = subtotal * 0.15
  const total = subtotal + impostos
  return {
    subtotal: subtotal.toFixed(2),
    impostos: impostos.toFixed(2),
    total: total.toFixed(2),
  }
}

const handleGenerateJPG = async (orcamento: Orcamento, elementId = 'orcamento-preview') => {
  try {
    if (!validateOrcamento(orcamento)) return

    const element = document.getElementById(elementId)
    if (!element) {
      toast.error('Visualização do orçamento não encontrada na tela. Abra o modal de geração.')
      return
    }

    const toastId = toast.loading('Gerando imagem do orçamento...')

    const dataUrl = await htmlToImage.toJpeg(element, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    })

    const link = document.createElement('a')
    link.download = `Orcamento_${orcamento.id}.jpg`
    link.href = dataUrl
    link.click()

    toast.dismiss(toastId)
    toast.success('JPG gerado com sucesso!')
  } catch (error) {
    console.error('Erro ao gerar JPG:', error)
    toast.error('Erro ao gerar imagem. Tente novamente.')
  }
}

const handleGeneratePDF = handleGenerateJPG // Alias para compatibilidade

const handleSendEmail = async (orcamento: Orcamento) => {
  try {
    if (!validateOrcamento(orcamento)) return
    if (!orcamento.cliente_email || !orcamento.cliente_email.includes('@')) {
      toast.error('Email do cliente inválido')
      return
    }

    const dedupedItems = deduplicateItems(orcamento.itens)
    const sortedItems = sortItems(dedupedItems)
    const totals = calculateTotals(sortedItems)

    const emailData = {
      cliente_email: orcamento.cliente_email,
      cliente_nome: orcamento.cliente_nome,
      orcamento_id: orcamento.id,
      itens: sortedItems,
      subtotal: totals.subtotal,
      impostos: totals.impostos,
      total: totals.total,
    }

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    toast.success('Email enviado com sucesso para o cliente!')
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    toast.error('Erro ao enviar email. Verifique a conexão.')
  }
}

const getOrcamentosByUser = async (userId: string, search: string = '') => {
  let filter = `user_id = "${userId}"`
  if (search) {
    filter += ` && (cliente_nome ~ "${search}" || id ~ "${search}")`
  }
  const records = await pb.collection('orcamentos').getFullList({
    filter,
    sort: '-created',
  })
  return records as unknown as Orcamento[]
}

const getOrcamentoById = async (id: string) => {
  return (await pb.collection('orcamentos').getOne(id)) as unknown as Orcamento
}

const createOrcamento = async (data: Partial<Orcamento>) => {
  return (await pb.collection('orcamentos').create(data)) as unknown as Orcamento
}

const createItem = async (data: Partial<OrcamentoItem>) => {
  return (await pb.collection('orcamento_itens').create(data)) as unknown as OrcamentoItem
}

const deleteItem = async (itemId: string) => {
  return await pb.collection('orcamento_itens').delete(itemId)
}

const getLatestOrcamentoByUser = async (userId: string) => {
  try {
    const record = await pb.collection('orcamentos').getFirstListItem(`user_id = "${userId}"`, {
      sort: '-created',
    })
    return record as unknown as Orcamento
  } catch (error: any) {
    if (error.status === 404) return null
    throw error
  }
}

const getItemsByOrcamento = async (orcamentoId: string) => {
  try {
    const records = await pb.collection('orcamento_itens').getFullList({
      filter: `orcamento_id = "${orcamentoId}"`,
      sort: 'created',
    })
    return records as unknown as OrcamentoItem[]
  } catch (error: any) {
    return []
  }
}

export const orcamentoService = {
  getOrcamentosByUser,
  getOrcamentoById,
  createOrcamento,
  createItem,
  deleteItem,
  getLatestOrcamentoByUser,
  getItemsByOrcamento,
  handleGenerateJPG,
  handleGeneratePDF,
  handleSendEmail,
  deduplicateItems,
  sortItems,
  validateOrcamento,
  calculateTotals,
}

export {
  getOrcamentosByUser,
  getOrcamentoById,
  createOrcamento,
  createItem,
  deleteItem,
  getLatestOrcamentoByUser,
  getItemsByOrcamento,
  handleGenerateJPG,
  handleGeneratePDF,
  handleSendEmail,
  deduplicateItems,
  sortItems,
  validateOrcamento,
  calculateTotals,
}
