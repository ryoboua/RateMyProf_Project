const Database = require('./database');
const connection = Database.connection;
const express = require('express')
const app = express()
const hbs = require('express-handlebars')
const path = require('path')

app.set('views', path.join(__dirname,'views') );
app.engine('handlebars', hbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars');


app.listen(3000, () => console.log('Example app listening on port 3000!!'))



app.get('/', (req, res) => {
	// const informaton = getData();
	// informaton.then(function(results) {
	// res.send(results)
	// res.render('chart')

	// })
  res.render('home',{
  	title: 'PENIS'
  });



})


// function getData(){
//   const query = "SELECT * FROM CanadianSchool LIMIT 3"
//   //connection.connect(function(err){console.log("Connection to database successfully etablished.\n")});
//   return new Promise(function(resolve, reject) {
//   	connection.query(query,function(err, results, fields){
//     if(err) console.log("Error getting information: " + err);
//     	console.log(results);
//     	resolve(results);
// })
//   });
//  connection.end(function(err){ console.log("Connection Terminated\n")});
// }


