migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('Projetos')

    if (!collection.fields.getByName('apostilamento_digital')) {
      collection.fields.add(new BoolField({ name: 'apostilamento_digital' }))
    }
    if (!collection.fields.getByName('apostilamento_fisico')) {
      collection.fields.add(new BoolField({ name: 'apostilamento_fisico' }))
    }
    if (!collection.fields.getByName('autenticacao_digital')) {
      collection.fields.add(new BoolField({ name: 'autenticacao_digital' }))
    }

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('Projetos')

    collection.fields.removeByName('apostilamento_digital')
    collection.fields.removeByName('apostilamento_fisico')
    collection.fields.removeByName('autenticacao_digital')

    app.save(collection)
  },
)
