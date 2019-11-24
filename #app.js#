const express = require ('express');
const app = express();
const port = 3000;
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

app.use('/static',express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine','ejs');

app.get('/',(req,res)=> res.render('index'));

app.post('/createpost', (req, res)=>{
    console.log(entities.decode(req.body.content));
    res.redirect('/');
});

app.get('/createpost',(req,res)=>{
    res.render('createpost');
});
app.listen(port, ()=>console.log(`App listening on ${port}`) );
