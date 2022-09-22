const express = require('express')
const handlebars = require('express-handlebars')
const bodyParse = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const { default: mongoose } = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')

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
    app.engine('handlebars',handlebars.engine({defaulyLayout:'main'}))
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
  app.use('/admin', admin)

//Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log('servidor rodando!')
})