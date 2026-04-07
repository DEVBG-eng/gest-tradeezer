onRecordDeleteRequest((e) => {
  const auth = e.auth
  if (!auth) {
    e.next()
    return
  }

  const projetoId = e.record.get('projeto')
  const descricao = e.record.get('descricao') || ''

  e.next()

  try {
    const histCol = $app.findCollectionByNameOrId('HistoricoAtividade')
    const histRec = new Record(histCol)
    histRec.set('projeto', projetoId)
    histRec.set('usuario', auth.id)
    histRec.set('acao', 'Item removido do projeto')
    histRec.set('detalhes', descricao)
    $app.saveNoValidate(histRec)
  } catch (err) {
    console.log('Error saving item history delete:', err)
  }
}, 'ItensProjeto')
