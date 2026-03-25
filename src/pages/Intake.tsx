import { useState } from 'react'
import { UploadCloud, FileType, CheckCircle2, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ComplianceReportModal } from '@/components/intake/ComplianceReportModal'
import useProjectStore from '@/stores/useProjectStore'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

export default function Intake() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const { addProject } = useProjectStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (status !== 'idle') return
    simulateUpload()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && status === 'idle') {
      simulateUpload()
    }
  }

  const simulateUpload = () => {
    setStatus('uploading')
    let p = 0
    const interval = setInterval(() => {
      p += 20
      setProgress(Math.min(p, 100))
      if (p >= 100) {
        clearInterval(interval)
        setStatus('processing')
        setTimeout(() => {
          setStatus('done')
          setShowModal(true)
        }, 2000)
      }
    }, 400)
  }

  const handleCreateProject = () => {
    addProject({
      title: 'Contrato de Serviços (Análise via Intake)',
      client: 'Novo Cliente',
      status: 'Orçamento',
      urgent: false,
      international: false,
      physicalCopy: true,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      laudas: 18,
      value: 0,
      documents: 1,
    })
    setShowModal(false)
    toast({
      title: 'Projeto Criado com Sucesso',
      description: 'O documento foi validado e movido para a etapa de Orçamento.',
    })
    navigate('/projects')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Intake & Análise (OCR)</h1>
        <p className="text-muted-foreground mt-1">
          Carregue documentos para extração automática de dados e contagem de laudas.
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-12 transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden ${status === 'idle' ? 'border-border bg-white dark:bg-slate-900 hover:border-primary/50 cursor-pointer' : 'border-primary/50 bg-primary/5'}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => status === 'idle' && document.getElementById('file-upload')?.click()}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={handleFileSelect}
        />

        {status === 'idle' && (
          <div className="animate-fade-in-up flex flex-col items-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <UploadCloud size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Arraste e solte arquivos aqui</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Suporta PDF, Word e Imagens. Múltiplos arquivos serão unificados na mesma análise de
              OCR.
            </p>
            <Button variant="secondary" className="mt-6">
              Procurar Arquivos
            </Button>
          </div>
        )}

        {status === 'uploading' && (
          <div className="w-full max-w-md animate-fade-in flex flex-col items-center">
            <FileType size={40} className="text-primary mb-4 animate-bounce" />
            <h3 className="text-lg font-medium mb-4">Carregando documentos...</h3>
            <Progress value={progress} className="w-full h-2 mb-2" />
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
        )}

        {status === 'processing' && (
          <div className="w-full max-w-md animate-fade-in flex flex-col items-center">
            <Loader2 size={40} className="text-accent animate-spin mb-4" />
            <h3 className="text-lg font-medium mb-2">Processando OCR Avançado</h3>
            <p className="text-sm text-muted-foreground text-center">
              Analisando texto, reconhecendo assinaturas e gerando contagem de laudas...
            </p>
          </div>
        )}

        {status === 'done' && (
          <div className="w-full max-w-md animate-fade-in flex flex-col items-center">
            <CheckCircle2 size={48} className="text-success mb-4" />
            <h3 className="text-lg font-medium mb-4 text-success">Análise Concluída</h3>
            <Button onClick={() => setShowModal(true)}>Ver Relatório de Conformidade</Button>
            <Button
              variant="link"
              className="mt-2 text-muted-foreground"
              onClick={() => setStatus('idle')}
            >
              Fazer novo upload
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="font-semibold mb-4 text-lg">Fila de Processamento Recente</h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Contrato_Social_v2.pdf</p>
                    <p className="text-xs text-muted-foreground">Adicionado há 10 min por Você</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
                  Ver DCR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ComplianceReportModal
        open={showModal}
        onOpenChange={setShowModal}
        onCreateProject={handleCreateProject}
      />
    </div>
  )
}
