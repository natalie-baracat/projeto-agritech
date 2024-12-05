const express = require('express')
const router = express.Router()
const BD = require('../db')

//rota onde lista categorias (R - read)
router.get('/', async (req, res) => { //para acessar essa rota, digito /categoriass/
    //visualizando erro (se tiver)
    try {
        const busca = req.query.busca || ''
        const ordenar = req.query.ordenar || 'nome_categoria'
        const categorias = await BD.query(`
            SELECT * FROM categorias WHERE upper(nome_categoria) LIKE $1
                ORDER BY ${ordenar}`, [`%${busca.toUpperCase()}%`]  
            )

        const categoriasCadastradas = categorias.rows
        res.render('categoriaTelas/lista', {categoriasCadastradas: categoriasCadastradas,
            categorias: categorias.rows,
            busca: busca,
            ordenar: ordenar} )
    } catch (erro) {
        console.log('Erro ao listar categorias', erro)
        res.render('categoriaTelas/lista', {mensagem: erro})
    }
})

//     try {
        
//         const categorias = await BD.query(`
//             SELECT * FROM categorias`  
//             )

//         const categoriasCadastradas = categorias.rows
//         res.render('categoriaTelas/lista', {categoriasCadastradas: categoriasCadastradas} )
//     } catch (erro) {
//         console.log('Erro ao listar categorias', erro)
//         res.render('categoriaTelas/lista', {mensagem: erro})
//     }
// })


//Rota para abrir tela para criar uma nova categoria (C - Create)
//Endereço localhost:3000/categorias/novo
router.get("/novo", async (req, res) => {
    try {
        const categoriasCadastradas = await listacategoria()
        res.render("categoriaTelas/criar", {categoriasCadastradas: categoriasCadastradas })

    } catch ( erro ) {
        console.log('Erro ao abrir tela de cadastro de categoria', erro)
        res.render('categoriaTelas/criar', { mensagem : erro })
    }
})

router.post("/novo", async (req, res) => {
    try{
        //const {nome, id_categoria} = req.body
        const nome = req.body.nome_categoria //esse nome_categoria esta sendo buscado no formulario
        await BD.query('insert into categorias (nome_categoria) values ($1)', 
                            [nome])
        //Redirecionando para a tela de consulta de categoria
        res.redirect('/categorias/')

    }catch (erro) {
        console.log('Erro ao cadastrar categoria', erro)
        res.render('categoriaTelas/criar', {mensagem : erro })
    }
})

//Excluir um categoria (D - Delete)
//Para acessar /categorias/1/deletar
router.post('/:id/deletar', async (req, res) => {
    const {id} = req.params
    await BD.query('Delete from categorias where id_categoria = $1', [id])
    res.redirect('/categorias')
})

//Editar um categoria (U - Update)
// Para acessar /categorias/1/editar
router.get('/:id/editar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    const resultado = await BD.query('select * from categorias where id_categoria = $1', [id])
    res.render('categoriaTelas/editar', { categoria: resultado.rows[0] })
})

router.post('/:id/editar', async (req, res) => {
    const { id } = req.params
    const nome = req.body.nome_categoria
    await BD.query(`update categorias set nome_categoria = $1
                        where id_categoria = $2`, [nome, id])
    res.redirect('/categorias')
})

module.exports = router