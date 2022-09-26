const express = require('express')
const handlebars = require('express-handlebars')
const bodyParse = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const { default: mongoose } = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Categoria')
const Categoria = mongoose.model("categorias")
require("./models/Postagem")
const Postagem = mongoose.model('postagens')
const usuarios = require("./routes/usuario")

//configurações
    //Sessão
    app.use(session({
        secret: "curso de node",
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())
    //Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })
    //body parser
    app.use(express.json());
    app.use(express.urlencoded({extended: true}))
    //handlebars
    app.engine('handlebars',handlebars.engine({defaulyLayout:'main', runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }}))
    app.set('view engine', 'handlebars')
    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/blogapp').then(() => {
            console.log('Conectando ao mongo')
        }).catch((err) => {
            console.log('Erro ao e conectar.')
        })

    //public
    app.use(express.static('public'))
    app.use(express.static(__dirname + '/public'));

//Rotas
 app.get('/', (req, res) => {

    Postagem.find().lean().populate().sort({data: 'desc'}).then((postagens) => {
        res.render("index", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", 'Houve um erro ao lista as postagens!')
        res.redirect("/404")
    })
})

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
        if(postagem) {
            res.render("postagem/index", {postagem: postagem})
        } else {
            req.flash("error_msg", "Essa postagem não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
})

app.get("/categorias", (req, res) => {

    Categoria.find().lean().then((categorias) => {
        res.render("categorias/index", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", 'Houve um erro interno ao lista as categorias')
        res.redirect("/")
    })
})

 app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(categoria) {
            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os posts")
                res.redirect('/')
            })
        } else {
            req.flash("error_msg", "Essa categoria não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página")
        res.redirect("/")
    })
 })

app.get("/404", (req, res) => {
    res.send("Error 404!")
})

app.get('/posts', (req, res) => {
    res.send('Lista de Posts')
})

  app.use('/admin', admin)
  app.use("/usuarios", usuarios)

//Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log('servidor rodando!')
})