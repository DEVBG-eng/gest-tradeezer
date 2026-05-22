import { useState, useEffect, useRef } from 'react'
import { formatCurrency, cn } from '@/lib/utils'

export function CurrencyInput({
  value,
  onChange,
  className,
}: {
  value: number
  onChange: (v: number) => void
  className?: string
}) {
  const [displayValue, setDisplayValue] = useState(() => formatCurrency(value))

  useEffect(() => {
    setDisplayValue(formatCurrency(value))
  }, [value])

  const handleBlur = () => {
    let numeric = value
    if (displayValue.includes(',')) {
      const cleanStr = displayValue
        .replace(/\./g, '')
        .replace(',', '.')
        .replace(/[^\d.-]/g, '')
      numeric = parseFloat(cleanStr)
    } else {
      const cleanStr = displayValue.replace(/[^\d.-]/g, '')
      numeric = parseFloat(cleanStr)
    }

    if (!isNaN(numeric)) {
      onChange(numeric)
      setDisplayValue(formatCurrency(numeric))
    } else {
      setDisplayValue(formatCurrency(value))
    }
  }

  return (
    <input
      type="text"
      value={displayValue}
      onChange={(e) => setDisplayValue(e.target.value)}
      onBlur={handleBlur}
      className={cn(
        'w-full bg-transparent outline-none border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-1 transition-colors print:border-transparent print:p-0',
        className,
      )}
    />
  )
}

export function EditableInput({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full bg-transparent outline-none border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-1 transition-colors print:border-transparent print:p-0 print:placeholder-transparent placeholder:text-slate-300',
        className,
      )}
    />
  )
}

export function AutoResizeTextarea({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full bg-transparent outline-none border border-transparent hover:border-slate-200 focus:border-blue-500 rounded p-1 transition-colors resize-none print:border-transparent print:p-0 print:placeholder-transparent placeholder:text-slate-300 overflow-hidden',
        className,
      )}
      rows={1}
    />
  )
}
