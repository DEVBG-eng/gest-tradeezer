import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClienteRecord } from '@/services/clientes'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Partial<ClienteRecord>
  onChange: (client: Partial<ClienteRecord>) => void
  onSave: (e: React.FormEvent) => void
}

export function ClientFormDialog({ open, onOpenChange, client, onChange, onSave }: Props) {
  const set = (key: keyof ClienteRecord, value: any) => onChange({ ...client, [key]: value })
  const setNum = (key: keyof ClienteRecord, value: string) =>
    set(key, parseFloat(value) || undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{client.id ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="main">Dados Principais</TabsTrigger>
              <TabsTrigger value="financial">Valores e Pagamento</TabsTrigger>
              <TabsTrigger value="other">Outros</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Nome Fantasia <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    required
                    value={client.nome || ''}
                    onChange={(e) => set('nome', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input
                    value={client.razao_social || ''}
                    onChange={(e) => set('razao_social', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ / CPF</Label>
                  <Input value={client.cnpj || ''} onChange={(e) => set('cnpj', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Ramo</Label>
                  <Input value={client.ramo || ''} onChange={(e) => set('ramo', e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    value={client.endereco || ''}
                    onChange={(e) => set('endereco', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contato</Label>
                  <Input
                    value={client.contato || ''}
                    onChange={(e) => set('contato', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prospecção</Label>
                  <Input
                    value={client.prospeccao || ''}
                    onChange={(e) => set('prospeccao', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={client.email || ''}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={client.telefone || ''}
                    onChange={(e) => set('telefone', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-3">
                  <Label>Forma de Pagamento</Label>
                  <Input
                    value={client.forma_pagamento || ''}
                    onChange={(e) => set('forma_pagamento', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Lauda Padrão</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={client.valor_lauda_padrao || ''}
                    onChange={(e) => setNum('valor_lauda_padrao', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Doc Padrão</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={client.valor_documento_padrao || ''}
                    onChange={(e) => setNum('valor_documento_padrao', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Frete</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={client.valor_frete || ''}
                    onChange={(e) => setNum('valor_frete', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Certidão Digital</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={client.valor_certidao_digital || ''}
                    onChange={(e) => setNum('valor_certidao_digital', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Procuração Digital</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={client.valor_procuracao_digital || ''}
                    onChange={(e) => setNum('valor_procuracao_digital', e.target.value)}
                  />
                </div>
                <div className="space-y-2"></div>
                <div className="space-y-2">
                  <Label>Certidão Física</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={client.valor_certidao_fisica || ''}
                    onChange={(e) => setNum('valor_certidao_fisica', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Procuração Física</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={client.valor_procuracao_fisica || ''}
                    onChange={(e) => setNum('valor_procuracao_fisica', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Idiomas Utilizados</Label>
                  <Input
                    placeholder="Ex: PT-BR, EN-US, ES"
                    value={client.idiomas_frequentes || ''}
                    onChange={(e) => set('idiomas_frequentes', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Informações de Frete</Label>
                  <Textarea
                    value={client.informacoes_frete || ''}
                    onChange={(e) => set('informacoes_frete', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Observações Gerais</Label>
                  <Textarea
                    value={client.observacoes || ''}
                    onChange={(e) => set('observacoes', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
