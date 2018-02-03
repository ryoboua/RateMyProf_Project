const Database = require('./database');
const connection = Database.connection;
const express = require('express')
const app = express()
const hbs = require('express-handlebars')
const path = require('path')
const data = require('./chartdata/dataprep.js')
const createChart = require('./charts/createChart.js')
const bar = require('./chartdata/columnchart_data.js')


app.use("/views",express.static(__dirname + "/views"));
app.use("/chartdata",express.static(__dirname + "/chartdata"));
app.use("/",express.static(__dirname + "/"));

app.set('views', path.join(__dirname,'views') );
app.engine('handlebars', hbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars');


app.listen(3000, () => console.log('Example app listening on port 3000!!'))


app.get('/', (req, res) => {
	

const information = data.getData().then(function(results) {
const schoolname = results[0].SchoolName;
const chartData = createChart.createBarChart(schoolname)
//console.log(chartData)
//res.send(chartData)
res.render('home',{data: chartData})
})	
  //res.render('home');



})



