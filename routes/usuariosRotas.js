const express = require('express')
const router = express.Router()
const BD = require('../db')

//rota onde lista usuarios (R - read)
router.get('/', async (req, res) => { //para acessar essa rota, digito /usuarios/
    //visualizando erro (se tiver)
    try {
        const busca = req.query.busca || ''
        const ordenar = req.query.ordenar || 'nome'
        const buscaDados = await BD.query(`
            SELECT * FROM usuarios WHERE upper(nome) LIKE $1
                ORDER BY ${ordenar}`, [`%${busca.toUpperCase()}%`]
            )
        res.render('usuariosTelas/lista', {
            usuarios: buscaDados.rows,
            busca: busca,
            ordenar: ordenar
        })
    } catch (erro) {
        console.log('Erro ao listar usuarios', erro)
        res.render('usuariosTelas/lista', {mensagem: erro})
    }
})


//Rota para abrir tela para criar um novo usuario (C - Create)
//Endereço localhost:3000/usuarios/novo
router.get("/novo", async (req, res) => {
    try {
        const usuariosCadastradas = await listausuario()
        res.render("UsuariosTelas/criar", {usuariosCadastradas })

    } catch ( erro ) {
        console.log('Erro ao abrir tela de cadastro de usuario', erro)
        res.render('UsuariosTelas/criar', { mensagem : erro })
    }
})

router.post("/novo", async (req, res) => {
    try{
        const foto_perfil = req.body.foto_perfil
        const nome = req.body.nome
        const usuario = req.body.usuario
        const senha = req.body.senha
        await BD.query('insert into usuarios (foto_perfil, nome, usuario, senha) values ($1, $2, $3, $4)', 
                            [foto_perfil, nome, usuario, senha])
        //Redirecionando para a tela de consulta de usuarios
        res.redirect('/usuarios/')

    }catch (erro) {
        console.log('Erro ao cadastrar usuario', erro)
        res.render('usuariosTelas/criar', {mensagem : erro })
    }
})

//Excluir um usuario (D - Delete)
//Para acessar /usuarios/1/deletar
router.post('/:id/deletar', async (req, res) => {
    const {id} = req.params
    await BD.query('Delete from usuarios where id_usuario = $1', [id])
    res.redirect('/usuarios')
})

//Editar um usuarios (U - Update)
// Para acessar /usuarios/1/editar
router.get('/:id/editar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    const resultado = await BD.query('select * from usuarios where id_usuario = $1', [id])
    res.render('UsuariosTelas/editar', { usuario: resultado.rows[0] })
})

router.post('/:id/editar', async (req, res) => {
    const { id } = req.params
    const { foto_perfil, nome, usuario, senha } = req.body
    await BD.query(`update usuarios set foto_perfil = $1, nome = $2, usuario = $3, senha = $4
                        where id_usuario = $5`, [foto_perfil, nome, usuario, senha, id])
    res.redirect('/usuarios')
})

module.exports = router