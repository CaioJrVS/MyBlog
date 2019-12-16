// ------ Adding express -------
const express = require ('express');
const app = express();
const port = process.env.PORT ;

// ------ Package to decode special characters ----- 
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

// ------ Adding DataBase ------
const pgp = require('pg-promise')();
const db = pgp('postgres://prdflpvx:HzV-125bjDp9z2bMWl1D_gDulDJqij9-@tuffi.db.elephantsql.com:5432/prdflpvx');

// ------ Bcrypt for password hashing --------
const bcrypt = require('bcryptjs');
let salt = bcrypt.genSaltSync(10);

// ------ Passport for login authorization ------
const section = require('express-section');

// ------ Configuring middlewares

// - Middleware to serve static files (css, js, images) -
app.use('/static',express.static('public'));

// - Middleware to parse body parameters -
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// - Middleware for passport auth -
app.use(session({secret:'Coffee lake'}));
app.use(passport.initialize());
app.use(passport.session());

// setting view engine
app.set('view engine','ejs');

// ------ Routes ---- ? Create Routes folder and exports here ---- ? How to send parameters for modules outside the app.js?

app.get('/',(req,res)=>{
    db.any('SELECT * FROM posts')
	.then(data=>{
	    res.render('index',{data:data});
	});
});

app.get('/login/:signinattempt', (req,res) =>{
    let passDontMatch = (req.params.signinattempt == 'true');
    res.render('login', {passDontMatch: passDontMatch});
});

app.post('/login', (req,res) =>{
    let userlogin = {
	password:req.body.loginPassword,
	email: req.body.loginEmail
    };
    db.one('SELECT * FROM bloguser WHERE useremail= $1',[userlogin.email])
    	.then((data)=>{
	    if( bcrypt.compareSync(userlogin.password, data[0].passhash)){
		console.log("você está logado mané");
		//Logar o usuário e manter logado
	    };
	    if(!bcrypt.compareSync(req.body.loginPassword, data[0].passhash)){
		console.log("senha errada vagabundo");
		//Redirecionar para login e dizer que a senha está errada
	    };
    	})
    	.catch(()=>{
	    console.log("Você não possui cadastro");
	    // Dizer que não possui conta
    	});
    res.redirect('login/false');
});

app.post('/signin',(req,res) => {
    let userSignin = {
	email: req.body.loginEmail,
	password: req.body.loginPassword
    };
    if ( userSignin.password[0] == userSignin.password[1] ){
	db.one('SELECT * FROM bloguser WHERE useremail= $1',[userSignin.email])
	    .then((data) => {
		console.log(data);
		console.log("ja possui conta");
		res.redirect('login/false');
		// Redirecionar para Login e Dizer que já possui conta!
	    })
	    .catch(() => {
		console.log ("não possui conta");
		res.redirect('login/false');
		// Enviar email de confirmação
		// Criar Usuário e dizer que foi criado com sucesso
		// Redirecionar para a página de Login
		// Mater o Usuário logado
	    });
    }
    if ( userSignin.password[0] != userSignin.password[1]){
	res.redirect('login/true'); // Alterar o parametro da URL para receber não apenas true ou false 
    }
});

app.get('/posts/:id',(req,res)=>{
    let postId = req.params.id; 
    db.one('SELECT * FROM posts WHERE id = $1', [postId])
	.then(data =>{
	    res.render('post',{data,data});
	}).catch(error=>{
	    console.log(error);
	    res.redirect('/');
	    });
});

app.post('/createpost', (req, res)=>{
    
    var content ={

	title:  entities.decode(req.body.title),
	author: req.body.author,
	post:   entities.decode(req.body.content)

    };
    db.none('INSERT INTO posts(author,title,post) VALUES ($1,$2,$3)',[content.author, content.title, content.post])
	.then(()=>{
	    console.log("foi");
	    res.redirect('/');
	})
	.catch(error=>{
	    console.log(error);
	});
	     
});

app.get('/createpost',(req,res)=>{
    res.render('createpost');
});

app.get('*', (req,res) =>{
    res.render('Oops');
});


app.listen(port, ()=>console.log(`App listening on ${port}`) );
