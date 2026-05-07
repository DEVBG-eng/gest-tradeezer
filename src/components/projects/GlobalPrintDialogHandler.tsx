import { useEffect, useState } from 'react'
import { ProposalPrintTemplate } from './ProposalPrintTemplate'
import useProjectStore from '@/stores/useProjectStore'
import { mapProjectToPrintData } from '@/lib/project-utils'

export function GlobalPrintDialogHandler() {
  const [projectId, setProjectId] = useState<string | null>(null)
  const { projects } = useProjectStore()

  useEffect(() => {
    const handlePrint = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      setProjectId(customEvent.detail)
    }

    window.addEventListener('print-project', handlePrint)
    return () => window.removeEventListener('print-project', handlePrint)
  }, [])

  if (!projectId) return null

  const project = projects.find((p) => p.id === projectId)
  if (!project) return null

  return (
    <ProposalPrintTemplate
      data={mapProjectToPrintData(project)}
      autoPrint={true}
      onClose={() => setProjectId(null)}
    />
  )
}
