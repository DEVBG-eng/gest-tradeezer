onRecordAfterCreateSuccess((e) => {
  const project = e.record
  const users = $app.findRecordsByFilter('users', "id != ''", '', 100, 0)
  const notifCol = $app.findCollectionByNameOrId('Notificacoes')

  for (let i = 0; i < users.length; i++) {
    const n = new Record(notifCol)
    n.set('usuario', users[i].id)
    n.set('titulo', 'Novo Projeto: ' + (project.get('cod_referencia') || project.id))
    n.set(
      'mensagem',
      'Um novo projeto para o cliente ' +
        (project.get('cliente') || 'não informado') +
        ' foi registrado.',
    )
    n.set('tipo', 'projeto_novo')
    n.set('lida', false)
    n.set('projeto', project.id)
    $app.save(n)
  }
  e.next()
}, 'Projetos')
