import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import {
  ProjetoRecord,
  getProjetos,
  createProjeto,
  updateProjeto,
  deleteProjeto,
  createItemProjeto,
  updateItemProjeto,
  deleteItemProjeto,
} from '@/services/projetos'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { useAuth } from '@/hooks/use-auth'

export type ProjectStatus =
  | 'Orçamento'
  | 'Aprovado'
  | 'Aguardando'
  | 'Em Andamento'
  | 'Em Revisão'
  | 'Cartório'
  | 'Concluído'
  | 'Entregue'
  | 'Atrasado/Bloqueado'
  | 'Cancelado'
  | 'Não Aprovado'

export const ALL_STATUSES: ProjectStatus[] = [
  'Orçamento',
  'Aprovado',
  'Aguardando',
  'Em Andamento',
  'Em Revisão',
  'Cartório',
  'Concluído',
  'Entregue',
  'Atrasado/Bloqueado',
  'Cancelado',
  'Não Aprovado',
]

export interface CloudFile {
  id: string
  name: string
  status: 'uploading' | 'synced' | 'error'
  url: string
  size: number
}

export interface ProjectItem {
  id?: string
  description: string
  laudas: number
  valorLauda: number
  total: number
}

export interface Project {
  pbId: string
  id: string
  title: string
  client: string
  clientRef?: string
  status: ProjectStatus
  urgent: boolean
  international: boolean
  physicalCopy: boolean
  digitalCopy?: boolean
  entryDate?: string
  dueDate: string
  laudas: number
  valorLauda: number
  value: number
  documents: number
  cloudProvider?: string | null
  cloudFolderUrl?: string
  files?: CloudFile[]
  sourceLang?: string
  targetLang?: string
  documentType?: string
  observations?: string
  hagueApostille?: boolean
  digitalApostille?: boolean
  physicalApostille?: boolean
  notarization?: boolean
  digitalAuthentication?: boolean
  shipping?: boolean
  internationalShipping?: boolean
  freteJk?: boolean
  translationType?: string
  paymentMethod?: string
  items?: ProjectItem[]
  created?: string
  updated?: string
}

interface ProjectStoreContext {
  projects: Project[]
  loading: boolean
  addProject: (project: Omit<Project, 'pbId'>) => Promise<void>
  updateProjectStatus: (id: string, status: ProjectStatus) => Promise<void>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
}

const StoreContext = createContext<ProjectStoreContext | null>(null)

const mapToProject = (record: ProjetoRecord): Project => ({
  pbId: record.id as string,
  id: record.cod_referencia,
  title: `Ordem de Serviço ${record.cod_referencia}`,
  client: record.cliente,
  clientRef: record.cliente_ref,
  status: (record.status as ProjectStatus) || 'Orçamento',
  urgent: record.urgente || false,
  international: record.internacional || false,
  physicalCopy: record.fisico || false,
  digitalCopy: record.digital || false,
  entryDate: record.data_entrada,
  dueDate: record.data_entrega || '',
  laudas: record.qtd_laudas || 0,
  valorLauda: record.valor_lauda || 0,
  value: record.valor_total || 0,
  documents: record.qtd_documentos || 1,
  sourceLang: record.idioma_origem,
  targetLang: record.idioma_destino,
  documentType: record.tipo_documento,
  translationType: record.tipo_servico,
  observations: record.observacoes,
  hagueApostille: record.apostilamento,
  digitalApostille: record.apostilamento_digital,
  physicalApostille: record.apostilamento_fisico,
  notarization: record.reconhecimento,
  digitalAuthentication: record.autenticacao_digital,
  shipping: record.frete,
  internationalShipping: record.dhl,
  freteJk: record.frete_jk,
  paymentMethod: record.forma_pagamento,
  items: (record.expand?.ItensProjeto_via_projeto || []).map((i) => ({
    id: i.id as string,
    description: i.descricao,
    laudas: i.qtd_laudas,
    valorLauda: i.valor_lauda,
    total: i.valor_total,
  })),
  created: record.created,
  updated: record.updated,
})

