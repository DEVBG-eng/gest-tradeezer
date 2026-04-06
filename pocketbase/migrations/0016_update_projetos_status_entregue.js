migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    const field = col.fields.getByName('status')
    field.values = [
      'Orçamento',
      'Aprovado',
      'Aguardando',
      'Em Andamento',
      'Em Revisão',
      'Cartório',
      'Concluído',
      'Entregue',
      'Atrasado/Bloqueado',
      'Cancelado',
      'Não Aprovado',
    ]
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    const field = col.fields.getByName('status')
    field.values = [
      'Orçamento',
      'Aprovado',
      'Aguardando',
      'Em Andamento',
      'Em Revisão',
      'Cartório',
      'Concluído',
      'Atrasado/Bloqueado',
      'Cancelado',
      'Não Aprovado',
    ]
    app.save(col)
  },
)
