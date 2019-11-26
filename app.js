const express = require ('express');
const app = express();
const port = 3000;
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const pgp = require('pg-promise')();
const db = pgp('postgres://prdflpvx:HzV-125bjDp9z2bMWl1D_gDulDJqij9-@tuffi.db.elephantsql.com:5432/prdflpvx');

app.use('/static',express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine','ejs');

app.get('/',(req,res)=> res.render('index'));

app.post('/createpost', (req, res)=>{
    var content ={title:entities.decode(req.body.title),
		  author:req.body.author,
		  post:entities.decode(req.body.content)
		 }
    db.none('INSERT INTO posts(author,title,post) VALUES ($1,$2,$3)',[content.author, content.title, content.post])
	.then(()=>{
	    console.log("foi")})
	.catch(error=>{
	    console.log(error)});
	     
    res.redirect('/');
});

app.get('/createpost',(req,res)=>{
    res.render('createpost');
});
app.get('*', (req,res) =>{
    res.render('Oops');
});
app.listen(port, ()=>console.log(`App listening on ${port}`) );
