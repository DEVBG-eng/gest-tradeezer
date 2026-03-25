import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import useSettingsStore, { CloudProvider } from '@/stores/useSettingsStore'
import { Cloud, HardDrive, Loader2, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Settings() {
  const {
    activeCloudProvider,
    setActiveCloudProvider,
    connectedProviders,
    toggleProviderConnection,
    providerEmails,
  } = useSettingsStore()
  const { toast } = useToast()

  const [connecting, setConnecting] = useState<CloudProvider>(null)

  const handleConnect = (provider: NonNullable<CloudProvider>) => {
    setConnecting(provider)
    // Simulate OAuth flow
    setTimeout(() => {
      toggleProviderConnection(provider)
      if (!activeCloudProvider) setActiveCloudProvider(provider)
      setConnecting(null)
      toast({
        title: 'Conta Conectada',
        description: `Integração com ${
          provider === 'google_drive'
            ? 'Google Drive'
            : provider === 'dropbox'
              ? 'Dropbox'
              : 'Microsoft OneDrive'
        } concluída com sucesso.`,
      })
    }, 1500)
  }

  const renderProvider = (
    id: NonNullable<CloudProvider>,
    name: string,
    desc: string,
    Icon: any,
    colorClass: string,
    iconColorClass: string,
  ) => {
    const isConnected = connectedProviders.includes(id)
    const isActive = activeCloudProvider === id
    const isConnecting = connecting === id

    return (
      <div className="flex items-center justify-between border-b last:border-0 pb-6 last:pb-0 pt-6 first:pt-0">
        <div className="flex items-center gap-4">
          <div className={`${colorClass} ${iconColorClass} p-3 rounded-xl`}>
            <Icon size={24} />
          </div>
          <div>
            <p className="font-semibold text-sm flex items-center gap-2">
              {name}
              {isActive && (
                <Badge variant="secondary" className="text-xs">
                  Padrão Ativo
                </Badge>
              )}
            </p>
            {isConnected ? (
              <p className="text-xs text-muted-foreground mt-1">
                Conectado como: <span className="font-medium">{providerEmails[id]}</span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          {isConnected ? (
            <>
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCloudProvider(id)}
                disabled={isActive}
              >
                {isActive ? 'Padrão' : 'Tornar Padrão'}
              </Button>
              <div className="flex items-center gap-2 sm:border-l sm:pl-4">
                <Label
                  className="text-xs text-muted-foreground cursor-pointer"
                  onClick={() => {
                    toggleProviderConnection(id)
                    toast({ description: `Conta do ${name} desconectada.` })
                  }}
                >
                  Desconectar
                </Label>
                <Switch
                  checked={isConnected}
                  onCheckedChange={() => {
                    toggleProviderConnection(id)
                    toast({ description: `Conta do ${name} desconectada.` })
                  }}
                />
              </div>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleConnect(id)}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="mr-2 h-4 w-4" />
              )}
              Conectar {name}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie preferências do sistema e integrações com terceiros.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Armazenamento em Nuvem</CardTitle>
          <CardDescription>
            Conecte suas contas para automatizar a sincronização de documentos das Ordens de
            Serviço.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {renderProvider(
            'onedrive',
            'Microsoft OneDrive',
            'Sincronização automática para diretório /Projetos/',
            Cloud,
            'bg-blue-100',
            'text-blue-700',
          )}
          {renderProvider(
            'google_drive',
            'Google Drive',
            'Sincronização de pastas e arquivos via Google Workspace',
            HardDrive,
            'bg-emerald-100',
            'text-emerald-700',
          )}
          {renderProvider(
            'dropbox',
            'Dropbox',
            'Armazenamento corporativo em nuvem da Dropbox',
            Cloud,
            'bg-sky-50',
            'text-sky-600',
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
          <CardDescription>Informações da sua conta no Tradeezer Hub.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input defaultValue="Admin Tradeezer" />
          </div>
          <div className="space-y-2">
            <Label>E-mail Corporativo</Label>
            <Input defaultValue="admin@tradeezer.com" readOnly className="bg-muted" />
          </div>
          <Button>Salvar Alterações</Button>
        </CardContent>
      </Card>
    </div>
  )
}
