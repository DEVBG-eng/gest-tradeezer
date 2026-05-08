import { useEffect } from 'react'
import { ProposalPrintTemplate } from './ProposalPrintTemplate'
import { useProposalPrint } from '@/hooks/use-proposal-print'

export function GlobalPrintDialogHandler() {
  const { projectId, printData, closePrint, handlePrintRequest } = useProposalPrint()

  useEffect(() => {
    const handlePrint = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      handlePrintRequest(customEvent.detail)
    }

    window.addEventListener('print-project', handlePrint)
    return () => window.removeEventListener('print-project', handlePrint)
  }, [handlePrintRequest])

  if (!projectId || !printData) return null

  return <ProposalPrintTemplate data={printData} onClose={closePrint} />
}
