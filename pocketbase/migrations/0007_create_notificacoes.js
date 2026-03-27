migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    const projetosCol = app.findCollectionByNameOrId('Projetos')

    const collection = new Collection({
      name: 'Notificacoes',
      type: 'base',
      listRule: "@request.auth.id != '' && usuario = @request.auth.id",
      viewRule: "@request.auth.id != '' && usuario = @request.auth.id",
      createRule: null,
      updateRule: "@request.auth.id != '' && usuario = @request.auth.id",
      deleteRule: "@request.auth.id != '' && usuario = @request.auth.id",
      fields: [
        {
          name: 'usuario',
          type: 'relation',
          required: true,
          collectionId: usersCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'titulo', type: 'text', required: true },
        { name: 'mensagem', type: 'text', required: true },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['entrega', 'projeto_novo', 'solicitacao', 'sistema'],
          maxSelect: 1,
        },
        { name: 'lida', type: 'bool' },
        {
          name: 'projeto',
          type: 'relation',
          required: false,
          collectionId: projetosCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_notificacoes_usuario ON Notificacoes (usuario)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('Notificacoes')
    app.delete(collection)
  },
)
