import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, FileText } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (val: boolean) => void
  onCreateProject: () => void
}

export function ComplianceReportModal({ open, onOpenChange, onCreateProject }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Document Compliance Report (DCR)
          </DialogTitle>
          <DialogDescription>
            A análise via OCR foi concluída. Revise os pontos identificados antes de prosseguir para
            o orçamento.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-3 bg-slate-50 dark:bg-slate-900">
              <p className="text-xs text-muted-foreground mb-1">Tipo Identificado</p>
              <p className="font-medium text-sm">Contrato de Prestação de Serviços</p>
            </div>
            <div className="border rounded-md p-3 bg-slate-50 dark:bg-slate-900">
              <p className="text-xs text-muted-foreground mb-1">Contagem Estimada</p>
              <p className="font-medium text-sm">18 Laudas (32.400 caracteres)</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Checks de Conformidade</h4>
            <div className="flex items-center justify-between p-2 border rounded text-sm bg-success/10 border-success/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Legibilidade do Texto</span>
              </div>
              <Badge
                variant="outline"
                className="bg-success text-success-foreground border-transparent"
              >
                98% Match
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded text-sm bg-warning/10 border-warning/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span>Assinaturas Físicas Requeridas</span>
              </div>
              <Badge
                variant="outline"
                className="bg-warning text-warning-foreground border-transparent"
              >
                Pendente
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onCreateProject}>Validar e Criar Projeto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
