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
  getProjetosPaginated,
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
  translationType?: string
  items?: ProjectItem[]
}

interface ProjectStoreContext {
  projects: Project[]
  loading: boolean
  totalPages: number
  currentPage: number
  totalItems: number
  fetchProjects: (page: number, filters: { statuses: string[]; shipping: boolean }) => Promise<void>
  addProject: (project: Omit<Project, 'pbId'>) => Promise<void>
  updateProjectStatus: (id: string, status: ProjectStatus) => Promise<void>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
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
  items: (record.expand?.ItensProjeto_via_projeto || []).map((i) => ({
    id: i.id as string,
    description: i.descricao,
    laudas: i.qtd_laudas,
    valorLauda: i.valor_lauda,
    total: i.valor_total,
  })),
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
  return data
}

export const ProjectStoreProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const fetchParams = useRef({ page: 1, filters: { statuses: [] as string[], shipping: false } })

  const { toast } = useToast()
  const { user } = useAuth()

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { page, filters } = fetchParams.current
      const filterParts = []
      if (filters.statuses.length > 0) {
        const statusFilter = filters.statuses.map((s) => `status="${s}"`).join(' || ')
        filterParts.push(`(${statusFilter})`)
      }
      if (filters.shipping) {
        filterParts.push(`(frete=true || dhl=true)`)
      }
      const filterStr = filterParts.join(' && ')

      const result = await getProjetosPaginated(page, 10, filterStr)
      setProjects(result.items.map((r) => mapToProject(r)))
      setTotalPages(result.totalPages)
      setCurrentPage(result.page)
      setTotalItems(result.totalItems)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchProjects = useCallback(
    async (page: number, filters: { statuses: string[]; shipping: boolean }) => {
      fetchParams.current = { page, filters }
      await loadData()
    },
    [loadData],
  )

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

  const getPbId = (id: string) => projects.find((p) => p.id === id)?.pbId

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
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
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
        const currentProject = projects.find((p) => p.id === id)
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
    setProjects((prev) => prev.filter((p) => p.id !== id))
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
        totalPages,
        currentPage,
        totalItems,
        fetchProjects,
        addProject,
        updateProjectStatus,
        updateProject,
        deleteProject,
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
