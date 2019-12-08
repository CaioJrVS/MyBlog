// ------ Adding express -------
const express = require ('express');
const app = express();
const port = process.env.PORT ;

// ------ Package to decode special characters ----- 
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

// ------ Adding DataBase ------
const pgp = require('pg-promise')();
const db = pgp('postgres://prdflpvx:@tuffi.db.elephantsql.com:5432/prdflpvx');

// ------ Configuring middlewares  
app.use('/static',express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine','ejs');

// ------ Routes ( Create Routes folder and exports here ) ----
app.get('/',(req,res)=>{
    db.any('SELECT * FROM posts')
	.then(data=>{
	    res.render('index.ejs',{data:data});
	});
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
