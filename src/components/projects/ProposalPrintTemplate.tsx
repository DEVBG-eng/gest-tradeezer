import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { formatCurrency, cn } from '@/lib/utils'
import { Download, X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditableInput, CurrencyInput, AutoResizeTextarea } from '@/components/ui/editable-fields'
import logoUrl from '@/assets/fundo-branco-azul-turquesa-vibrante-f595e.jpg'

export interface PrintProjectData {
  referenceCode: string
  client: string
  clientCnpj?: string
  clientAddress?: string
  clientContact?: string
  email?: string
  phone?: string
  value?: number
  entryDate?: Date
  deadline?: Date
  serviceType?: string
  translationType?: string
  sourceLang?: string
  targetLang?: string
  services?: { label: string; active: boolean }[]
  observations?: string
  items?: any[]
  paymentMethod?: string
}

interface EditableItem {
  id: string
  description: string
  quantity: number
  unitValue: number
  subtotal: number
}

export function ProposalPrintTemplate({
  data,
  onClose,
  autoPrint,
}: {
  data: PrintProjectData
  onClose?: () => void
  autoPrint?: boolean
}) {
  const [docState, setDocState] = useState(() => {
    return {
      ref: data.referenceCode?.replace(/^TRD-/, '') || '',
      date: data.entryDate
        ? format(data.entryDate, 'dd/MM/yyyy')
        : format(new Date(), 'dd/MM/yyyy'),
      client: data.client || '',
      clientCnpj: data.clientCnpj || '',
      clientContact: data.clientContact || '',
      email: data.email || '',
      phone: data.phone || '',
      clientAddress: data.clientAddress || '',
      serviceType: data.serviceType || data.translationType || '',
      languages:
        data.sourceLang || data.targetLang
          ? `${data.sourceLang || '-'} \u2192 ${data.targetLang || '-'}`
          : '',
      deadline: data.deadline ? format(data.deadline, 'dd/MM/yyyy') : '',
      items: (data.items || []).map((item: any) => {
        const qtd = item.laudas ?? item.quantidade ?? item.qtd_laudas ?? 1
        const valorUnit = item.valorLauda ?? item.valor_unitario ?? item.valor_lauda ?? 0
        const sub = item.subtotal ?? item.total ?? item.valor_total ?? qtd * valorUnit
        return {
          id: Math.random().toString(36).substring(7),
          description: item.description || item.descricao || '',
          quantity: qtd,
          unitValue: valorUnit,
          subtotal: sub,
        }
      }) as EditableItem[],
      services: (data.services || [])
        .filter((s: any) => s.active)
        .map((s: any) => ({
          id: Math.random().toString(36).substring(7),
          label: s.label,
        })),
      observations: data.observations || '',
      paymentMethod: data.paymentMethod || '',
      globalValue: data.value || 0,
    }
  })

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        const originalTitle = document.title
        document.title = `Orcamento_${docState.ref}`
        window.print()
        document.title = originalTitle
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [autoPrint, docState.ref])

  const total =
    docState.items.length > 0
      ? docState.items.reduce((acc, item) => acc + item.subtotal, 0)
      : docState.globalValue

  const updateItem = (id: string, field: keyof EditableItem, value: any) => {
    setDocState((prev) => {
      const newItems = prev.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitValue') {
            updated.subtotal = updated.quantity * updated.unitValue
          }
          return updated
        }
        return item
      })
      return { ...prev, items: newItems }
    })
  }

  const addItem = () => {
    setDocState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Math.random().toString(36).substring(7),
          description: 'Novo Serviço',
          quantity: 1,
          unitValue: 0,
          subtotal: 0,
        },
      ],
    }))
  }

  const removeItem = (id: string) => {
    setDocState((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }))
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 overflow-auto print:absolute print:inset-0 print:bg-white print:m-0 print:p-0 print:z-[9999]">
      <style>
        {`
          @media print {
            body { background: white !important; }
            nav, header, aside, .sidebar { display: none !important; }
            #root { overflow: visible !important; }
            @page { size: A4; margin: 20mm; }
            input, textarea {
              border: none !important;
              background: transparent !important;
              box-shadow: none !important;
              outline: none !important;
            }
          }
        `}
      </style>
      <div className="bg-white p-4 flex justify-end gap-2 print:hidden sticky top-0 border-b z-10 shadow-sm shrink-0">
        <Button
          variant="default"
          onClick={() => {
            const originalTitle = document.title
            document.title = `Orcamento_${docState.ref}`
            setTimeout(() => {
              window.print()
              document.title = originalTitle
            }, 100)
          }}
        >
          <Download className="w-4 h-4 mr-2" /> Imprimir / PDF
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" /> Fechar
          </Button>
        )}
      </div>

      <div className="bg-white p-12 max-w-[210mm] min-h-[297mm] mx-auto w-full text-slate-900 font-sans shadow-md print:shadow-none print:border-none print:p-0 my-8 print:my-0 print:block print:w-full print:min-h-0 print:max-w-none">
        <div className="mb-10 border-b-2 border-slate-800 pb-6">
          <div className="flex justify-center mb-8 bg-[#fffafa]">
            <img src={logoUrl} alt="Tradeezer Logo" className="h-32 w-auto object-contain" />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                Proposta Comercial
              </p>
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center justify-end font-semibold text-black mb-1">
                <span className="mr-1">Ref:</span>
                <EditableInput
                  value={docState.ref}
                  onChange={(v) => setDocState((prev) => ({ ...prev, ref: v }))}
                  className="w-24 text-right font-semibold"
                />
              </div>
              <div className="flex items-center justify-end text-slate-600">
                <span className="mr-1">Data:</span>
                <EditableInput
                  value={docState.date}
                  onChange={(v) => setDocState((prev) => ({ ...prev, date: v }))}
                  className="w-24 text-right"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-10 text-sm">
          <div>
            <h3 className="font-bold uppercase tracking-wider text-black mb-3 border-b border-slate-200 pb-1 text-xs">
              CLIENTE
            </h3>
            <div className="space-y-1.5 text-slate-700 flex flex-col">
              <EditableInput
                value={docState.client}
                onChange={(v) => setDocState((prev) => ({ ...prev, client: v }))}
                className="text-base font-semibold text-black -ml-1"
                placeholder="Nome do Cliente"
              />
              <div className={cn('flex items-center', !docState.clientCnpj && 'print:hidden')}>
                <span className="mr-1 shrink-0">CNPJ/CPF:</span>
                <EditableInput
                  value={docState.clientCnpj}
                  onChange={(v) => setDocState((prev) => ({ ...prev, clientCnpj: v }))}
                  placeholder="Opcional"
                />
              </div>
              <div className={cn('flex items-center', !docState.clientContact && 'print:hidden')}>
                <span className="mr-1 shrink-0">A/C:</span>
                <EditableInput
                  value={docState.clientContact}
                  onChange={(v) => setDocState((prev) => ({ ...prev, clientContact: v }))}
                  placeholder="Opcional"
                />
              </div>
              <div className={cn('flex items-center', !docState.email && 'print:hidden')}>
                <span className="mr-1 shrink-0">Email:</span>
                <EditableInput
                  value={docState.email}
                  onChange={(v) => setDocState((prev) => ({ ...prev, email: v }))}
                  placeholder="Opcional"
                />
              </div>
              <div className={cn('flex items-center', !docState.phone && 'print:hidden')}>
                <span className="mr-1 shrink-0">Telefone:</span>
                <EditableInput
                  value={docState.phone}
                  onChange={(v) => setDocState((prev) => ({ ...prev, phone: v }))}
                  placeholder="Opcional"
                />
              </div>
              <div className={cn('flex items-start', !docState.clientAddress && 'print:hidden')}>
                <span className="mr-1 mt-1 shrink-0">Endereço:</span>
                <AutoResizeTextarea
                  value={docState.clientAddress}
                  onChange={(v) => setDocState((prev) => ({ ...prev, clientAddress: v }))}
                  placeholder="Opcional"
                  className="py-1"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-black mb-3 border-b border-slate-200 pb-1 text-xs">
              Detalhes do Projeto
            </h3>
            <div className="space-y-1.5 text-slate-700 flex flex-col">
              <div className={cn('flex items-center', !docState.serviceType && 'print:hidden')}>
                <span className="font-medium text-black mr-1 shrink-0">Serviço/Tipo:</span>
                <EditableInput
                  value={docState.serviceType}
                  onChange={(v) => setDocState((prev) => ({ ...prev, serviceType: v }))}
                  placeholder="Ex: Tradução Juramentada"
                />
              </div>
              <div className={cn('flex items-center', !docState.languages && 'print:hidden')}>
                <span className="font-medium text-black mr-1 shrink-0">Idiomas:</span>
                <EditableInput
                  value={docState.languages}
                  onChange={(v) => setDocState((prev) => ({ ...prev, languages: v }))}
                  placeholder="Ex: Inglês -> Português"
                />
              </div>
              <div className={cn('flex items-center', !docState.deadline && 'print:hidden')}>
                <span className="font-medium text-black mr-1 shrink-0">Previsão de Entrega:</span>
                <EditableInput
                  value={docState.deadline}
                  onChange={(v) => setDocState((prev) => ({ ...prev, deadline: v }))}
                  placeholder="DD/MM/AAAA"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10 print:break-inside-auto">
          <div className="flex justify-between items-end mb-4 border-b border-slate-200 pb-1">
            <h3 className="font-bold uppercase tracking-wider text-black text-xs">
              Discriminação de Serviços
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              className="print:hidden h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> Item
            </Button>
          </div>

          {docState.items.length > 0 ? (
            <table className="w-full text-sm border-collapse print:break-inside-auto">
              <thead>
                <tr className="border-b-2 border-slate-800 text-black">
                  <th className="py-2.5 text-left font-semibold w-[50%]">Descrição</th>
                  <th className="py-2.5 text-center font-semibold w-[15%]">Qtd</th>
                  <th className="py-2.5 text-right font-semibold w-[15%]">Valor Unit.</th>
                  <th className="py-2.5 text-right font-semibold w-[20%]">Subtotal</th>
                  <th className="py-2.5 w-8 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {docState.items.map((item) => (
                  <tr key={item.id} className="print:break-inside-avoid text-slate-700 group">
                    <td className="py-2 text-left pr-2 align-top">
                      <AutoResizeTextarea
                        value={item.description}
                        onChange={(v) => updateItem(item.id, 'description', v)}
                        placeholder="Descrição do serviço"
                      />
                    </td>
                    <td className="py-2 text-center align-top">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-16 bg-transparent text-center outline-none border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-1 print:border-transparent print:p-0"
                      />
                    </td>
                    <td className="py-2 text-right align-top">
                      <CurrencyInput
                        value={item.unitValue}
                        onChange={(v) => updateItem(item.id, 'unitValue', v)}
                      />
                    </td>
                    <td className="py-2 text-right font-medium text-black align-top">
                      <CurrencyInput
                        value={item.subtotal}
                        onChange={(v) => updateItem(item.id, 'subtotal', v)}
                      />
                    </td>
                    <td className="py-2 text-right print:hidden opacity-0 group-hover:opacity-100 transition-opacity align-top">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-slate-500 italic">
              Serviços cobrados de forma global (ver total abaixo).
            </p>
          )}
        </div>

        <div className="mb-10 print:break-inside-avoid">
          <div className="flex justify-between items-end mb-3 border-b border-slate-200 pb-1">
            <h3 className="font-bold uppercase tracking-wider text-black text-xs">
              Serviços Adicionais Inclusos
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDocState((prev) => ({
                  ...prev,
                  services: [
                    ...prev.services,
                    { id: Math.random().toString(36).substring(7), label: 'Novo Serviço' },
                  ],
                }))
              }
              className="print:hidden h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> Serviço
            </Button>
          </div>
          {docState.services.length > 0 ? (
            <ul className="list-none text-sm space-y-1.5 text-slate-700 columns-2">
              {docState.services.map((service) => (
                <li key={service.id} className="flex items-center group">
                  <span className="text-slate-400 mr-2">•</span>
                  <EditableInput
                    value={service.label}
                    onChange={(v) => {
                      setDocState((prev) => ({
                        ...prev,
                        services: prev.services.map((s) =>
                          s.id === service.id ? { ...s, label: v } : s,
                        ),
                      }))
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden shrink-0 ml-1"
                    onClick={() => {
                      setDocState((prev) => ({
                        ...prev,
                        services: prev.services.filter((s) => s.id !== service.id),
                      }))
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 italic print:hidden">Nenhum serviço adicional.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12 print:break-inside-avoid text-sm">
          <div className={cn('flex flex-col', !docState.observations && 'print:hidden')}>
            <h3 className="font-bold uppercase tracking-wider text-black mb-3 border-b border-slate-200 pb-1 text-xs">
              Observações
            </h3>
            <AutoResizeTextarea
              value={docState.observations}
              onChange={(v) => setDocState((prev) => ({ ...prev, observations: v }))}
              placeholder="Observações do projeto..."
              className="text-slate-700 leading-relaxed -ml-1"
            />
          </div>
          <div className={cn('flex flex-col', !docState.paymentMethod && 'print:hidden')}>
            <h3 className="font-bold uppercase tracking-wider text-black mb-3 border-b border-slate-200 pb-1 text-xs">
              Condições de Pagamento
            </h3>
            <AutoResizeTextarea
              value={docState.paymentMethod}
              onChange={(v) => setDocState((prev) => ({ ...prev, paymentMethod: v }))}
              placeholder="Condições de pagamento..."
              className="text-slate-700 leading-relaxed -ml-1"
            />
          </div>
        </div>

        <div className="flex justify-end print:break-inside-avoid">
          <div className="w-1/2 border-t-2 border-slate-800 pt-4 flex justify-between items-end">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
              Valor Total
            </div>
            <div className="text-3xl font-bold text-black flex items-center justify-end w-48">
              {docState.items.length === 0 ? (
                <CurrencyInput
                  value={docState.globalValue}
                  onChange={(v) => setDocState((prev) => ({ ...prev, globalValue: v }))}
                  className="text-3xl font-bold text-black h-auto leading-none text-right"
                />
              ) : (
                <span>{formatCurrency(total)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
