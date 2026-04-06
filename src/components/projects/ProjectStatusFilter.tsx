import { useSearchParams } from 'react-router-dom'
import { Check, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { ALL_STATUSES } from '@/stores/useProjectStore'

export function ProjectStatusFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedStatuses = new Set(searchParams.getAll('status'))

  const toggleStatus = (status: string) => {
    const newParams = new URLSearchParams(searchParams)
    const statuses = newParams.getAll('status')

    newParams.delete('status')

    if (statuses.includes(status)) {
      statuses.filter((s) => s !== status).forEach((s) => newParams.append('status', s))
    } else {
      ;[...statuses, status].forEach((s) => newParams.append('status', s))
    }

    setSearchParams(newParams)
  }

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('status')
    setSearchParams(newParams)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 border-dashed">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar por Status
          {selectedStatuses.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedStatuses.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedStatuses.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedStatuses.size} selecionados
                  </Badge>
                ) : (
                  ALL_STATUSES.filter((s) => selectedStatuses.has(s)).map((s) => (
                    <Badge variant="secondary" key={s} className="rounded-sm px-1 font-normal">
                      {s}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Buscar status..." />
          <CommandList>
            <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
            <CommandGroup>
              {ALL_STATUSES.map((status) => {
                const isSelected = selectedStatuses.has(status)
                return (
                  <CommandItem
                    key={status}
                    onSelect={() => toggleStatus(status)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check className={cn('h-4 w-4')} />
                    </div>
                    <span>{status}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedStatuses.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clearFilters}
                    className="justify-center text-center cursor-pointer font-medium"
                  >
                    Limpar filtros
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
