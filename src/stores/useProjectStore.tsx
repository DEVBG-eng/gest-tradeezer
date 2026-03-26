import React, { createContext, useContext, useState, ReactNode } from 'react'

export type ProjectStatus =
  | 'Aguardando'
  | 'Em Andamento'
  | 'Em Revisão'
  | 'Cartório'
  | 'Concluído'
  | 'Atrasado/Bloqueado'

export const ALL_STATUSES: ProjectStatus[] = [
  'Aguardando',
  'Em Andamento',
  'Em Revisão',
  'Cartório',
  'Concluído',
  'Atrasado/Bloqueado',
]

export interface CloudFile {
  id: string
  name: string
  status: 'uploading' | 'synced' | 'error'
  url: string
  size: number
}

export interface Project {
  id: string
  title: string
  client: string
  status: ProjectStatus
  urgent: boolean
  international: boolean
  physicalCopy: boolean
  digitalCopy?: boolean
  entryDate?: string
  dueDate: string
  laudas: number
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
  notarization?: boolean
  shipping?: boolean
  internationalShipping?: boolean
  translationType?: string
}

interface ProjectStoreContext {
  projects: Project[]
  addProject: (project: Omit<Project, 'id'>) => void
  updateProjectStatus: (id: string, status: ProjectStatus) => void
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void
}

const StoreContext = createContext<ProjectStoreContext | null>(null)

export const ProjectStoreProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'PRJ-1001',
      title: 'Contrato Social - TechCorp',
      client: 'TechCorp Brasil',
      status: 'Aguardando',
      urgent: true,
      international: false,
      physicalCopy: false,
      digitalCopy: true,
      entryDate: '2023-11-01',
      dueDate: '2023-11-10',
      laudas: 15.5,
      value: 0,
      documents: 2,
      sourceLang: 'pt',
      targetLang: 'en',
      documentType: 'Contrato Social',
      translationType: 'Tradução Juramentada',
      observations: 'Prioridade alta para envio.',
      hagueApostille: false,
      notarization: true,
      shipping: false,
      internationalShipping: false,
    },
    {
      id: 'PRJ-1002',
      title: 'Procuração Pública (Apostila)',
      client: 'Maria Silva',
      status: 'Em Revisão',
      urgent: false,
      international: true,
      physicalCopy: true,
      digitalCopy: true,
      entryDate: '2023-11-02',
      dueDate: '2023-11-15',
      laudas: 3.0,
      value: 450,
      documents: 1,
      sourceLang: 'pt',
      targetLang: 'es',
      documentType: 'Procuração Pública',
      translationType: 'Tradução Juramentada',
      hagueApostille: true,
      notarization: true,
      shipping: true,
      internationalShipping: true,
    },
    {
      id: 'PRJ-1003',
      title: 'Manuais Técnicos de Maquinário',
      client: 'Industria XPTO',
      status: 'Em Andamento',
      urgent: false,
      international: true,
      physicalCopy: false,
      digitalCopy: true,
      entryDate: '2023-11-03',
      dueDate: '2023-11-20',
      laudas: 120.0,
      value: 8400,
      documents: 5,
      sourceLang: 'de',
      targetLang: 'pt',
      documentType: 'Manual Técnico',
      translationType: 'Tradução Técnica',
      hagueApostille: false,
      notarization: false,
      shipping: false,
      internationalShipping: false,
      observations: 'Glossário técnico específico fornecido pelo cliente.',
    },
    {
      id: 'PRJ-1004',
      title: 'Certidão de Casamento',
      client: 'João Souza',
      status: 'Cartório',
      urgent: true,
      international: true,
      physicalCopy: true,
      digitalCopy: false,
      entryDate: '2023-11-01',
      dueDate: '2023-11-05',
      laudas: 1.0,
      value: 300,
      documents: 1,
      sourceLang: 'pt',
      targetLang: 'it',
      documentType: 'Certidão',
      translationType: 'Tradução Juramentada',
      hagueApostille: true,
      notarization: false,
      shipping: true,
      internationalShipping: true,
    },
    {
      id: 'PRJ-1005',
      title: 'Estatuto da Empresa',
      client: 'Global Invest',
      status: 'Concluído',
      urgent: false,
      international: false,
      physicalCopy: false,
      digitalCopy: true,
      entryDate: '2023-11-04',
      dueDate: '2023-11-12',
      laudas: 45.0,
      value: 0,
      documents: 1,
      sourceLang: 'en',
      targetLang: 'pt',
      documentType: 'Estatuto',
      translationType: 'Tradução Juramentada',
      hagueApostille: false,
      notarization: false,
      shipping: false,
      internationalShipping: false,
    },
  ])

  const addProject = (project: Omit<Project, 'id'>) => {
    const newId = `PRJ-${1000 + projects.length + 1}`
    setProjects((prev) => [{ ...project, id: newId }, ...prev])
  }

  const updateProjectStatus = (id: string, status: ProjectStatus) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <StoreContext.Provider
      value={{ projects, addProject, updateProjectStatus, updateProject, deleteProject }}
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