const mapToPB = (project: Partial<Project>): Partial<ProjetoRecord> => {
  const data: Partial<ProjetoRecord> = {}
  if (project.id !== undefined) data.cod_referencia = project.id
  if (project.client !== undefined) data.cliente = project.client
  if (project.clientRef !== undefined) data.cliente_ref = project.clientRef
  if (project.status !== undefined) data.status = project.status
  if (project.urgent !== undefined) data.urgente = project.urgent
  if (project.international !== undefined) data.internacional = project.international
  if (project.physicalCopy !== undefined) data.fisico = project.physicalCopy
  if (project.digitalCopy !== undefined) data.digital = project.digitalCopy
  if (project.entryDate !== undefined)
    data.data_entrada = project.entryDate ? new Date(project.entryDate).toISOString() : undefined
  if (project.dueDate !== undefined)
    data.data_entrega = project.dueDate ? new Date(project.dueDate).toISOString() : undefined
  if (project.laudas !== undefined) data.qtd_laudas = project.laudas
  if (project.valorLauda !== undefined) data.valor_lauda = project.valorLauda
  if (project.value !== undefined) data.valor_total = project.value
  if (project.documents !== undefined) data.qtd_documentos = project.documents
  if (project.sourceLang !== undefined) data.idioma_origem = project.sourceLang
  if (project.targetLang !== undefined) data.idioma_destino = project.targetLang
  if (project.documentType !== undefined) data.tipo_documento = project.documentType
  if (project.translationType !== undefined) data.tipo_servico = project.translationType
  if (project.observations !== undefined) data.observacoes = project.observations
  if (project.hagueApostille !== undefined) data.apostilamento = project.hagueApostille
  if (project.digitalApostille !== undefined) data.apostilamento_digital = project.digitalApostille
  if (project.physicalApostille !== undefined) data.apostilamento_fisico = project.physicalApostille
  if (project.notarization !== undefined) data.reconhecimento = project.notarization
  if (project.digitalAuthentication !== undefined)
    data.autenticacao_digital = project.digitalAuthentication
  if (project.shipping !== undefined) data.frete = project.shipping
  if (project.internationalShipping !== undefined) data.dhl = project.internationalShipping
  if (project.freteJk !== undefined) data.frete_jk = project.freteJk
  if (project.paymentMethod !== undefined) data.forma_pagamento = project.paymentMethod
  return data
}

const STATUS_PRIORITY: Record<string, number> = {
  Aprovado: 1,
  Aguardando: 2,
  'Em Andamento': 3,
  Concluído: 4,
  Orçamento: 5,
  'Em Revisão': 6,
  Cartório: 7,
  Entregue: 8,
  'Atrasado/Bloqueado': 9,
  Cancelado: 10,
  'Não Aprovado': 11,
}

