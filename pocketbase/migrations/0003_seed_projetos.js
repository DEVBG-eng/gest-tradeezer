migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'financeiro@tradeezer.com')
    } catch (e) {
      user = new Record(users)
      user.setEmail('financeiro@tradeezer.com')
      user.setPassword('securepassword123')
      user.setVerified(true)
      app.save(user)
    }

    const projetos = app.findCollectionByNameOrId('Projetos')

    const createProj = (data) => {
      try {
        const r = new Record(projetos)
        Object.keys(data).forEach((k) => r.set(k, data[k]))
        app.save(r)
      } catch (e) {}
    }

    createProj({
      cod_referencia: 'TRAD-2024-001',
      cliente: 'TechCorp Brasil',
      status: 'Aguardando',
      qtd_laudas: 15.5,
      valor_lauda: 45,
      valor_total: 697.5,
      data_entrada: '2024-03-25 12:00:00.000Z',
      data_entrega: '2024-04-10 12:00:00.000Z',
      tipo_servico: 'Tradução Juramentada',
      idioma_origem: 'pt',
      idioma_destino: 'en',
      tipo_documento: 'Contrato Social',
      qtd_documentos: 2,
      urgente: true,
      fisico: false,
      digital: true,
      observacoes: 'Prioridade alta para envio.',
    })

    createProj({
      cod_referencia: 'TRAD-2024-002',
      cliente: 'Maria Silva',
      status: 'Cartório',
      qtd_laudas: 3,
      valor_lauda: 150,
      valor_total: 450,
      data_entrada: '2024-03-20 12:00:00.000Z',
      data_entrega: '2024-04-15 12:00:00.000Z',
      tipo_servico: 'Tradução Juramentada',
      idioma_origem: 'pt',
      idioma_destino: 'es',
      tipo_documento: 'Procuração Pública',
      qtd_documentos: 1,
      apostilamento: true,
      reconhecimento: true,
      fisico: true,
      internacional: true,
      frete: true,
      dhl: true,
    })

    createProj({
      cod_referencia: 'TRAD-2024-003',
      cliente: 'Industria XPTO',
      status: 'Em Andamento',
      qtd_laudas: 120,
      valor_lauda: 70,
      valor_total: 8400,
      data_entrada: '2024-03-10 12:00:00.000Z',
      data_entrega: '2024-04-20 12:00:00.000Z',
      tipo_servico: 'Tradução Técnica',
      idioma_origem: 'de',
      idioma_destino: 'pt',
      tipo_documento: 'Manual Técnico',
      qtd_documentos: 5,
      internacional: true,
      digital: true,
      observacoes: 'Glossário técnico específico fornecido pelo cliente.',
    })
  },
  (app) => {
    // down logic empty
  },
)
