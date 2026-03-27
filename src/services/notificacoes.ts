import pb from '@/lib/pocketbase/client'

export interface NotificacaoRecord {
  id: string
  usuario: string
  titulo: string
  mensagem: string
  tipo: 'entrega' | 'projeto_novo' | 'solicitacao' | 'sistema'
  lida: boolean
  projeto?: string
  created: string
  updated: string
}

export const getNotificacoes = () => {
  return pb.collection('Notificacoes').getFullList<NotificacaoRecord>({
    sort: '-created',
  })
}

export const markAsRead = (id: string) => {
  return pb.collection('Notificacoes').update(id, { lida: true })
}

export const markAllAsRead = async (userId: string) => {
  const unread = await pb.collection('Notificacoes').getFullList({
    filter: `usuario = "${userId}" && lida = false`,
  })
  return Promise.all(unread.map((n) => markAsRead(n.id)))
}

export const clearAllNotifications = async (userId: string) => {
  const all = await pb.collection('Notificacoes').getFullList({
    filter: `usuario = "${userId}"`,
  })
  return Promise.all(all.map((n) => pb.collection('Notificacoes').delete(n.id)))
}
