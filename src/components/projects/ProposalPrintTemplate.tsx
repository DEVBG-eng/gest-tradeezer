import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import logoUrl from '@/assets/image-ab962.png'
import { CheckCircle2, XCircle } from 'lucide-react'

export function ProposalPrintTemplate({ project, items }: any) {
  const isInternacional =
    (project?.idioma_origem && project.idioma_origem.toLowerCase() !== 'português') ||
    (project?.idioma_destino && project.idioma_destino.toLowerCase() !== 'português')

  const additionalServices = [
    { label: 'Urgente', active: project?.urgente },
    { label: 'Internacional', active: isInternacional },
    { label: 'Via Digital', active: project?.digital },
    { label: 'Via Física', active: project?.fisico },
    { label: 'Apostilamento de Haia', active: project?.apostilamento },
    { label: 'Apostilamento Digital', active: project?.apostilamento_digital },
    { label: 'Apostilamento Físico', active: project?.apostilamento_fisico },
    { label: 'Reconhecimento', active: project?.reconhecimento },
    { label: 'Autenticação documento Digital', active: project?.autenticacao_digital },
    { label: 'Frete', active: project?.frete },
    { label: 'DHL (Exterior)', active: project?.dhl },
  ]

  const total =
    items?.reduce(
      (acc: number, item: any) =>
        acc + (item.valor_total || item.quantidade * item.valor_unitario || 0),
      0,
    ) || 0

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto text-slate-800 font-sans shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <img src={logoUrl} alt="Tradeezer" className="h-24 object-contain mb-8" />

        <div className="w-full flex justify-between items-end border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-medium text-slate-800">Orçamento Comercial</h1>
          <div className="text-right text-sm text-slate-500">
            <p className="font-medium text-slate-700 mb-1">
              Ref:{' '}
              <span className="font-bold text-slate-800">
                TRD-{project?.cod_referencia || '----'}
              </span>
            </p>
            <p>Data: {format(new Date(), 'dd/MM/yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Client & Service Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Para</h3>
          <p className="font-bold text-slate-800 text-lg mb-2 uppercase">
            {project?.expand?.cliente?.nome_fantasia ||
              project?.expand?.cliente?.razao_social ||
              'CLIENTE NÃO INFORMADO'}
          </p>
          <p className="text-sm text-slate-600">Status: {project?.status}</p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Detalhes do Serviço
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-700">Categoria:</span>{' '}
              {project?.tipo_servico || '-'}
            </p>
            <p>
              <span className="font-medium text-slate-700">Idiomas:</span>{' '}
              {project?.idioma_origem || '-'} &rarr; {project?.idioma_destino || '-'}
            </p>
            <p>
              <span className="font-medium text-slate-700">Tipo de Documento:</span>{' '}
              {project?.tipo_documento || 'Não definido'}
            </p>
            <p>
              <span className="font-medium text-slate-700">Qtd. Documentos:</span>{' '}
              {project?.qtd_documentos || '1'}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Box */}
      <div className="bg-slate-50 rounded-xl p-6 grid grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Data de Entrada
          </h3>
          <p className="font-bold text-slate-800 text-base">
            {project?.data_entrada ? format(new Date(project.data_entrada), 'dd/MM/yyyy') : '-'}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Prazo Estimado
          </h3>
          <p className="font-bold text-slate-800 text-base">
            {project?.data_entrega ? format(new Date(project.data_entrega), 'dd/MM/yyyy') : '-'}
          </p>
        </div>
      </div>

      {/* Project Items Table */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Itens do Projeto
        </h3>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 hover:bg-transparent">
              <TableHead className="font-bold text-slate-500 h-10 px-0">Item / Descrição</TableHead>
              <TableHead className="text-center font-bold text-slate-500 h-10">
                Qtd. Laudas
              </TableHead>
              <TableHead className="text-right font-bold text-slate-500 h-10">
                Valor Unitário
              </TableHead>
              <TableHead className="text-right font-bold text-slate-500 h-10 px-0">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.length > 0 ? (
              items.map((item: any) => {
                const itemTotal = item.valor_total || item.quantidade * item.valor_unitario || 0
                return (
                  <TableRow
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-transparent"
                  >
                    <TableCell className="py-4 font-bold text-slate-800 px-0">
                      {item.descricao}
                    </TableCell>
                    <TableCell className="py-4 text-center text-slate-600">
                      {item.quantidade}
                    </TableCell>
                    <TableCell className="py-4 text-right text-slate-600">
                      {formatCurrency(item.valor_unitario)}
                    </TableCell>
                    <TableCell className="py-4 text-right font-bold text-slate-800 px-0">
                      {formatCurrency(itemTotal)}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="text-center py-6 text-slate-500 px-0">
                  Nenhum item adicionado ao orçamento
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {items?.length > 0 && (
          <div className="flex justify-end mt-6">
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                Total
              </span>
              <span className="text-xl font-bold text-slate-800">{formatCurrency(total)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Additional Services Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">
          Serviços Adicionais e Logística
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
          {additionalServices.map((service, index) => (
            <div key={index} className="flex items-center gap-3">
              {service.active ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={2} />
              ) : (
                <XCircle className="w-5 h-5 text-slate-200 shrink-0" strokeWidth={1.5} />
              )}
              <span
                className={`text-sm ${service.active ? 'text-slate-800 font-medium' : 'text-slate-400'}`}
              >
                {service.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
