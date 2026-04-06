migrate(
  (app) => {
    const collection = new Collection({
      name: 'CustosProjeto',
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
        { name: 'freelancer', type: 'text', required: true },
        { name: 'custo_documento', type: 'number' },
        { name: 'custo_laudas', type: 'number' },
        { name: 'custo_frete', type: 'number' },
        { name: 'custo_envio_cartorio', type: 'number' },
        { name: 'custo_cartorio', type: 'number' },
        { name: 'custo_apostilamento', type: 'number' },
        { name: 'custo_reconhecimento', type: 'number' },
        { name: 'custo_envio_cliente', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_custos_projeto ON CustosProjeto (projeto)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('CustosProjeto')
    app.delete(collection)
  },
)
