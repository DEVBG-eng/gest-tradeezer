migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('Projetos')
    const field = collection.fields.getByName('status')
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
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('Projetos')
    const field = collection.fields.getByName('status')
    field.values = [
      'Aguardando',
      'Em Andamento',
      'Em Revisão',
      'Cartório',
      'Concluído',
      'Atrasado/Bloqueado',
    ]
    app.save(collection)
  },
)
