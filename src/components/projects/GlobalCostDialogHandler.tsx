import { useState, useEffect } from 'react'
import { ProjectCostDialog } from './ProjectCostDialog'
import useProjectStore from '@/stores/useProjectStore'
import { getCustoProjetoByProjeto } from '@/services/projetos'
import { useToast } from '@/hooks/use-toast'

export function GlobalCostDialogHandler() {
  const { projects, updateProject } = useProjectStore()
  const [open, setOpen] = useState(false)
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const handleRequest = async (e: Event) => {
      const customEvent = e as CustomEvent
      const pid = customEvent.detail
      const proj = projects.find((p) => p.id === pid)
      if (!proj) return

      try {
        const cost = await getCustoProjetoByProjeto(proj.pbId)
        if (cost) {
          await updateProject(pid, { status: 'Concluído' })
          toast({ title: 'Sucesso', description: 'Projeto marcado como Concluído.' })
        } else {
          setPendingProjectId(pid)
          setOpen(true)
          toast({
            title: 'Custos Obrigatórios',
            description: 'Preencha os custos do projeto antes de marcá-lo como Concluído.',
            variant: 'destructive',
          })
        }
      } catch (err) {
        console.error(err)
      }
    }

    window.addEventListener('request-complete-project', handleRequest)
    return () => window.removeEventListener('request-complete-project', handleRequest)
  }, [projects, updateProject, toast])

  const project = projects.find((p) => p.id === pendingProjectId)

  return project ? (
    <ProjectCostDialog
      project={project}
      open={open}
      onOpenChange={setOpen}
      onSaved={() => {
        updateProject(project.id, { status: 'Concluído' })
        setOpen(false)
        toast({ title: 'Sucesso', description: 'Projeto concluído com sucesso.' })
      }}
    />
  ) : null
}
