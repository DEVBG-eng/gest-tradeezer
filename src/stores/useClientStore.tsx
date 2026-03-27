import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import {
  ClienteRecord,
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from '@/services/clientes'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

interface ClientStoreContext {
  clients: ClienteRecord[]
  loading: boolean
  addClient: (client: Omit<ClienteRecord, 'id' | 'created' | 'updated'>) => Promise<void>
  updateClient: (id: string, data: Partial<ClienteRecord>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
}

const StoreContext = createContext<ClientStoreContext | null>(null)

export const ClientStoreProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<ClienteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const records = await getClientes()
      setClients(records)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime(
    'Clientes',
    () => {
      loadData()
    },
    !!user,
  )

  const addClient = async (client: Omit<ClienteRecord, 'id' | 'created' | 'updated'>) => {
    try {
      await createCliente(client)
      toast({ title: 'Sucesso', description: 'Cliente salvo com sucesso.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao salvar cliente.', variant: 'destructive' })
      throw e
    }
  }

  const updateClientItem = async (id: string, data: Partial<ClienteRecord>) => {
    try {
      await updateCliente(id, data)
      toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao atualizar cliente.', variant: 'destructive' })
      throw e
    }
  }

  const removeClient = async (id: string) => {
    try {
      await deleteCliente(id)
      toast({ title: 'Sucesso', description: 'Cliente excluído com sucesso.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao excluir cliente.', variant: 'destructive' })
      throw e
    }
  }

  return (
    <StoreContext.Provider
      value={{
        clients,
        loading,
        addClient,
        updateClient: updateClientItem,
        deleteClient: removeClient,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export default function useClientStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useClientStore must be used within ClientStoreProvider')
  return ctx
}
