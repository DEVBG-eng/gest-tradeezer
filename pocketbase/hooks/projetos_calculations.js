onRecordCreate((e) => {
  const qtd = e.record.get('qtd_laudas') || 0
  const val = e.record.get('valor_lauda') || 0
  e.record.set('valor_total', qtd * val)
  e.next()
}, 'Projetos')

onRecordUpdate((e) => {
  const qtd = e.record.get('qtd_laudas') || 0
  const val = e.record.get('valor_lauda') || 0
  e.record.set('valor_total', qtd * val)
  e.next()
}, 'Projetos')
