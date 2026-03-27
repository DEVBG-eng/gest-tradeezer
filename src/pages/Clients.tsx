import { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import useClientStore from '@/stores/useClientStore'
import { ClienteRecord } from '@/services/clientes'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClientStore()
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentClient, setCurrentClient] = useState<Partial<ClienteRecord>>({})

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients
    const s = search.toLowerCase()
    return clients.filter(
      (c) => c.nome.toLowerCase().includes(s) || (c.cnpj && c.cnpj.toLowerCase().includes(s)),
    )
  }, [clients, search])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentClient.id) {
      await updateClient(currentClient.id, currentClient)
      setIsEditOpen(false)
    } else {
      await addClient(currentClient as any)
      setIsAddOpen(false)
    }
    setCurrentClient({})
  }

  const openEdit = (client: ClienteRecord) => {
    setCurrentClient(client)
    setIsEditOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteClient(deletingId)
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os clientes, preços padrões e preferências.
          </p>
        </div>
        <Button
          onClick={() => {
            setCurrentClient({})
            setIsAddOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou CNPJ/CPF..."
              className="pl-9 w-full sm:w-[350px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome / Razão Social</TableHead>
                <TableHead>CNPJ / CPF</TableHead>
                <TableHead>Valor Padrão (Lauda)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.nome}</TableCell>
                  <TableCell>{client.cnpj || '-'}</TableCell>
                  <TableCell>
                    {client.valor_lauda_padrao
                      ? client.valor_lauda_padrao.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(client)}>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingId(client.id!)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isAddOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false)
            setIsEditOpen(false)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Nome / Razão Social <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  value={currentClient.nome || ''}
                  onChange={(e) => setCurrentClient({ ...currentClient, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ / CPF</Label>
                <Input
                  value={currentClient.cnpj || ''}
                  onChange={(e) => setCurrentClient({ ...currentClient, cnpj: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Endereço</Label>
                <Input
                  value={currentClient.endereco || ''}
                  onChange={(e) => setCurrentClient({ ...currentClient, endereco: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor da Lauda (Padrão)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={currentClient.valor_lauda_padrao || ''}
                  onChange={(e) =>
                    setCurrentClient({
                      ...currentClient,
                      valor_lauda_padrao: parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Valor por Documento (Padrão)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={currentClient.valor_documento_padrao || ''}
                  onChange={(e) =>
                    setCurrentClient({
                      ...currentClient,
                      valor_documento_padrao: parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Idiomas Utilizados</Label>
                <Input
                  placeholder="Ex: PT-BR, EN-US, ES"
                  value={currentClient.idiomas_frequentes || ''}
                  onChange={(e) =>
                    setCurrentClient({ ...currentClient, idiomas_frequentes: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Observações / Especificações</Label>
                <Textarea
                  placeholder="Instruções específicas para projetos deste cliente..."
                  value={currentClient.observacoes || ''}
                  onChange={(e) =>
                    setCurrentClient({ ...currentClient, observacoes: e.target.value })
                  }
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false)
                  setIsEditOpen(false)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cliente será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
