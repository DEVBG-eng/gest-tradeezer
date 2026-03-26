import { Project } from '@/stores/useProjectStore'
import { PrintProjectData } from '@/components/projects/ProposalPrintTemplate'

const SERVICES_OPTS = [
  { label: 'Via Digital', key: 'digitalCopy' as const },
  { label: 'Via Física', key: 'physicalCopy' as const },
  { label: 'Apostilamento de Haia', key: 'hagueApostille' as const },
  { label: 'Apostilamento Digital', key: 'digitalApostille' as const },
  { label: 'Apostilamento Físico', key: 'physicalApostille' as const },
  { label: 'Reconhecimento', key: 'notarization' as const },
  { label: 'Autenticação documento Digital', key: 'digitalAuthentication' as const },
  { label: 'Frete', key: 'shipping' as const },
  { label: 'DHL (Exterior)', key: 'internationalShipping' as const },
]

export const mapProjectToPrintData = (project: Project): PrintProjectData => {
  return {
    referenceCode: project.id,
    client: project.client,
    status: project.status,
    translationType: project.translationType || '',
    sourceLang: project.sourceLang || 'pt',
    targetLang: project.targetLang || 'en',
    documentType: project.documentType || '',
    documents: project.documents || 1,
    laudas: project.laudas || 0,
    rate: project.valorLauda || 0,
    value: project.value || 0,
    entryDate: project.entryDate ? new Date(project.entryDate) : undefined,
    deadline: project.dueDate ? new Date(project.dueDate) : undefined,
    services: [
      { label: 'Urgente', active: project.urgent || false },
      { label: 'Internacional', active: project.international || false },
      ...SERVICES_OPTS.map((opt) => ({
        label: opt.label,
        active: !!project[opt.key as keyof Project],
      })),
    ],
    observations: project.observations || '',
  }
}
