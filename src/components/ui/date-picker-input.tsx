import * as React from 'react'
import { format, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

export interface DatePickerInputProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
}: DatePickerInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

  React.useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, 'dd/MM/yyyy'))
    } else {
      setInputValue('')
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 8) {
      val = val.slice(0, 8)
    }

    if (val.length >= 5) {
      val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`
    } else if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`
    }

    setInputValue(val)

    if (val.length === 10) {
      const parsedDate = parse(val, 'dd/MM/yyyy', new Date())
      if (isValid(parsedDate) && format(parsedDate, 'dd/MM/yyyy') === val) {
        onChange?.(parsedDate)
      } else {
        onChange?.(undefined)
      }
    } else {
      onChange?.(undefined)
    }
  }

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date)
    if (date) {
      setInputValue(format(date, 'dd/MM/yyyy'))
    } else {
      setInputValue('')
    }
    setIsPopoverOpen(false)
  }

  return (
    <div className="relative flex items-center">
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className="pr-10"
        maxLength={10}
      />
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            className="absolute right-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
