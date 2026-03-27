migrate(
  (app) => {
    const collection = new Collection({
      name: 'Clientes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'cnpj', type: 'text' },
        { name: 'endereco', type: 'text' },
        { name: 'valor_lauda_padrao', type: 'number' },
        { name: 'valor_documento_padrao', type: 'number' },
        { name: 'idiomas_frequentes', type: 'text' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('Clientes')
    app.delete(collection)
  },
)
