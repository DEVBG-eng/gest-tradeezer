import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import useSettingsStore, { CloudProvider } from '@/stores/useSettingsStore'
import { Cloud, HardDrive, Loader2, Link as LinkIcon, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Settings() {
  const {
    activeCloudProvider,
    setActiveCloudProvider,
    connectedProviders,
    toggleProviderConnection,
    providerEmails,
    oneDriveNetworkLink,
    setOneDriveNetworkLink,
  } = useSettingsStore()
  const { toast } = useToast()

  const [connecting, setConnecting] = useState<CloudProvider>(null)
  const [linkInput, setLinkInput] = useState(oneDriveNetworkLink)
  const [isValidatingLink, setIsValidatingLink] = useState(false)

  useEffect(() => {
    setLinkInput(oneDriveNetworkLink)
  }, [oneDriveNetworkLink])

  const handleConnect = (provider: NonNullable<CloudProvider>) => {
    setConnecting(provider)
    setTimeout(() => {
      toggleProviderConnection(provider)
      if (!activeCloudProvider) setActiveCloudProvider(provider)
      setConnecting(null)
      toast({
        title: 'Conta Conectada',
        description: `Integração concluída com sucesso.`,
      })
    }, 1500)
  }

  const handleValidateAndSaveLink = () => {
    if (!linkInput) {
      return toast({
        title: 'Aviso',
        description: 'Insira um link válido.',
        variant: 'destructive',
      })
    }
    setIsValidatingLink(true)
    setTimeout(() => {
      setIsValidatingLink(false)
      const isValid =
        /^https?:\/\//.test(linkInput) &&
        /(sharepoint\.com|onedrive\.live\.com|microsoft\.com)/.test(linkInput)
      if (isValid) {
        setOneDriveNetworkLink(linkInput)
        toast({
          title: 'Link Validado',
          description: 'Diretório Microsoft mapeado com sucesso para novos projetos.',
        })
      } else {
        toast({
          title: 'Link Inválido',
          description: 'Insira um URL válido do SharePoint ou OneDrive.',
          variant: 'destructive',
        })
      }
    }, 1200)
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
      <div key={id} className="border-b last:border-0 pb-6 last:pb-0 pt-6 first:pt-0">
        {id === 'onedrive' && isConnected && (
          <div className="mt-4 ml-16 p-4 bg-muted/30 border rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              Mapeamento de Diretório Microsoft
            </div>
            <p className="text-xs text-muted-foreground">
              Insira o link de rede do SharePoint ou OneDrive for Business raiz para mapeamento
              automático.
            </p>
            <div className="flex items-center gap-3">
              <Input
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="Ex: https://empresa.sharepoint.com/personal/..."
                className="flex-1"
              />
              <Button onClick={handleValidateAndSaveLink} disabled={isValidatingLink || !linkInput}>
                {isValidatingLink ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}{' '}
                Validar
              </Button>
            </div>
            {oneDriveNetworkLink && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-500 mt-2 bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded border border-emerald-100 dark:border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />
                Link de rede ativo e validado.
              </div>
            )}
          </div>
        )}
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
    </div>
  )
}
