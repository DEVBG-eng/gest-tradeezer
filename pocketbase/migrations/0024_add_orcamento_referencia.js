migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('orcamentos')
    if (!col.fields.getByName('cod_referencia')) {
      col.fields.add(new TextField({ name: 'cod_referencia' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('orcamentos')
    col.fields.removeByName('cod_referencia')
    app.save(col)
  },
)
