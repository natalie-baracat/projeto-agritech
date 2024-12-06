const express = require('express')
const path = require('path')
const session = require('express-session')

const app = express()

//Configurações do Servidor
app.set('views', path.join(__dirname, 'views')); // Configura o diretório das views
app.set('view engine', 'ejs')  //Configura o motor de templates para EJS
app.use(express.static(path.join(__dirname, 'public'))); //Define pasta para arquivos css / img
app.use(express.urlencoded({ extended: true })) //Para processar os dados do formulário
app.use(express.json());  // utilizar dados em formato JSON
app.use(session({ //
    secret: 'axolotl', //um segredo para assinar a sessao
    resave: false,
    saveUninitialized: true //se nao houver dados na sessao, nao salva
}))

//middleware para verificar se o usuario esta logado
const verificarAutenticacao = (req, res, next) => {
    if (req.session.usuarioLogado) {
        res.locals.nomeUsuario = req.session.nomeUsuario //disponibilizando o nome para ser exibido nas telas .ejs
        res.locals.idUsuario = req.session.idUsuario //disponibilizando o id para ser utilizado na movimentaçao dos produtos
        res.locals.fotoUsuario = req.session.fotoUsuario //disponibilizando a foto do usuario para ser mostrada na navbar 
        next() //se estiver, vai pra proxima pag
    } else {
        res.redirect('/auth/login') //senao, é redirecionado para tela de login
    }

}

//rota da pagina principal, nossa landing page
app.get('/', (req, res) => {
    //  views/landing/index.ejs
    res.render('landing/index')
}) 

//utilizando rotas admin
const adminRotas = require('./routes/admin')
app.use('/admin', verificarAutenticacao, adminRotas)

//utilizando rotas de login 
const loginRotas = require('./routes/loginRotas')
app.use('/auth', loginRotas)

//utilizando rotas produtos
const produtosRotas = require('./routes/produtosRotas')
app.use('/produtos', verificarAutenticacao, produtosRotas)

//utilizando rotas categoria
const categoriaRotas = require('./routes/categoriaRotas')
app.use('/categorias', verificarAutenticacao, categoriaRotas)

//utilizando rotas usuarios
const usuariosRotas = require('./routes/usuariosRotas')
app.use('/usuarios', verificarAutenticacao, usuariosRotas)


//servidor
const porta = 3000
app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`)
})