import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import {
  NotificacaoRecord,
  getNotificacoes,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} from '@/services/notificacoes'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'

interface NotificationStoreContext {
  notifications: NotificacaoRecord[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearAll: () => Promise<void>
}

const StoreContext = createContext<NotificationStoreContext | null>(null)

export const NotificationStoreProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificacaoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const records = await getNotificacoes()
      setNotifications(records)
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
    'Notificacoes',
    () => {
      loadData()
    },
    !!user,
  )

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
    try {
      await markAsRead(id)
    } catch (e) {
      loadData()
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })))
    try {
      await markAllAsRead(user.id)
    } catch (e) {
      loadData()
    }
  }

  const handleClearAll = async () => {
    if (!user) return
    setNotifications([])
    try {
      await clearAllNotifications(user.id)
    } catch (e) {
      loadData()
    }
  }

  const unreadCount = notifications.filter((n) => !n.lida).length

  return (
    <StoreContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        clearAll: handleClearAll,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export default function useNotificationStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useNotificationStore must be used within NotificationStoreProvider')
  return ctx
}
