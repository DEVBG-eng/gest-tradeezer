onRecordCreateRequest((e) => {
  e.next()

  const auth = e.auth
  if (!auth) return

  try {
    const histCol = $app.findCollectionByNameOrId('HistoricoAtividade')
    const histRec = new Record(histCol)
    histRec.set('projeto', e.record.id)
    histRec.set('usuario', auth.id)
    histRec.set('acao', 'Projeto criado')
    $app.saveNoValidate(histRec)
  } catch (err) {
    console.log('Error saving project history create:', err)
  }
}, 'Projetos')
