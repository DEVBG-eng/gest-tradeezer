import pb from '@/lib/pocketbase/client'

export interface ProjectHistory {
  id: string
  projeto: string
  usuario: string
  acao: string
  detalhes?: string
  created: string
  expand?: {
    usuario?: {
      id: string
      name: string
      avatar: string
    }
  }
}

export const getProjectHistory = (projectId: string) => {
  return pb.collection('HistoricoAtividade').getFullList<ProjectHistory>({
    filter: `projeto = '${projectId}'`,
    sort: '-created',
    expand: 'usuario',
  })
}
