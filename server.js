const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const app = express();
const config = ('./config.js')
const User = require('./models/user');
const middleware = require('./middleware');
const service = require('./service');


mongoose.connect('mongodb://localhost:27017/token', { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;
    console.log('Base de datos online');
});

//Variable secreta
app.set('superSecret',config.secret)

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());  
app.use(methodOverride());

// =======================
// Routes ================
// =======================
app.get('/',(req, res) => {
    res.send('Hola! API: http://localhost:3000/api');
});

//Iniciando el servidor
app.listen(3000,()=>{
    console.log("Node server running on http://localhost:3000");
})

app.get('/setup',(req,res)=>{
    let nick = new User({
        name: 'Oscar',
        password: '123456',
        admin:true
    })

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});


// API ROUTES
const apiRoutes = express.Router(); 

apiRoutes.get('/',(req, res) => {
  res.json({ message: 'Bienvenido al api de programacion.com.py :)' });
});

apiRoutes.get('/users', (req, res) => {
  User.find({},(err, users) => {
    res.json(users);
  })
})


apiRoutes.post('/authenticate', (req, res) => {
	//find the user
	User.findOne({
		name: req.body.name
	}, function(err, user) {

	if (err) throw err;

	if (!user) {
		res.json({ success: false, message: 'Authentication failed. User not found.' });
	} else if (user) {

	// check if password matches
	if (user.password != req.body.password) {
		res.json({ success: false, message: 'Authentication failed. Wrong password.' });
	} else {
		// return the information including token as JSON
		res.json({
		success: true,
		message: 'Enjoy your token!',
		token: service.createToken(user)
		});
	}
	}
	});
});


apiRoutes.get('/private',middleware.ensureAuthenticated, (req, res) => {
	let token = req.headers.authorization.split(" ")[1];  
	res.json({ message: 'Estás autenticado correctamente y tu _id es:'+req.user });
});

app.use('/api',apiRoutes)