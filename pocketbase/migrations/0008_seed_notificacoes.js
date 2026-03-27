migrate(
  (app) => {
    const notifCol = app.findCollectionByNameOrId('Notificacoes')

    let user
    try {
      user = app.findAuthRecordByEmail('users', 'financeiro@tradeezer.com')
    } catch (e) {
      return
    }

    let projetos = []
    try {
      projetos = app.findRecordsByFilter('Projetos', "id != ''", '-created', 1, 0)
    } catch (e) {}

    const projetoId = projetos.length > 0 ? projetos[0].id : null

    const n1 = new Record(notifCol)
    n1.set('usuario', user.id)
    n1.set('titulo', 'Novo Projeto Registrado')
    n1.set('mensagem', 'Um novo projeto de tradução foi adicionado ao sistema.')
    n1.set('tipo', 'projeto_novo')
    n1.set('lida', false)
    if (projetoId) n1.set('projeto', projetoId)
    app.save(n1)

    const n2 = new Record(notifCol)
    n2.set('usuario', user.id)
    n2.set('titulo', 'Prazo de Entrega Próximo')
    n2.set('mensagem', 'O projeto vence amanhã. Por favor, verifique o status.')
    n2.set('tipo', 'entrega')
    n2.set('lida', false)
    if (projetoId) n2.set('projeto', projetoId)
    app.save(n2)

    const n3 = new Record(notifCol)
    n3.set('usuario', user.id)
    n3.set('titulo', 'Solicitação de Revisão')
    n3.set('mensagem', 'Os documentos do projeto precisam de sua aprovação.')
    n3.set('tipo', 'solicitacao')
    n3.set('lida', false)
    if (projetoId) n3.set('projeto', projetoId)
    app.save(n3)
  },
  (app) => {
    try {
      app.db().newQuery('DELETE FROM Notificacoes').execute()
    } catch (e) {}
  },
)
