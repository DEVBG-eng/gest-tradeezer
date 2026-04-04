onRecordCreate((e) => {
  const codReferencia = e.record.get('cod_referencia')
  if (codReferencia) {
    const baseUrl =
      'https://gbtraducoes.sharepoint.com/sites/tradeezer/Documentos%20Compartilhados/Forms/AllItems.aspx?id=%2Fsites%2Ftradeezer%2FDocumentos%20Compartilhados%2FProjetos%2FProtocolos'
    e.record.set('pasta_url', baseUrl + '/' + encodeURIComponent(codReferencia))
  } else {
    e.record.set('pasta_url', '')
  }
  e.next()
}, 'Projetos')
