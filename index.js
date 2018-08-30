// const http = require('http');

// const server = http.createServer(function(req, resp){
//     resp.end('Hello');
// });

// server.listen(3000);

const express = require('express');
const app = express();
const twig = require('twig');
twig.cache(false);
const mongo = require('mongodb');
const client = mongo.connect('mongodb://127.0.0.1:27017', 
                                {useNewUrlParser: true});
const cp = require('cookie-parser');
const cs = require('cookie-session');
app.use('/public/', express.static('public'));
app.use(express.urlencoded());
app.use(cp());
app.use(cs({keys:['keyval', 'keyval2']}));
app.set('view engine', 'twig');

app.post('/', function(req, resp){
    client.then(function(connection) {
        const dbCollection = connection.db('check').collection('posts');
        let data = {content: req.body.content, title: req.body.title};
        dbCollection.insertOne(data);
        resp.redirect('/');
        resp.end(dbCollection)
    });
});

//Promices realisation (getting posts and rendering them on the page)
app.get('/', function(req, resp){

    //Example how to use cookie-parser
    // let a = Number(req.cookies.counter);
    // console.log('Counter', a);
    // if (!a) {
    //     a = 0;
    // }    
    // resp.cookie('counter', `${a+1}`);

    //Example how to use cookie-session
    let counter = req.session.counter || 0;
    ++counter;
    req.session.counter = counter;

    client.then(connect
         ).then(collectPosts
         ).then(postsRender
        ).catch(error);

    function connect(connection) {
        const dbCollection = connection.db('check').collection('posts');
        return dbCollection;
    };
    
    function collectPosts(dbCollection) {
        return dbCollection.find().toArray();
    };
    
    function postsRender(posts) {
        resp.render('home', {posts: posts, counter: counter});
    };

    function error(err) {
        console.log(err);        
    };

});


//Callbacks realisation (getting posts and rendering them on the page)
// app.get('/', function(req, resp) {    
//     const client = mongo.connect('mongodb://127.0.0.1:27017', 
//                                 {useNewUrlParser: true}, 
//                                 connect);

//     function connect(err, client) {
//         const dbCollection = client.db('check').collection('posts');
//         dbCollection.find(collectPosts);
//     };
    
//     function collectPosts(err, dbCollection) {
//         dbCollection.toArray(renderPosts);
//     };

//     function renderPosts(err, posts) {
//         resp.render('home', {posts: posts});
//     };
// });

// app.all('/:hello/:user', function(req, resp){
//     resp.render('user', req.params);
// });

// app.post('/user', function(req, resp) {
//     resp.render('user');
// });

app.listen(3000);