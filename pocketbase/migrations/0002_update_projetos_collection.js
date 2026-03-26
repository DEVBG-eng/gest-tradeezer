migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')

    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    col.createRule = "@request.auth.id != ''"
    col.updateRule = "@request.auth.id != ''"
    col.deleteRule = "@request.auth.id != ''"

    if (!col.fields.getByName('cod_referencia'))
      col.fields.add(new TextField({ name: 'cod_referencia', required: true }))
    if (!col.fields.getByName('cliente'))
      col.fields.add(new TextField({ name: 'cliente', required: true }))
    if (!col.fields.getByName('status'))
      col.fields.add(
        new SelectField({
          name: 'status',
          required: true,
          values: [
            'Aguardando',
            'Em Andamento',
            'Em Revisão',
            'Cartório',
            'Concluído',
            'Atrasado/Bloqueado',
          ],
          maxSelect: 1,
        }),
      )
    if (!col.fields.getByName('qtd_laudas'))
      col.fields.add(new NumberField({ name: 'qtd_laudas', min: 0 }))
    if (!col.fields.getByName('valor_lauda'))
      col.fields.add(new NumberField({ name: 'valor_lauda', min: 0 }))
    if (!col.fields.getByName('valor_total'))
      col.fields.add(new NumberField({ name: 'valor_total' }))
    if (!col.fields.getByName('data_entrega'))
      col.fields.add(new DateField({ name: 'data_entrega' }))
    if (!col.fields.getByName('data_entrada'))
      col.fields.add(new DateField({ name: 'data_entrada' }))
    if (!col.fields.getByName('tipo_servico'))
      col.fields.add(new TextField({ name: 'tipo_servico' }))
    if (!col.fields.getByName('idioma_origem'))
      col.fields.add(new TextField({ name: 'idioma_origem' }))
    if (!col.fields.getByName('idioma_destino'))
      col.fields.add(new TextField({ name: 'idioma_destino' }))
    if (!col.fields.getByName('tipo_documento'))
      col.fields.add(new TextField({ name: 'tipo_documento' }))
    if (!col.fields.getByName('qtd_documentos'))
      col.fields.add(new NumberField({ name: 'qtd_documentos' }))
    if (!col.fields.getByName('urgente')) col.fields.add(new BoolField({ name: 'urgente' }))
    if (!col.fields.getByName('internacional'))
      col.fields.add(new BoolField({ name: 'internacional' }))
    if (!col.fields.getByName('fisico')) col.fields.add(new BoolField({ name: 'fisico' }))
    if (!col.fields.getByName('digital')) col.fields.add(new BoolField({ name: 'digital' }))
    if (!col.fields.getByName('apostilamento'))
      col.fields.add(new BoolField({ name: 'apostilamento' }))
    if (!col.fields.getByName('reconhecimento'))
      col.fields.add(new BoolField({ name: 'reconhecimento' }))
    if (!col.fields.getByName('frete')) col.fields.add(new BoolField({ name: 'frete' }))
    if (!col.fields.getByName('dhl')) col.fields.add(new BoolField({ name: 'dhl' }))
    if (!col.fields.getByName('observacoes')) col.fields.add(new TextField({ name: 'observacoes' }))

    app.save(col)

    try {
      col.addIndex('idx_cod_referencia_unique', true, 'cod_referencia', '')
      app.save(col)
    } catch (e) {}
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Projetos')
    try {
      col.removeIndex('idx_cod_referencia_unique')
      app.save(col)
    } catch (e) {}
  },
)
