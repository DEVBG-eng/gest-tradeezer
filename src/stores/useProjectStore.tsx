import React, { createContext, useContext, useState, ReactNode } from 'react'

export type ProjectStatus =
  | 'Triagem'
  | 'Orçamento'
  | 'Produção'
  | 'Cartório'
  | 'Logística'
  | 'Concluído'

export interface Project {
  id: string
  title: string
  client: string
  status: ProjectStatus
  urgent: boolean
  international: boolean
  physicalCopy: boolean
  dueDate: string
  laudas: number
  value: number
  documents: number
}

interface ProjectStoreContext {
  projects: Project[]
  addProject: (project: Omit<Project, 'id'>) => void
  updateProjectStatus: (id: string, status: ProjectStatus) => void
  updateProject: (id: string, data: Partial<Project>) => void
}

const StoreContext = createContext<ProjectStoreContext | null>(null)

export const ProjectStoreProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'PRJ-1001',
      title: 'Contrato Social - TechCorp',
      client: 'TechCorp Brasil',
      status: 'Triagem',
      urgent: true,
      international: false,
      physicalCopy: false,
      dueDate: '2023-11-10',
      laudas: 15,
      value: 0,
      documents: 2,
    },
    {
      id: 'PRJ-1002',
      title: 'Procuração Pública (Apostila)',
      client: 'Maria Silva',
      status: 'Cartório',
      urgent: false,
      international: true,
      physicalCopy: true,
      dueDate: '2023-11-15',
      laudas: 3,
      value: 450,
      documents: 1,
    },
    {
      id: 'PRJ-1003',
      title: 'Manuais Técnicos de Maquinário',
      client: 'Industria XPTO',
      status: 'Produção',
      urgent: false,
      international: true,
      physicalCopy: false,
      dueDate: '2023-11-20',
      laudas: 120,
      value: 8400,
      documents: 5,
    },
    {
      id: 'PRJ-1004',
      title: 'Certidão de Casamento',
      client: 'João Souza',
      status: 'Logística',
      urgent: true,
      international: true,
      physicalCopy: true,
      dueDate: '2023-11-05',
      laudas: 1,
      value: 300,
      documents: 1,
    },
    {
      id: 'PRJ-1005',
      title: 'Estatuto da Empresa',
      client: 'Global Invest',
      status: 'Orçamento',
      urgent: false,
      international: false,
      physicalCopy: false,
      dueDate: '2023-11-12',
      laudas: 45,
      value: 0,
      documents: 1,
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

  return (
    <StoreContext.Provider value={{ projects, addProject, updateProjectStatus, updateProject }}>
      {children}
    </StoreContext.Provider>
  )
}

export default function useProjectStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useProjectStore must be used within ProjectStoreProvider')
  return ctx
}