export const ProjectStoreProvider = ({ children }: { children: ReactNode }) => {
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  const projects = React.useMemo(() => {
    let result = allProjects
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase()
      result = allProjects.filter(
        (p) =>
          (p.client && p.client.toLowerCase().includes(lowerQ)) ||
          (p.id && p.id.toLowerCase().includes(lowerQ)) ||
          (p.translationType && p.translationType.toLowerCase().includes(lowerQ)),
      )
    }

    return [...result].sort((a, b) => {
      const pA = STATUS_PRIORITY[a.status] || 99
      const pB = STATUS_PRIORITY[b.status] || 99
      if (pA !== pB) return pA - pB

      const refA = a.id || ''
      const refB = b.id || ''
      return refA.localeCompare(refB)
    })
  }, [allProjects, searchQuery])

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const records = await getProjetos()
      setAllProjects(records.map((r) => mapToProject(r)))
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
    'Projetos',
    () => {
      loadData()
    },
    !!user,
  )
  useRealtime(
    'ItensProjeto',
    () => {
      loadData()
    },
    !!user,
  )

  const getPbId = (id: string) => allProjects.find((p) => p.id === id)?.pbId

  const addProject = async (project: Omit<Project, 'pbId'>) => {
    try {
      const created = await createProjeto(mapToPB(project))
      if (project.items && project.items.length > 0) {
        await Promise.all(
          project.items.map((item) =>
            createItemProjeto({
              projeto: created.id,
              descricao: item.description,
              qtd_laudas: item.laudas,
              valor_lauda: item.valorLauda,
              valor_total: item.total,
            }),
          ),
        )
      }
    } catch (e: any) {
      const errors = extractFieldErrors(e)
      const errMsg = String(e?.message || e?.response?.message || '')
      const isUniqueError =
        errors.cod_referencia ||
        e?.response?.data?.cod_referencia?.code === 'validation_not_unique' ||
        errMsg.includes('idx_cod_referencia_unique') ||
        errMsg.includes('UNIQUE constraint failed')

      if (isUniqueError) {
        toast({
          title: 'Erro de Validação',
          description: 'O código de referência já está em uso. Por favor, utilize um código único.',
          variant: 'destructive',
        })
        throw new Error('Cód. Referência duplicado')
      }
      toast({ title: 'Erro', description: 'Falha ao salvar projeto.', variant: 'destructive' })
      throw e
    }
  }

  const updateProjectStatus = async (id: string, status: ProjectStatus) => {
    const pbId = getPbId(id)
    if (!pbId) return
    setAllProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
    try {
      await updateProjeto(pbId, { status })
    } catch (e) {
      loadData()
      toast({ title: 'Erro', description: 'Falha ao atualizar status', variant: 'destructive' })
      throw e
    }
  }

  const updateProject = async (id: string, data: Partial<Project>) => {
    const pbId = getPbId(id)
    if (!pbId) return
    try {
      await updateProjeto(pbId, mapToPB(data))

      if (data.items) {
        const currentProject = allProjects.find((p) => p.id === id)
        const currentIds = (currentProject?.items || [])
          .map((i) => i.id)
          .filter(Boolean) as string[]
        const newIds = data.items.map((i) => i.id).filter(Boolean) as string[]

        const toDelete = currentIds.filter((cid) => !newIds.includes(cid))

        await Promise.all(toDelete.map((delId) => deleteItemProjeto(delId)))

        await Promise.all(
          data.items.map((item) => {
            if (item.id) {
              return updateItemProjeto(item.id, {
                descricao: item.description,
                qtd_laudas: item.laudas,
                valor_lauda: item.valorLauda,
                valor_total: item.total,
              })
            } else {
              return createItemProjeto({
                projeto: pbId,
                descricao: item.description,
                qtd_laudas: item.laudas,
                valor_lauda: item.valorLauda,
                valor_total: item.total,
              })
            }
          }),
        )
      }
    } catch (e: any) {
      const errors = extractFieldErrors(e)
      const errMsg = String(e?.message || e?.response?.message || '')
      const isUniqueError =
        errors.cod_referencia ||
        e?.response?.data?.cod_referencia?.code === 'validation_not_unique' ||
        errMsg.includes('idx_cod_referencia_unique') ||
        errMsg.includes('UNIQUE constraint failed')

      if (isUniqueError) {
        toast({
          title: 'Erro de Validação',
          description: 'O código de referência já está em uso. Por favor, utilize um código único.',
          variant: 'destructive',
        })
        throw new Error('Cód. Referência duplicado')
      }
      loadData()
      toast({ title: 'Erro', description: 'Falha ao atualizar projeto', variant: 'destructive' })
      throw e
    }
  }

  const deleteProject = async (id: string) => {
    const pbId = getPbId(id)
    if (!pbId) return
    setAllProjects((prev) => prev.filter((p) => p.id !== id))
    try {
      await deleteProjeto(pbId)
    } catch (e) {
      loadData()
      toast({ title: 'Erro', description: 'Falha ao excluir projeto', variant: 'destructive' })
      throw e
    }
  }

  return (
    <StoreContext.Provider
      value={{
        projects,
        loading,
        addProject,
        updateProjectStatus,
        updateProject,
        deleteProject,
        setSearchQuery,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export default function useProjectStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useProjectStore must be used within ProjectStoreProvider')
  return ctx
}
