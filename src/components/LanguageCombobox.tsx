import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

export const LANGUAGES = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'Inglês' },
  { value: 'es', label: 'Espanhol' },
  { value: 'de', label: 'Alemão' },
  { value: 'it', label: 'Italiano' },
  { value: 'fr', label: 'Francês' },
  { value: 'zh-CN', label: 'Chinês (Mandarim)' },
  { value: 'zh-HK', label: 'Chinês (Cantonês)' },
  { value: 'pl', label: 'Polonês' },
  { value: 'hr', label: 'Croata' },
  { value: 'ja', label: 'Japonês' },
  { value: 'ko', label: 'Coreano' },
  { value: 'ru', label: 'Russo' },
  { value: 'ar', label: 'Árabe' },
  { value: 'nl', label: 'Holandês' },
  { value: 'tr', label: 'Turco' },
  { value: 'el', label: 'Grego' },
  { value: 'he', label: 'Hebraico' },
  { value: 'hi', label: 'Hindi' },
  { value: 'th', label: 'Tailandês' },
  { value: 'vi', label: 'Vietnamita' },
  { value: 'sv', label: 'Sueco' },
  { value: 'no', label: 'Norueguês' },
  { value: 'da', label: 'Dinamarquês' },
  { value: 'fi', label: 'Finlandês' },
  { value: 'ro', label: 'Romeno' },
  { value: 'hu', label: 'Húngaro' },
  { value: 'cs', label: 'Tcheco' },
  { value: 'sk', label: 'Eslovaco' },
  { value: 'uk', label: 'Ucraniano' },
  { value: 'id', label: 'Indonésio' },
  { value: 'ms', label: 'Malaio' },
]

export function LanguageCombobox({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (val: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2 flex flex-col">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {value ? LANGUAGES.find((language) => language.value === value)?.label : 'Selecione...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar idioma..." />
            <CommandList>
              <CommandEmpty>Nenhum idioma encontrado.</CommandEmpty>
              <CommandGroup>
                {LANGUAGES.map((language) => (
                  <CommandItem
                    key={language.value}
                    value={language.label}
                    onSelect={(currentValue) => {
                      const selected = LANGUAGES.find(
                        (l) => l.label.toLowerCase() === currentValue.toLowerCase(),
                      )
                      if (selected) {
                        onChange(selected.value)
                      }
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === language.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {language.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
