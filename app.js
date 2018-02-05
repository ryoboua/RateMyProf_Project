const Database = require('./operation/database');
const connection = Database.connection;
const express = require('express')
const app = express()
const hbs = require('express-handlebars')
const path = require('path')
const dataprep = require('./chartdata/dataprep.js')
const bar = require('./chartdata/columnchart_data.js')


app.use("/views",express.static(__dirname + "/views"));
app.use("/chartdata",express.static(__dirname + "/chartdata"));
app.use("/",express.static(__dirname + "/"));

app.set('views', path.join(__dirname,'views') );
app.engine('handlebars', hbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars');


app.listen(3000, () => console.log('Example app listening on port 3000!!'))


app.get('/', (req, res) => {
	dataprep.getData().then( (results) => {
	const chartData = dataprep.prepColumnBarData(results)	
	res.render('columnbarchart',{school: chartData})
	})
})

app.get('/donut', (req, res) => {
	dataprep.getDonutData().then((results) => {
	const donutdata = dataprep.prepDonutData(results);
	res.render('donutchart', {teacher: donutdata});
	})
})

app.get('/radar', (req, res) => {
	dataprep.getData().then((results) => {
	const chartData = dataprep.prepRadarData(results);
	res.render('radar', {school: chartData});
	})
})	

app.get('/radar/:name',(req, res) => {
	res.send(req.params)
})



