const { banco, contas, transferencias, saques, depositos } = require('../bancodedados')

const listarContas = (req, res) => {

    if (req.query.senha_banco == banco.senha) {
        return res.status(200).json(contas)
    } else {
        return res.status(400).json({ mensagem: "Senha Incorreta" })
    }

}

const cadastrarConta = (req, res) => {

    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios e devem ser preenchidos.' });
    }

    const validarCpf = contas.some(conta => conta.usuario.cpf === cpf);
    const validarEmail = contas.some(conta => conta.usuario.email === email);

    if (validarCpf || validarEmail) {
        return res.status(400).json({ mensagem: 'CPF ou email já cadastrados.' });
    }

    let idAlto = 0

    if (contas.length >= 2) {
        idAlto = contas.sort((a, b) => {

            if (a.numero < b.numero) {
                return 1;
            }
            else if (a.numero > b.numero) {
                return -1;
            }
            
            return 0;

        })[0].numero + 1


    } else if (contas.length == 1) {

        idAlto = contas[0].numero + 1
    } else {

        idAlto = 1
    }

    let numero = idAlto
    let saldo = 0
    const usuario = { nome, cpf, data_nascimento, telefone, email, senha }
    contas.push({ numero, saldo, usuario })

    return res.status(201).json({ numero, saldo, usuario });

}

const atualizarConta = (req, res, numero) => {

    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body


    let validarCpf = ""
    let validarEmail = ""

    if (cpf) {
        validarCpf = contas.some(conta => conta.usuario.cpf === cpf);
    }

    if (email) {
        validarEmail = contas.some(conta => conta.usuario.email === email);
    }

    if (validarCpf || validarEmail) {
        return res.status(400).json({ mensagem: 'CPF ou email já cadastrados.' });
    }

    const usuario = { nome, cpf, data_nascimento, telefone, email, senha }
    const contaExistente = contas[contas.findIndex(item => item.numero == numero)]

    if (nome) {
        contaExistente.usuario.nome = nome
    }
    if (cpf) {
        contaExistente.usuario.cpf = cpf
    }
    if (data_nascimento) {
        contaExistente.usuario.data_nascimento = data_nascimento
    }
    if (telefone) {
        contaExistente.usuario.telefone = telefone
    }
    if (email) {
        contaExistente.usuario.email = email
    }
    if (senha) {
        contaExistente.usuario.senha = senha
    }

    return res.status(200).json({ mensagem: 'Conta atualizada com sucesso.', conta: contaExistente });
}

const deletarConta = (req, res, numero) => {

    contas.splice(contas.findIndex(item => item.numero == numero), 1)
    return res.status(200).json({ mensagem: "conta deleteda com sucesso" })


}

const encontrarConta = (numero_conta) => {
    return contas.some(conta => conta.numero == numero_conta)
}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios não preenchidos' })
    }

    const conta = encontrarConta(numero_conta);
    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada' });
    }
    const contaEncontrada = contas.find(conta => conta.numero == numero_conta)

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'Valor Invalido, insira um valor acima de R$0,00' });
    }

    contaEncontrada.saldo += valor;

    const deposito = {
        data: new Date().toISOString(),
        numero_conta: numero_conta,
        valor: valor
    };

    depositos.push(deposito)

    res.status(200).json({ mensagem: 'Depósito realizado com sucesso' });

}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios não preenchidos' })
    }

    const conta = encontrarConta(numero_conta);
    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada' });
    }
    const contaEncontrada = contas.find(conta => conta.numero == numero_conta)

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'Valor Invalido, insira um valor acima de R$0,00' });
    }
    if (valor > contaEncontrada.saldo) {
        return res.status(401).json({ mensagem: 'Erro: Valor de saque superior ao saldo em conta' })
    }

    if (senha == contaEncontrada.usuario.senha) {
        contaEncontrada.saldo -= valor;

    } else {
        return res.status(400).json({ mensagem: 'Senha Incorreta' })
    }

    const saqueAtual = {
        data: new Date().toISOString(),
        numero_conta: numero_conta,
        valor: valor,

    }

    saques.push(saqueAtual)

    return res.status(201).json({ mensagem: 'Saque realizado com sucesso' })

}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

    if (!senha || !valor || !numero_conta_destino || !numero_conta_origem) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios não preenchidos' })
    }

    const contaOrigem = encontrarConta(numero_conta_origem);
    const contaDestino = encontrarConta(numero_conta_destino);

    if (!contaOrigem || !contaDestino) {
        return res.status(404).json({ mensagem: 'Conta não encontrada' });
    }

    const contaEncontradaOrigem = contas.find(conta => conta.numero == numero_conta_origem)
    const contaEncontradaDestino = contas.find(conta => conta.numero == numero_conta_destino)

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'Valor Invalido, insira um valor acima de R$0,00' });
    }
    if (valor > contaEncontradaOrigem.saldo) {
        return res.status(401).json({ mensagem: 'Erro: Valor de Transferencia superior ao saldo em conta' })
    }

    if (senha == contaEncontradaOrigem.usuario.senha) {
        contaEncontradaOrigem.saldo -= valor
        contaEncontradaDestino.saldo += valor

    } else {
        return res.status(400).json({ mensagem: 'Senha Incorreta' })

    }

    const transferenciaAtual = {
        data: new Date().toISOString(),
        numero_conta_origem: numero_conta_origem,
        numero_conta_destino: numero_conta_destino,
        valor: valor,

    }

    transferencias.push(transferenciaAtual)

    return res.status(201).json({ mensagem: 'Transferencia realizada com sucesso' })

}

const consultarSaldo = (req, res) => {

    const { numero_conta, senha } = req.query

    const contaAtual = encontrarConta(req.query.numero_conta)
    const contaExistente = contas.find(conta => conta.numero == numero_conta)

    if (!contaAtual) {
        return res.status(400).json({ mensagem: 'Conta não encontrada' })
    }
    if (senha == contaExistente.usuario.senha) {
        return res.status(200).json({ saldo: contaExistente.saldo })
    } else {
        return res.status(400).json({ mensagem: 'Senha Incorreta' })
    }

}

const gerarExtrato = (req, res) => {
    const { numero_conta, senha } = req.query

    const contaAtual = encontrarConta(req.query.numero_conta)
    const contaExistente = contas.find(conta => conta.numero == numero_conta)

    if (!contaAtual) {
        return res.status(400).json({ mensagem: 'Conta não encontrada' })
    }
    if (senha == contaExistente.usuario.senha) {
        return res.status(200).json({

            saques: saques,
            depositos: depositos,
            transferencias: transferencias,

        })
    } else {
        return res.status(400).json({ mensagem: 'Senha Incorreta' })
    }

}

module.exports = {

    listarContas,
    cadastrarConta,
    atualizarConta,
    deletarConta,
    depositar,
    sacar,
    transferir,
    consultarSaldo,
    gerarExtrato,
}