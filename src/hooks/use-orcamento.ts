import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { orcamentoService } from '@/services/orcamentoService'

const orcamentoSchema = z
  .object({
    id: z.string(),
    user_id: z.string(),
    cliente_nome: z.string(),
    cliente_email: z.string().email(),
    cliente_telefone: z.string().optional().default(''),
    created: z.string(),
  })
  .passthrough()

const orcamentoItemSchema = z
  .object({
    id: z.string(),
    orcamento_id: z.string(),
    descricao: z.string(),
    quantidade: z.number(),
    valor_unitario: z.number(),
    subtotal: z.number(),
  })
  .passthrough()

export type Orcamento = z.infer<typeof orcamentoSchema>
export type OrcamentoItem = z.infer<typeof orcamentoItemSchema>

export function useOrcamentoData(id?: string) {
  const { user } = useAuth()
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [items, setItems] = useState<OrcamentoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(id === 'new')

  const loadData = useCallback(async () => {
    if (!user) {
      setOrcamento(null)
      setItems([])
      return
    }
    try {
      setError(null)
      let activeOrcamento: Orcamento | null = null

      if (id && id !== 'new') {
        activeOrcamento = await orcamentoService.getOrcamentoById(id)
      } else if (id === 'new') {
        activeOrcamento = null
      } else {
        activeOrcamento = await orcamentoService.getLatestOrcamentoByUser(user.id)
      }

      if (activeOrcamento) {
        const parsed = orcamentoSchema.parse(activeOrcamento)
        // Clear items while loading to avoid stale data leakage
        if (orcamento?.id !== parsed.id) setItems([])

        setOrcamento(parsed)
        setIsCreating(false)

        const fetchedItems = await orcamentoService.getItemsByOrcamento(parsed.id)
        const parsedItems = fetchedItems.map((i) => orcamentoItemSchema.parse(i))
        setItems(parsedItems)
      } else {
        setOrcamento(null)
        setItems([])
        setIsCreating(true)
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debouncedLoad = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      loadData()
    }, 300)
  }, [loadData])

  useRealtime('orcamentos', debouncedLoad, !!user)
  useRealtime('orcamento_itens', debouncedLoad, !!user && !!orcamento)

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0)
    const impostos = subtotal * 0.1 // Simulated 10% tax for demonstration
    const total = subtotal + impostos
    return { subtotal, impostos, total }
  }, [items])

  const startNewOrcamento = useCallback(() => {
    setOrcamento(null)
    setItems([])
    setIsCreating(true)
  }, [])

  return {
    orcamento,
    items,
    loading,
    error,
    totals,
    isCreating,
    setIsCreating,
    startNewOrcamento,
    loadData,
  }
}
