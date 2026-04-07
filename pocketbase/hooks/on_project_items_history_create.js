onRecordCreateRequest((e) => {
  const auth = e.auth
  if (!auth) {
    e.next()
    return
  }

  e.next()

  try {
    const histCol = $app.findCollectionByNameOrId('HistoricoAtividade')
    const histRec = new Record(histCol)
    histRec.set('projeto', e.record.get('projeto'))
    histRec.set('usuario', auth.id)
    histRec.set('acao', 'Item adicionado ao projeto')
    histRec.set('detalhes', e.record.get('descricao') || '')
    $app.saveNoValidate(histRec)
  } catch (err) {
    console.log('Error saving item history create:', err)
  }
}, 'ItensProjeto')
