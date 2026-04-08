migrate(
  (app) => {
    const orcamentos = new Collection({
      name: 'orcamentos',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != '' && user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'cliente_nome', type: 'text', required: true },
        { name: 'cliente_email', type: 'email', required: true },
        { name: 'cliente_telefone', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_orcamentos_user_id ON orcamentos (user_id)'],
    })
    app.save(orcamentos)

    const orcamento_itens = new Collection({
      name: 'orcamento_itens',
      type: 'base',
      listRule: "@request.auth.id != '' && orcamento_id.user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && orcamento_id.user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && orcamento_id.user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && orcamento_id.user_id = @request.auth.id",
      fields: [
        {
          name: 'orcamento_id',
          type: 'relation',
          required: true,
          collectionId: orcamentos.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text', required: true },
        { name: 'quantidade', type: 'number', required: true, min: 1 },
        { name: 'valor_unitario', type: 'number', required: true, min: 0 },
        { name: 'subtotal', type: 'number', required: true, min: 0 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_orcamento_itens_orcamento_id ON orcamento_itens (orcamento_id)'],
    })
    app.save(orcamento_itens)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('orcamento_itens'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('orcamentos'))
    } catch (_) {}
  },
)
