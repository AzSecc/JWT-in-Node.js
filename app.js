require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const app = express()
// app.use(express.json)
app.use(bodyParser.urlencoded({
    extended: true
}));

var posts = [
    {
        username: 'CSRF',
        title: 'Client Side Attack'
    },
    {
        username: 'SSRF',
        title: 'Server Side Attack'
    }
]

app.get('/', (req, res, next) => {
    res.send('Works');
});

app.get('/posts', authenticateToken, (req, res, next) => {
    res.json(posts.filter(post => post.username === req.user.name));
});

app.get('/login', (req, res, next) => {
    res.sendFile(__dirname + '/login.html')
});

app.post('/login', (req, res, next) => {
    //Authenticate user

    const username = req.body.username;
    const user = {
        name: username
    }
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '24h'})
    res.json({ accessToken: accessToken })
});

function authenticateToken(req, res, next) {
    //Requestdən authrization headerinin dəyərini extract etməkçün:
    const authHeader = req.headers['authorization']
    //Authorization headerinin dəyərindən sadəcə tokeni extract edib token dəyişəninə assign elə:
    const token = authHeader && authHeader.split(' ')[1]
    //Əgər token yoxdursa, deməli unauthorized dır, getsin login olsun bir daha gəlsin:
    if (token == null) return res.sendStatus(401)
    //Əgər yuxarıdakı if dən keçibsə, deməli, jvt token var, elə isə verify edək tokeni:
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        //403 - tokenin var, amma valid deyil
        if(err) return res.sendStatus(403)
        //Token varsa və validdirsə, yəni heç bir porblem yoxdursa
        req.user = user
        next()
    });
}

app.listen(3000, (req, res, next) => {
    console.log('Basladi')
});
