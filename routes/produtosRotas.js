const express = require('express')
const router = express.Router()
const BD = require('../db')

/* ARQUIVOS FOTOS */
const { put, del } = require("@vercel/blob"); // prof criou  2 funções para fazer o upload do arquivo e retornar o link dele

const enviarFoto = async (file) => {
    const fileBuffer = file.data
    const originalName = file.name
    const blob = await put(originalName, fileBuffer, {
        access: "public", // Define acesso público ao arquivo
    });
    console.log(`Arquivo enviado com sucesso! URL: ${blob.url}`); 
    return blob.url;
};

const excluirFoto = async (imagemUrl) => {
    const nomeArquivo = imagemUrl.split("/").pop();
    if (nomeArquivo) {
        await del(nomeArquivo);
        console.log(`Arquivo ${nomeArquivo} excluído com sucesso.`);
    }
}
/*--------------------------------------------------------------*/

//rota onde lista produtos (R - read)
router.get('/', async (req, res) => { //para acessar essa rota, digito /disciplinas/
    //visualizando erro (se tiver)
    try {
        const busca = req.query.busca || ''
        const ordenar = req.query.ordenar || 'nome_produto'
        const pg = req.query.pg || 1

        const limite = 10
        const offset = (pg -1) * limite

        const buscaDados = await BD.query(`
            SELECT p.imagem, p.nome_produto, c.nome_categoria, p.valor, p.estoque_minimo, p.estoque, p.id_produto
                FROM produtos AS p 
                INNER JOIN categorias AS c ON c.id_categoria = p.id_categoria
                WHERE upper(p.nome_produto) LIKE $1 AND inativo IS null 
                ORDER BY ${ordenar}
                limit $2 offset $3`, [`%${busca.toUpperCase()}%`, limite, offset]
            )

            const totalItens = await BD.query(`select count(*) as total
            from produtos as p
            inner join categorias as c on c.id_categoria = p.id_categoria
            where upper(p.nome_produto) like $1 AND inativo IS null`, 
        [`%${busca.toUpperCase()}%`]);

        const totalPgs = Math.ceil(totalItens.rows[0].total / limite)

        res.render('produtosTelas/lista', { 
            produtos: buscaDados.rows,
            busca: busca,
            ordenar: ordenar,
            pgAtual: parseInt(pg),
            totalPgs: totalPgs
        })
    } catch (erro) {
        console.log('Erro ao listar produtos', erro)
        res.render('produtosTelas/lista', {mensagem: erro})
    }
})

//Rota para abrir tela para criar uma novo produto (C - Create)
//Endereço localhost:3000/produtos/novo
router.get("/novo", async (req, res) => {
    try {
        const categoriasCadastradas = await BD.query('select * from categorias')
        res.render("produtosTelas/criar", {categoriasCadastradas: categoriasCadastradas.rows})

    } catch ( erro ) {
        console.log('Erro ao abrir tela de cadastro de produto', erro)
        res.render('produtosTelas/criar', { mensagem : erro })
    }
})

router.post("/novo", async (req, res) => {
    try{
        const nome_produto = req.body.nome_produto
        const id_categoria = req.body.id_categoria
        const imagem = req.body.imagem
        const valor = req.body.valor
        const estoque_minimo = req.body.estoque_minimo
        const estoque = req.body.estoque
        let urlImagem = await enviarFoto(req.files.file)

        await BD.query(`insert into produtos (imagem, nome_produto, valor, estoque_minimo, estoque, id_categoria) 
                            values ($1, $2, $3, $4, $5, $6)`, 
                            [urlImagem, nome_produto, valor, estoque_minimo, estoque, id_categoria])
        //Redirecionando para a tela de consulta de produtos
        res.redirect('/produtos/')

    }catch (erro) {
        console.log('Erro ao cadastrar produto', erro)
        res.render('produtosTelas/criar', {mensagem : erro })
    }
})

//Excluir um produto (D - Delete)
//Para acessar /produtos/1/deletar
router.post('/:id/deletar', async (req, res) => {
    const {id} = req.params
    // await BD.query('Delete from produtos where id_produto = $1', [id])
    await BD.query(`UPDATE produtos SET inativo = 'S' where id_produto = $1`, [id])
    res.redirect('/produtos')
})

//Editar um produto (U - Update)
// Para acessar /produtos/1/editar
router.get('/:id/editar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    const resultado = await BD.query('select * from produtos where id_produto = $1', [id])
    const categoriasCadastradas = await BD.query('Select * from categorias')
    const movimentacoes = await BD.query(`SELECT tipo_movimentacao, TO_CHAR(data_movimentacao, 'DD/MM/YYYY') as data, estoque, quantidade, descricao FROM movimentacoes WHERE id_produto = $1`, [id])
    res.render('produtosTelas/editar', { produto: resultado.rows[0], categoriasCadastradas: categoriasCadastradas.rows, movimentacoes: movimentacoes.rows})
})

router.post('/:id/editar', async (req, res) => {
    const { id } = req.params
    const { imagem, nome_produto, valor, estoque_minimo, estoque, id_categoria} = req.body
    let urlImagem= imagem
    console.log(urlImagem);
    if (req.files) {
        excluirFoto(urlImagem)
        urlImagem = await enviarFoto(req.files.file)
    }
    console.log(urlImagem);
    
    await BD.query(`update produtos set imagem = $1, nome_produto = $2, id_categoria = $3, valor = $4, estoque_minimo = $5, estoque = $6
                        where id_produto = $7`, [urlImagem, nome_produto, id_categoria, valor, estoque_minimo, estoque, id])
    res.redirect('/produtos')
})

//movimentaçao
router.post('/:id/:id_usuario/movimentacao', async (req, res) => {
    const { id, id_usuario } = req.params
    const { tipo, estoque, quantidade, descricao} = req.body

    await BD.query(`INSERT INTO movimentacoes(tipo_movimentacao, estoque, quantidade, descricao, data_movimentacao, id_produto, id_usuario)
    VALUES($1, $2, $3, $4, current_date, $5, $6) `, [tipo, estoque, quantidade, descricao, id, id_usuario])


    res.redirect('/produtos')
})

// router.post('/:id/lancar-movimentacao', async (req, res) => {
//     try {
//         const { id } = req.params
//         const { movimentacao, estoque, quantidade, id_produto} = req.body
//         await BD.query(`insert into produtos
//             (id_produto, id_aluno, estoque, quantidade, descricao) values
//             ($1, $2, $3, $4, $5) 
//             `, [id_produto, movimentacao, estoque, qauntidade, descricao])
//         res.redirect(`/produtos/${id}/editar`)
//     } catch (erro) {
//         console.log('Erro ao gravar movimentação', erro)
//     }
// })

module.exports = router