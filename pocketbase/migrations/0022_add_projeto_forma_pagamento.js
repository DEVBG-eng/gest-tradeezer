migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    if (!col.fields.getByName('forma_pagamento')) {
      col.fields.add(new TextField({ name: 'forma_pagamento' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    col.fields.removeByName('forma_pagamento')
    app.save(col)
  },
)
