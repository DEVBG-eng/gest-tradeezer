migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('CustosProjeto')

    if (!col.fields.getByName('imposto')) col.fields.add(new NumberField({ name: 'imposto' }))
    if (!col.fields.getByName('custo_assinatura_tradutor'))
      col.fields.add(new NumberField({ name: 'custo_assinatura_tradutor' }))
    if (!col.fields.getByName('custo_link_cartao'))
      col.fields.add(new NumberField({ name: 'custo_link_cartao' }))
    if (!col.fields.getByName('comissao_venda'))
      col.fields.add(new NumberField({ name: 'comissao_venda' }))
    if (!col.fields.getByName('comissao_secundaria'))
      col.fields.add(new NumberField({ name: 'comissao_secundaria' }))
    if (!col.fields.getByName('custo_revisao'))
      col.fields.add(new NumberField({ name: 'custo_revisao' }))
    if (!col.fields.getByName('custo_diagramacao'))
      col.fields.add(new NumberField({ name: 'custo_diagramacao' }))

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('CustosProjeto')

    col.fields.removeByName('imposto')
    col.fields.removeByName('custo_assinatura_tradutor')
    col.fields.removeByName('custo_link_cartao')
    col.fields.removeByName('comissao_venda')
    col.fields.removeByName('comissao_secundaria')
    col.fields.removeByName('custo_revisao')
    col.fields.removeByName('custo_diagramacao')

    app.save(col)
  },
)
