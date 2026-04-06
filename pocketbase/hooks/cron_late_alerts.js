cronAdd('late_alerts', '0 17 * * *', () => {
  try {
    const today = new Date().toISOString().substring(0, 10)
    const start = today + ' 00:00:00.000Z'
    const end = today + ' 23:59:59.999Z'
    const projects = $app.findRecordsByFilter(
      'Projetos',
      `data_entrega >= '${start}' && data_entrega <= '${end}' && status != 'Concluído' && status != 'Entregue' && status != 'Cancelado'`,
      '',
      1000,
      0,
    )

    if (projects.length > 0) {
      const users = $app.findRecordsByFilter('users', '1=1', '', 100, 0)
      projects.forEach((p) => {
        users.forEach((u) => {
          const notif = new Record($app.findCollectionByNameOrId('Notificacoes'))
          notif.set('usuario', u.id)
          notif.set('titulo', 'PROJETO ATRASADO!')
          notif.set(
            'mensagem',
            `O projeto ${p.get('cod_referencia')} (${p.get('cliente')}) não foi concluído até as 17:00.`,
          )
          notif.set('tipo', 'sistema')
          notif.set('lida', false)
          notif.set('projeto', p.id)
          $app.save(notif)
        })
      })
    }
  } catch (e) {
    console.log('Erro no cron late_alerts:', e)
  }
})
