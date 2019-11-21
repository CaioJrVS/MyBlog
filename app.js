const express = require ('express');
const app = express();
const port = 3000;

app.use('/static',express.static('public'));
app.set('view engine','ejs');

app.get('/',(req,res)=> res.render('index'));

app.get('/createpost',(req,res)=>{
    res.render('createpost');
});
app.listen(port, ()=>console.log(`App listening on ${port}`) );
