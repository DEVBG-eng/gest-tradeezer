onRecordUpdateRequest((e) => {
  const body = e.requestInfo().body
  if (body.status) {
    try {
      const oldRecord = $app.findRecordById('Projetos', e.record.id)
      if (oldRecord.get('status') !== 'Aprovado' && body.status === 'Aprovado') {
        e.set('triggerAprovado', true)
      }
      if (oldRecord.get('status') !== 'Aguardando' && body.status === 'Aguardando') {
        e.set('triggerAguardando', true)
      }
    } catch (err) {}
  }
  e.next()
}, 'Projetos')

onRecordAfterUpdateSuccess((e) => {
  if (e.get('triggerAprovado')) {
    try {
      const users = $app.findRecordsByFilter('users', '1=1', '', 100, 0)
      const prazoData = e.record.get('data_entrega')
      const prazo = prazoData ? prazoData.substring(0, 10) : 'Não definido'

      users.forEach((u) => {
        const notif = new Record($app.findCollectionByNameOrId('Notificacoes'))
        notif.set('usuario', u.id)
        notif.set('titulo', 'Projeto Aprovado!')
        notif.set(
          'mensagem',
          `O projeto ${e.record.get('cod_referencia')} (${e.record.get('cliente')}) foi aprovado. Prazo: ${prazo}`,
        )
        notif.set('tipo', 'projeto_novo')
        notif.set('lida', false)
        notif.set('projeto', e.record.id)
        $app.save(notif)
      })
    } catch (err) {
      console.log('Erro ao gerar notificacao de aprovacao:', err)
    }
  }

  if (e.get('triggerAguardando')) {
    try {
      const notifs = $app.findRecordsByFilter(
        'Notificacoes',
        `projeto = '${e.record.id}' && tipo = 'projeto_novo'`,
        '',
        100,
        0,
      )
      notifs.forEach((n) => {
        n.set('lida', true)
        $app.save(n)
      })
    } catch (err) {
      console.log('Erro ao limpar notificacoes:', err)
    }
  }
  e.next()
}, 'Projetos')
