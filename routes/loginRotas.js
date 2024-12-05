const express = require('express')
const router = express.Router()
const BD = require('../db')

//definindo rota de login
router.get('/login', (req, res) => {
    res.render('admin/login')
})

// processando o login do usuario
router.post('/login', async (req, res) => {
    const usuario = req.body.usuario //mesma coisa de "const {usuario} = req.body"
    const senha = req.body.senha

    const buscaDados = await BD.query(`
        SELECT * FROM usuarios WHERE usuario = $1 AND senha = $2`, [usuario, senha]
    )
    //verificando de usuario e senha existem na tabela do BD, ou seja, se sao validos
    if (buscaDados.rows.length> 0 ) { 
        req.session.usuarioLogado = buscaDados.rows[0].usuario
        req.session.nomeUsuario = buscaDados.rows[0].nome
        req.session.idUsuario = buscaDados.rows[0].id_usuario
        req.session.fotoUsuario = buscaDados.rows[0].foto_perfil
        res.redirect('/admin/')
    } else {
        res.render('admin/login', {mensagem: 'Usuário não autenticado'})
    }
})

//criando rota para logout 
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
})



//Listar categorias (R - Read)
//Para acessar essa rota digito /categorias/
router.get('/', async (req, res) => {
    const buscaDados = await BD.query('SELECT * FROM categorias') 
    res.render('categoriaTelas/lista', { categorias: buscaDados.rows } )
})

//Rota para abrir tela para criar uma nova categoria (c - Create)
//Para acessar /categorias/novo
router.get('/novo', (req, res) => {
    res.render('categoriasTelas/criar')
})

router.post('/novo', async (req, res) => {
    const {nome_categoria} = req.body
    await BD.query(`insert into categorias (nome_categoria) 
                        values ($1)`, [nome_categoria])
    res.redirect('/categorias')
})

//Excluir um professor (D - Delete)
//Para acessar /professores/1/deletar
router.post('/:id/deletar', async (req, res) => {
    const {id} = req.params
    await BD.query('Delete from professores where id_professor = $1', [id])
    res.redirect('/professores')
})

//Editar um professor (U - Update)
//Para acessar /professores/1/editar
router.get('/:id/editar', async (req, res) =>{
    const {id} = req.params
    const resultado = await BD.query('select * from professores where id_professor = $1', [id])
    res.render('professoresTelas/editar', { professor: resultado.rows[0]})
})

router.post('/:id/editar', async (req, res) => {
    const {id} = req.params
    const {nome_professor, telefone, formacao} = req.body
    await BD.query(`update professores set nome_professor = $1, telefone = $2, formacao = $3 where id_professor = $4`, [nome_professor, telefone, formacao, id])
    res.redirect('/professores')
})

module.exports = router