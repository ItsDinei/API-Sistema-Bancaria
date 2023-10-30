const express = require('express')
const router = express.Router()

const {
  
  listarContas,
  cadastrarConta,
  atualizarConta,
  deletarConta,
  depositar,
  sacar, 
  transferir, 
  consultarSaldo, 
  gerarExtrato 

} = require('./controladores/contas');

router.get('/contas', (req, res) => {
  return listarContas(req, res)
})

router.post('/contas', (req, res) => {
  return cadastrarConta(req, res)
})

router.put('/contas/:numeroConta/usuario', (req, res) => {
  return atualizarConta(req, res, req.params.numeroConta)

})

router.delete('/contas/:numeroConta/usuario', (req, res) => {
  return deletarConta(req, res, req.params.numeroConta)

})

router.post('/transacoes/depositar', (req, res) => {
  return depositar(req, res)
})

router.post('/transacoes/sacar', (req, res) => {
  return sacar(req, res)
})

router.post('/transacoes/transferir', (req, res) => {
  return transferir(req, res)
})

router.get('/contas/saldo', (req, res) => {
  return consultarSaldo(req, res)
})
router.get('/contas/extrato', (req, res) => {
  return gerarExtrato(req, res)
})


module.exports = router