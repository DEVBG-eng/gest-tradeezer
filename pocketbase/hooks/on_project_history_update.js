onRecordUpdateRequest((e) => {
  const auth = e.auth
  if (!auth) {
    e.next()
    return
  }

  const body = e.requestInfo().body || {}
  const newStatus = body.status
  const hasLaudasChange = body.qtd_laudas !== undefined || body.valor_lauda !== undefined

  e.next()

  try {
    const histCol = $app.findCollectionByNameOrId('HistoricoAtividade')
    const histRec = new Record(histCol)
    histRec.set('projeto', e.record.id)
    histRec.set('usuario', auth.id)

    let acao = 'Projeto atualizado'
    let detalhes = ''

    if (newStatus) {
      acao = 'Status alterado para ' + newStatus
    } else if (hasLaudasChange) {
      acao = 'Orçamento do projeto atualizado'
    } else if (body.data_entrega !== undefined) {
      acao = 'Data de entrega alterada'
      detalhes = 'Nova data: ' + body.data_entrega
    }

    histRec.set('acao', acao)
    if (detalhes) histRec.set('detalhes', detalhes)

    $app.saveNoValidate(histRec)
  } catch (err) {
    console.log('Error saving project history update:', err)
  }
}, 'Projetos')
