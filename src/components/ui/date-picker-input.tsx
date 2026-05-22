import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface DatePickerInputProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  error?: boolean
  id?: string
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
  className,
  error,
  id,
}: DatePickerInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
  const isInternalUpdate = React.useRef(false)

  React.useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    if (value && isValid(value)) {
      setInputValue(format(value, 'dd/MM/yyyy'))
    } else {
      setInputValue('')
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')

    if (val.length > 8) {
      val = val.substring(0, 8)
    }

    let masked = val
    if (val.length > 4) {
      masked = `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4)}`
    } else if (val.length > 2) {
      masked = `${val.substring(0, 2)}/${val.substring(2)}`
    }

    setInputValue(masked)

    let parsedDate: Date | undefined = undefined
    if (masked.length === 10) {
      const parsed = parse(masked, 'dd/MM/yyyy', new Date())
      if (isValid(parsed) && format(parsed, 'dd/MM/yyyy') === masked) {
        parsedDate = parsed
      }
    }

    if (value?.getTime() !== parsedDate?.getTime()) {
      isInternalUpdate.current = true
      onChange(parsedDate)
    }
  }

  const handleSelect = (date: Date | undefined) => {
    isInternalUpdate.current = true
    onChange(date)
    if (date) {
      setInputValue(format(date, 'dd/MM/yyyy'))
    } else {
      setInputValue('')
    }
    setIsPopoverOpen(false)
  }

  return (
    <div className={cn('relative flex items-center w-full', className)}>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className={cn(
          'pr-10 font-normal',
          error && 'border-destructive focus-visible:ring-destructive',
          !value && !inputValue && 'text-muted-foreground',
        )}
        maxLength={10}
      />
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground',
              error && 'text-destructive',
            )}
            type="button"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="sr-only">Abrir calendário</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar mode="single" selected={value} onSelect={handleSelect} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  )
}
