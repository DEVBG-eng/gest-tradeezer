migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    col.addIndex('idx_projetos_status', false, 'status', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    col.removeIndex('idx_projetos_status')
    app.save(col)
  },
)
