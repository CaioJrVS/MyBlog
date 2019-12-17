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
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");



// ------ Configuring middlewares


// - Middleware to serve static files (css, js, images) -
app.use('/static',express.static('public'));



// - Middleware to parse body parameters -
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// setting view engine
app.set('view engine','ejs');


// - Middleware for passport auth -

app.use(session({secret:'Coffee lake',
     resave: false,
     saveUninitialized:false
    }));

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done){
    console.log('serializou');
    done(null, user.id);
});

passport.deserializeUser(( id ,done ) =>{
    db.one('SELECT * FROM bloguser WHERE userid = $1 ', [id])
	.then((data)=>{
	    console.log('deserializou');
	    done(null,data);
	})
	.catch((err)=>{
	    console.log(err);
	})
});

passport.use(new LocalStrategy({

    usernameField: 'loginEmail',
    passwordField: 'loginPassword',
    },

    function(username, password, done) {
      db.one('SELECT * FROM bloguser WHERE useremail = $1',[username])
	  .then((data)=>{
	      bcrypt.compare(password, data.passhash).then((res) =>{
		  if(res){
		      console.log(' senha e usuario ok!');
		      return done ( null, { id: data.userid });
		  };
		  if(!res){
		      console.log('usuario ok senha errada');
		      return done (null, false, {message: 'Incorrect Password'});
		  };
	      }); 
	  })
	    .catch((err)=>{
		console.log('usuario não existe');
	      return done (null, false, {message: 'Incorrect user' });
	  });
    } 
));

const isAuthenticated = function(req,res,next){
   if(req.user)
      return next();
   else
       res.redirect('/');
};

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



app.post('/login', passport.authenticate('local', { failureRedirect:'/login/true', successRedirect:'/'} ));



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



app.get('/createpost', isAuthenticated , (req, res)=>{
    res.render('createpost');
});



app.get('*', (req,res) =>{
    res.render('Oops');
});




app.listen(port, ()=>console.log(`App listening on ${port}`) );
