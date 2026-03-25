import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import useSettingsStore from '@/stores/useSettingsStore'
import { Cloud, HardDrive } from 'lucide-react'

export default function Settings() {
  const {
    activeCloudProvider,
    setActiveCloudProvider,
    connectedProviders,
    toggleProviderConnection,
  } = useSettingsStore()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie preferências do sistema e perfil de usuário.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Armazenamento em Nuvem</CardTitle>
          <CardDescription>
            Configure onde os documentos das Ordens de Serviço serão salvos via sincronização
            automática.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <HardDrive size={24} />
              </div>
              <div>
                <p className="font-semibold text-sm flex items-center gap-2">
                  Google Drive
                  {activeCloudProvider === 'google_drive' && (
                    <Badge variant="secondary" className="text-xs">
                      Ativo
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sincronização de pastas e arquivos via Google Workspace
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {connectedProviders.includes('google_drive') && (
                <Button
                  variant={activeCloudProvider === 'google_drive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCloudProvider('google_drive')}
                  disabled={activeCloudProvider === 'google_drive'}
                >
                  {activeCloudProvider === 'google_drive' ? 'Padrão' : 'Tornar Padrão'}
                </Button>
              )}
              <Switch
                checked={connectedProviders.includes('google_drive')}
                onCheckedChange={() => toggleProviderConnection('google_drive')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
                <Cloud size={24} />
              </div>
              <div>
                <p className="font-semibold text-sm flex items-center gap-2">
                  Dropbox
                  {activeCloudProvider === 'dropbox' && (
                    <Badge variant="secondary" className="text-xs">
                      Ativo
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Armazenamento corporativo em nuvem da Dropbox
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {connectedProviders.includes('dropbox') && (
                <Button
                  variant={activeCloudProvider === 'dropbox' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCloudProvider('dropbox')}
                  disabled={activeCloudProvider === 'dropbox'}
                >
                  {activeCloudProvider === 'dropbox' ? 'Padrão' : 'Tornar Padrão'}
                </Button>
              )}
              <Switch
                checked={connectedProviders.includes('dropbox')}
                onCheckedChange={() => toggleProviderConnection('dropbox')}
              />
            </div>
          </div>
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
