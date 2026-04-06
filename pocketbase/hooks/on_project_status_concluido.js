onRecordUpdateRequest((e) => {
  const body = e.requestInfo().body

  if (body.status === 'Concluído') {
    try {
      $app.findFirstRecordByFilter('CustosProjeto', `projeto = '${e.record.id}'`)
    } catch (_) {
      throw new BadRequestError(
        'Para marcar como Concluído, é obrigatório preencher os Custos do Projeto.',
      )
    }
  }

  e.next()
}, 'Projetos')
