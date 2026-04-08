import { useEffect, useRef, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import logoUrl from '@/assets/logo-para-orcamento-fe7a9.png'
import * as htmlToImage from 'html-to-image'

export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ProposalPrintTemplate({
  project,
  items,
  orcamento,
  autoGenerateJPG,
  onClose,
}: any) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoGenerateJPG && containerRef.current) {
      const timer = setTimeout(() => {
        htmlToImage
          .toJpeg(containerRef.current!, {
            quality: 0.95,
            backgroundColor: '#ffffff',
            pixelRatio: 2,
          })
          .then((dataUrl) => {
            const link = document.createElement('a')
            const refId = project?.cod_referencia || project?.id || orcamento?.id || 'Tradeezer'
            link.download = `Orcamento_${refId.replace('TRD-', '')}.jpg`
            link.href = dataUrl
            link.click()
          })
          .catch((err) => {
            console.error('Failed to generate JPG', err)
          })
          .finally(() => {
            if (onClose) onClose()
          })
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [autoGenerateJPG, onClose, project, orcamento])

  const clientName =
    orcamento?.cliente_nome ||
    project?.client ||
    project?.expand?.cliente?.nome_fantasia ||
    project?.expand?.cliente?.razao_social ||
    'CLIENTE NÃO INFORMADO'
  const clientEmail = orcamento?.cliente_email || project?.expand?.cliente?.email || '-'
  const clientPhone = orcamento?.cliente_telefone || project?.expand?.cliente?.telefone || '-'
  const ref = project?.cod_referencia || project?.id || orcamento?.id || '----'

  const rawItems = items || project?.items || orcamento?.itens || []

  const printItems = useMemo(() => {
    return [...rawItems].sort((a: any, b: any) => {
      const dateA = a.created || a.created_at
      const dateB = b.created || b.created_at
      if (dateA && dateB) return new Date(dateA).getTime() - new Date(dateB).getTime()
      return (a.id || '').localeCompare(b.id || '')
    })
  }, [rawItems])

  const total = useMemo(() => {
    return printItems.reduce((acc: number, item: any) => {
      const itemTotal =
        item.subtotal ||
        item.total ||
        item.valor_total ||
        (item.laudas || item.quantidade || 0) * (item.valorLauda || item.valor_unitario || 0)
      return acc + Number(itemTotal)
    }, 0)
  }, [printItems])

  return (
    <div
      ref={containerRef}
      id="orcamento-preview"
      className="bg-white p-10 mx-auto text-slate-800 font-sans shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 w-[800px] min-h-[1100px] relative"
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <img src={logoUrl} alt="Tradeezer" className="h-20 object-contain mb-6" />
        <div className="w-full border-b border-slate-200 pb-4 text-center">
          <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
            Orçamento Comercial
          </h1>
          <p className="text-sm text-slate-500 mt-1">Tradeezer - Sua comunicação com o mundo</p>
        </div>
      </div>

      {/* Client & Reference Info */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Dados do Cliente
          </h3>
          <p className="font-bold text-slate-800 text-lg mb-1">{clientName}</p>
          <div className="space-y-1 text-sm text-slate-600 mt-2">
            <p>
              <span className="font-medium">Email:</span> {clientEmail}
            </p>
            <p>
              <span className="font-medium">Telefone:</span> {clientPhone}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Referência
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="flex justify-between">
              <span className="font-medium text-slate-700">Código:</span>
              <span className="font-bold text-slate-800">TRD-{ref.replace('TRD-', '')}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-slate-700">Data:</span>
              <span>{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </p>
            {project?.dueDate && (
              <p className="flex justify-between">
                <span className="font-medium text-slate-700">Prazo Estimado:</span>
                <span>{format(new Date(project.dueDate), 'dd/MM/yyyy')}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Serviços Orçados
        </h3>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-slate-50">
                <TableHead className="font-bold text-slate-700 py-3">
                  Descrição do Serviço
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700 py-3">Qtd.</TableHead>
                <TableHead className="text-right font-bold text-slate-700 py-3">
                  Valor Unit.
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 py-3">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {printItems.length > 0 ? (
                printItems.map((item: any, idx: number) => {
                  const qtd = Number(item.laudas || item.quantidade || 0)
                  const vUnit = Number(item.valorLauda || item.valor_unitario || 0)
                  const itemTotal = Number(
                    item.subtotal || item.total || item.valor_total || qtd * vUnit,
                  )

                  return (
                    <TableRow
                      key={item.id || idx}
                      className="hover:bg-transparent border-b border-slate-100 last:border-0"
                    >
                      <TableCell className="py-4 font-medium text-slate-700">
                        {item.description || item.descricao}
                      </TableCell>
                      <TableCell className="py-4 text-center text-slate-600">{qtd}</TableCell>
                      <TableCell className="py-4 text-right text-slate-600">
                        {formatCurrency(vUnit)}
                      </TableCell>
                      <TableCell className="py-4 text-right font-bold text-slate-800">
                        {formatCurrency(itemTotal)}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Nenhum item adicionado ao orçamento
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-12">
        <div className="w-72 bg-emerald-50 rounded-xl p-5 border border-emerald-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-emerald-800 uppercase tracking-widest">
              Valor Total
            </span>
            <span className="text-2xl font-black text-emerald-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Footer Footer */}
      <div className="absolute bottom-10 left-10 right-10 border-t border-slate-200 pt-6 text-center">
        <p className="text-xs text-slate-500 mb-1">
          Este orçamento é válido por 15 dias a partir da data de emissão.
        </p>
        <p className="text-xs text-slate-400">Tradeezer Traduções e Serviços Administrativos</p>
      </div>
    </div>
  )
}
