migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    if (!col.fields.getByName('pasta_url')) {
      col.fields.add(new TextField({ name: 'pasta_url' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    col.fields.removeByName('pasta_url')
    app.save(col)
  },
)
