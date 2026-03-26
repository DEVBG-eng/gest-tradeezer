import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { getFileUrl } from '@/lib/pocketbase/utils'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Upload, X, Loader2 } from 'lucide-react'

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setFile(null)
      setPreview(null)
      setError(null)
    }
  }, [open])

  const currentAvatarUrl = user?.avatar ? getFileUrl(user, user.avatar) : ''
  const displayUrl = preview || currentAvatarUrl
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!selected.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem (PNG, JPG, JPEG).')
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.')
      return
    }

    setError(null)
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleSave = async () => {
    if (!file || !user) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const updatedUser = await pb.collection('users').update(user.id, formData)

      // Update the local auth store so the rest of the app updates automatically
      pb.authStore.save(pb.authStore.token, updatedUser)

      toast({
        title: 'Sucesso',
        description: 'Foto de perfil atualizada com sucesso.',
      })
      onOpenChange(false)
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      setError(fieldErrors.avatar || 'Erro ao atualizar a foto de perfil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize sua foto de perfil para ser facilmente identificado no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-muted shadow-sm">
              <AvatarImage src={displayUrl} className="object-cover" />
              <AvatarFallback className="text-3xl bg-secondary">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={loading}
              type="button"
            >
              <Upload className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">Alterar</span>
            </button>
            {preview && !loading && (
              <button
                onClick={() => {
                  setFile(null)
                  setPreview(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90 transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
          />

          {error && <p className="text-sm text-destructive text-center max-w-[280px]">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!file || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
