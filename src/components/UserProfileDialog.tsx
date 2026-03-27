import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { getFileUrl } from '@/lib/pocketbase/utils'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Camera, Loader2, X } from 'lucide-react'

const profileSchema = z
  .object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    email: z.string().email('E-mail inválido.'),
    oldPassword: z.string().optional(),
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A senha deve ter pelo menos 8 caracteres.',
        path: ['password'],
      })
    }
    if (data.password && !data.oldPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A senha atual é obrigatória.',
        path: ['oldPassword'],
      })
    }
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'As senhas não coincidem.',
        path: ['passwordConfirm'],
      })
    }
  })

type ProfileFormValues = z.infer<typeof profileSchema>

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '', oldPassword: '', password: '', passwordConfirm: '' },
  })

  useEffect(() => {
    if (open && user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        oldPassword: '',
        password: '',
        passwordConfirm: '',
      })
      setFile(null)
      setPreview(null)
    }
  }, [open, user, form])

  const currentAvatarUrl = user?.avatar ? getFileUrl(user, user.avatar) : ''
  const displayUrl = preview || currentAvatarUrl
  const initials = user?.name
    ? user.name.substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        description: 'Por favor, selecione um arquivo de imagem válido.',
      })
      return
    }
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('email', values.email)

      if (values.password) {
        formData.append('oldPassword', values.oldPassword || '')
        formData.append('password', values.password)
        formData.append('passwordConfirm', values.passwordConfirm || '')
      }

      if (file) formData.append('avatar', file)

      const updatedUser = await pb.collection('users').update(user.id, formData)
      pb.authStore.save(pb.authStore.token, updatedUser)

      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso.' })
      onOpenChange(false)
    } catch (err) {
      const errors = extractFieldErrors(err)
      Object.entries(errors).forEach(([field, msg]) =>
        form.setError(field as any, { message: msg }),
      )
      if (!Object.keys(errors).length) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível atualizar o perfil. Verifique os dados e tente novamente.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e credenciais de acesso.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <div className="flex justify-center">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="h-24 w-24 border-2 border-muted shadow-sm">
                  <AvatarImage src={displayUrl} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6" />
                </div>
                {preview && !loading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      setPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-sm hover:bg-destructive/90 transition-colors z-10"
                  >
                    <X className="h-3 w-3" />
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
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium leading-none tracking-tight">
                Alterar Senha (Opcional)
              </h4>
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite sua senha atual" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Nova senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passwordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirme a nova senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
