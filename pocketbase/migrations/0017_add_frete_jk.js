migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    col.fields.add(new BoolField({ name: 'frete_jk' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    col.fields.removeByName('frete_jk')
    app.save(col)
  },
)
