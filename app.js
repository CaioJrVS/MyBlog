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

// ------ Configuring middlewares  
app.use('/static',express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine','ejs');

// ------ Routes ---- ? Create Routes folder and exports here ---- ? How to send parameters for modules outside the app.js?

app.get('/',(req,res)=>{
    db.any('SELECT * FROM posts')
	.then(data=>{
	    res.render('index',{data:data});
	});
});

app.get('/login', (req,res) =>{
    res.render('login');
});

app.post('/login', (req,res) =>{
    let userlogin = {
	password:req.body.loginPassword,
	email: req.body.loginEmail
    };
    db.any('SELECT * FROM bloguser WHERE useremail= $1',[userlogin.email])
    	.then((data)=>{
	    if( bcrypt.compareSync(userlogin.password, data[0].passhash)){
		console.log("você está logado mané");
	    };
	    if(!bcrypt.compareSync(req.body.loginPassword, data[0].passhash)){
		console.log("senha errada vagabundo");
	    };
    	})
    	.catch(()=>{
	    console.log("Você não possui cadastro");
    	});
    res.redirect('login');
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
