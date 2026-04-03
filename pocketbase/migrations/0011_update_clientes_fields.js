migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Clientes')

    const textFields = [
      'razao_social',
      'prospeccao',
      'forma_pagamento',
      'ramo',
      'contato',
      'email',
      'telefone',
      'informacoes_frete',
    ]

    for (const name of textFields) {
      if (!col.fields.getByName(name)) {
        col.fields.add(new TextField({ name: name }))
      }
    }

    const numberFields = [
      'valor_certidao_digital',
      'valor_procuracao_digital',
      'valor_certidao_fisica',
      'valor_procuracao_fisica',
      'valor_frete',
    ]

    for (const name of numberFields) {
      if (!col.fields.getByName(name)) {
        col.fields.add(new NumberField({ name: name }))
      }
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Clientes')

    const fieldsToRemove = [
      'razao_social',
      'prospeccao',
      'forma_pagamento',
      'ramo',
      'contato',
      'email',
      'telefone',
      'informacoes_frete',
      'valor_certidao_digital',
      'valor_procuracao_digital',
      'valor_certidao_fisica',
      'valor_procuracao_fisica',
      'valor_frete',
    ]

    for (const name of fieldsToRemove) {
      const field = col.fields.getByName(name)
      if (field) {
        col.fields.removeByName(name)
      }
    }

    app.save(col)
  },
)
