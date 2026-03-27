migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    const clientesCol = app.findCollectionByNameOrId('Clientes')
    col.fields.add(
      new RelationField({
        name: 'cliente_ref',
        collectionId: clientesCol.id,
        maxSelect: 1,
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    col.fields.removeByName('cliente_ref')
    app.save(col)
  },
)
