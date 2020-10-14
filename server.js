const express = require('express');
const path = require('path');   
const mongoose = require('mongoose');
const expressSession = require('express-session');
const flash = require('connect-flash');

const ShortURL = require('./model/ShortURL');
const app = express();
const PORT = process.argv[2] || 3000;

const URL = "url.io/";



app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(expressSession({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());


app.listen(PORT, () =>{
    console.log('Server is listening on port ' + PORT);
})

mongoose.connect('mongodb+srv://test_user:test1@cluster0-k7vde.mongodb.net/url-shortener',
{   useNewUrlParser: true,
    useUnifiedTopology: true },
()=>{
    console.log("Connected to db");
});

app.use("/public", express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('index',
    {
        linkExists: req.flash('exists'),
        newLink: req.flash('newLink')
    });
})


app.post('/shorten', (req, res, next) => {
    let prefix = req.body.prefix.toLowerCase();
    let originalLink = req.body.link;
    ShortURL.findOne({
        shortLink: prefix
    }, (err, link) =>{
        if(err) {return next(err)}
        if(link) {
            req.flash('exists', "This link already exists");
            res.redirect('/')
            return next({message: "Short link exists"})
        }
    
        let newLink = new ShortURL({
            originalLink: originalLink,
            shortLink: prefix
        });

        newLink.save();
        req.flash('newLink', prefix);
        res.redirect('/');
    })
})

app.get('/:link', (req, res, next) => {
    ShortURL.findOne({
        shortLink: req.params.link
    }, (err, redirectLink) => {
        if(err) {return next(err)}
        if(!redirectLink) {return next({message: "Short link doesn't exists"})}
        console.log("Redirecting: " + redirectLink.originalLink);
        res.redirect(redirectLink.originalLink);
    })
})


app.use(express.json());
