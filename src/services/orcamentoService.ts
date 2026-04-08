// ============================================
// SERVIÇO DE ORÇAMENTO (SEM TRAVAMENTOS)
// ============================================

import { toast } from 'sonner'

interface OrcamentoItem {
  id: string
  descricao: string
  quantidade: number
  valor_unitario: number
  subtotal: number
  created_at: string
}

interface Orcamento {
  id: string
  cliente_nome: string
  cliente_email: string
  cliente_telefone: string
  itens: OrcamentoItem[]
  created_at: string
}

// ============================================
// 1. DEDUPLICAÇÃO (Remove itens duplicados)
// ============================================
const deduplicateItems = (items: OrcamentoItem[]): OrcamentoItem[] => {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.descricao}|${item.quantidade}|${item.valor_unitario}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ============================================
// 2. ORDENAÇÃO (Ordena por data de criação)
// ============================================
const sortItems = (items: OrcamentoItem[]): OrcamentoItem[] => {
  return [...items].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
}

// ============================================
// 3. VALIDAÇÃO (Verifica integridade dos dados)
// ============================================
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
    (item) => item.descricao && item.quantidade > 0 && item.valor_unitario > 0 && item.subtotal > 0,
  )

  if (!validItems) {
    toast.error('Orçamento inválido: Alguns itens têm dados incompletos')
    return false
  }

  return true
}

// ============================================
// 4. CÁLCULO DE TOTAIS (Sem loops infinitos)
// ============================================
const calculateTotals = (items: OrcamentoItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const impostos = subtotal * 0.15 // 15% de impostos (ajuste conforme necessário)
  const total = subtotal + impostos

  return {
    subtotal: subtotal.toFixed(2),
    impostos: impostos.toFixed(2),
    total: total.toFixed(2),
  }
}

// ============================================
// 5. GERAÇÃO DE PDF (Sem travamentos)
// ============================================
const handleGeneratePDF = async (orcamento: Orcamento) => {
  try {
    // PASSO 1: Validar dados
    if (!validateOrcamento(orcamento)) {
      return
    }

    // PASSO 2: Deduplica itens
    const dedupedItems = deduplicateItems(orcamento.itens)

    // PASSO 3: Ordena itens
    const sortedItems = sortItems(dedupedItems)

    // PASSO 4: Calcula totais
    const totals = calculateTotals(sortedItems)

    // PASSO 5: Prepara dados para PDF
    const pdfData = {
      orcamento_id: orcamento.id,
      cliente_nome: orcamento.cliente_nome,
      cliente_email: orcamento.cliente_email,
      cliente_telefone: orcamento.cliente_telefone,
      itens: sortedItems,
      subtotal: totals.subtotal,
      impostos: totals.impostos,
      total: totals.total,
      data_geracao: new Date().toLocaleDateString('pt-BR'),
    }

    // PASSO 6: Chama Edge Function para gerar PDF
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pdfData),
    })

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const { pdf_url } = await response.json()

    // PASSO 7: Download do PDF
    const link = document.createElement('a')
    link.href = pdf_url
    link.download = `orcamento_${orcamento.id}.pdf`
    link.click()

    toast.success('PDF gerado com sucesso!')
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    toast.error('Erro ao gerar PDF. Tente novamente.')
  }
}

// ============================================
// 6. ENVIO DE EMAIL (Sem travamentos)
// ============================================
const handleSendEmail = async (orcamento: Orcamento) => {
  try {
    // PASSO 1: Validar dados
    if (!validateOrcamento(orcamento)) {
      return
    }

    // PASSO 2: Verificar email
    if (!orcamento.cliente_email || !orcamento.cliente_email.includes('@')) {
      toast.error('Email do cliente inválido')
      return
    }

    // PASSO 3: Deduplica e ordena itens
    const dedupedItems = deduplicateItems(orcamento.itens)
    const sortedItems = sortItems(dedupedItems)
    const totals = calculateTotals(sortedItems)

    // PASSO 4: Prepara dados para email
    const emailData = {
      cliente_email: orcamento.cliente_email,
      cliente_nome: orcamento.cliente_nome,
      orcamento_id: orcamento.id,
      itens: sortedItems,
      subtotal: totals.subtotal,
      impostos: totals.impostos,
      total: totals.total,
    }

    // PASSO 5: Chama Edge Function para enviar email
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

// ============================================
// 7. EXPORTAR FUNÇÕES
// ============================================
export {
  handleGeneratePDF,
  handleSendEmail,
  deduplicateItems,
  sortItems,
  validateOrcamento,
  calculateTotals,
}
