migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('CustosProjeto')

    if (!col.fields.getByName('emissao_certidao')) {
      col.fields.add(new NumberField({ name: 'emissao_certidao' }))
    }
    if (!col.fields.getByName('observacoes_extras')) {
      col.fields.add(new TextField({ name: 'observacoes_extras' }))
    }
    if (!col.fields.getByName('custo_portador')) {
      col.fields.add(new NumberField({ name: 'custo_portador' }))
    }
    if (!col.fields.getByName('custo_copia_autenticada')) {
      col.fields.add(new NumberField({ name: 'custo_copia_autenticada' }))
    }
    if (!col.fields.getByName('autenticacao_digital')) {
      col.fields.add(new NumberField({ name: 'autenticacao_digital' }))
    }
    if (!col.fields.getByName('percentual_custo_operacional')) {
      col.fields.add(new NumberField({ name: 'percentual_custo_operacional' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('CustosProjeto')

    col.fields.removeByName('emissao_certidao')
    col.fields.removeByName('observacoes_extras')
    col.fields.removeByName('custo_portador')
    col.fields.removeByName('custo_copia_autenticada')
    col.fields.removeByName('autenticacao_digital')
    col.fields.removeByName('percentual_custo_operacional')

    app.save(col)
  },
)
