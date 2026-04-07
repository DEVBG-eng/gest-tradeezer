migrate(
  (app) => {
    const collection = new Collection({
      name: 'HistoricoAtividade',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'projeto',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('Projetos').id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'usuario',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('users').id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'acao', type: 'text', required: true },
        { name: 'detalhes', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_historico_projeto ON HistoricoAtividade (projeto)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('HistoricoAtividade')
    app.delete(collection)
  },
)
