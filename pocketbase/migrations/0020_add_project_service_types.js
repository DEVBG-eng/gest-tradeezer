migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')

    if (!col.fields.getByName('certidao')) col.fields.add(new BoolField({ name: 'certidao' }))
    if (!col.fields.getByName('divorcio')) col.fields.add(new BoolField({ name: 'divorcio' }))
    if (!col.fields.getByName('declaracao')) col.fields.add(new BoolField({ name: 'declaracao' }))
    if (!col.fields.getByName('procuracao')) col.fields.add(new BoolField({ name: 'procuracao' }))
    if (!col.fields.getByName('certidao_objeto_pe'))
      col.fields.add(new BoolField({ name: 'certidao_objeto_pe' }))

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')

    col.fields.removeByName('certidao')
    col.fields.removeByName('divorcio')
    col.fields.removeByName('declaracao')
    col.fields.removeByName('procuracao')
    col.fields.removeByName('certidao_objeto_pe')

    app.save(col)
  },
)
