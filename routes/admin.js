const express = require('express')
const router = express.Router()
const BD = require('../db')

//Rota principal do Painel Administrativo
router.get('/', async(req, res) => {
    /**** cards informativos ****/

    const teste1 = await BD.query(`
        select count(*) as qnt_teste from produtos `)

    const qProdutos = await BD.query(`
        select count(*) as total_produtos from produtos`)

    const qCategorias = await BD.query(`
        select count(*) as total_categorias from categorias`)   

    const qTotalEstoque = await BD.query(`
        SELECT SUM(estoque) + SUM(valor) AS valor_total FROM produtos`)

    const qProdEstoqueMinimo = await BD.query(`
        SELECT COUNT(estoque_minimo) FROM produtos AS total_estoque_minimo`)

    
    /***** graficos ******/
    //grafico valor estoque
    

    //grafico estoque produtos

    const qteste1produto = await BD.query(`
        select count(*) as qnt_teste from produtos `)

    const qEstoqueProdutos = await BD.query(`
        SELECT nome_produto, estoque  FROM produtos`)

    //grafico quantidade acima e abaixo estoque minimo
    const qAcimaEstoque = await BD.query(`
        SELECT count(*) AS acima_minimo FROM produtos WHERE estoque > estoque_minimo`)
    
    const qAbaixoEstoque = await BD.query(`
        SELECT count(*) AS abaixo_minimo FROM produtos WHERE estoque <= estoque_minimo`)

    /** tabela de produtos estoque minimo **/
    const buscaDadosProduto = await BD.query(`
        SELECT p.imagem, p.nome_produto, c.nome_categoria, p.valor, p.estoque_minimo, p.estoque, p.id_produto
            FROM produtos AS p 
            INNER JOIN categorias AS c ON c.id_categoria = p.id_categoria
            WHERE estoque <= estoque_minimo`)


    res.render('admin/dashboard', {
        totalProdutos : qProdutos.rows[0].total_produtos,
        totalCategorias : qCategorias.rows[0].total_categorias,
        totalEstoque : qTotalEstoque.rows[0].valor_total,
        totalEstoqueMinimo : qProdEstoqueMinimo.rows.total_estoque_minimo,
        //testes abaixo pra tabela de produtos estoque minimo
        produtos: buscaDadosProduto.rows,
        totalacimaestoque : qAcimaEstoque.rows[0].acima_minimo,
        totalabaixoestoque : qAbaixoEstoque.rows[0].abaixo_minimo
        
        

    })
})

module.exports = router