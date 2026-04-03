import { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2, Upload } from 'lucide-react'
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
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import useClientStore from '@/stores/useClientStore'
import { ClienteRecord } from '@/services/clientes'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { ClientImportDialog } from '@/components/clients/ClientImportDialog'

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClientStore()
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
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
    } else {
      await addClient(currentClient as any)
    }
    setIsAddOpen(false)
    setCurrentClient({})
  }

  const handleImport = async (data: Partial<ClienteRecord>[]) => {
    for (const record of data) {
      await addClient(record as any)
    }
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Importar Planilha
          </Button>
          <Button
            onClick={() => {
              setCurrentClient({})
              setIsAddOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Novo Cliente
          </Button>
        </div>
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
                <TableHead>Nome Fantasia</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.nome}</TableCell>
                  <TableCell>{client.cnpj || '-'}</TableCell>
                  <TableCell>{client.contato || '-'}</TableCell>
                  <TableCell>{client.telefone || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentClient(client)
                        setIsAddOpen(true)
                      }}
                    >
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
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClientFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        client={currentClient}
        onChange={setCurrentClient}
        onSave={handleSave}
      />

      <ClientImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={handleImport}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
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
