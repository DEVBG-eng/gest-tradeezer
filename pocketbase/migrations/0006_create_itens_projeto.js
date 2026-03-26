migrate(
  (app) => {
    const collection = new Collection({
      name: 'ItensProjeto',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'projeto',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('Projetos').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text', required: true },
        { name: 'qtd_laudas', type: 'number', required: true, min: 0 },
        { name: 'valor_lauda', type: 'number', required: true, min: 0 },
        { name: 'valor_total', type: 'number', required: true, min: 0 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_itensprojeto_projeto ON ItensProjeto (projeto)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('ItensProjeto')
    app.delete(collection)
  },
)
