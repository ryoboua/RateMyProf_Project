const Database = require('../operation/database');
const connection = Database.connection;


module.exports.getData = function() {
  const query = "SELECT * FROM CanadianSchool WHERE NumberOfStudentRatings > 0 ORDER BY RAND() LIMIT 4"
  return new Promise(function(resolve, reject) {
    connection.query(query,function(err, results, fields){
    if(err) console.log("Error getting information: " + err);
    resolve(JSON.parse(JSON.stringify(results))); // Hacky solution
	})
  });
}

module.exports.prepColumnBarData = function(data){
	const list = [];

	for (s in data){
		const item = {
			name: data[s].SchoolName,
			num: data[s].NumberOfStudentRatings
		}
		list.push(item);
	}
	console.log(list)
	return list;	
} 

module.exports.getDonutData = function() {
	const query = "SELECT * FROM Teacher WHERE Retake_Precentage > 0 ORDER BY RAND() LIMIT 1"
  	return new Promise(function(resolve, reject) {
	    connection.query(query,function(err, results, fields){
	    if(err) console.log("Error getting information: " + err);
	    resolve(JSON.parse(JSON.stringify(results))); // Hacky solution
	})
  });
}

module.exports.prepDonutData = function(data) {
	const teacher = {
		name: data[0].FirstName + " " + data[0].LastName,
		overallquality: data[0].Overall_Quality,
		difficulty: data[0].Difficulty,
		retake: (data[0].Retake_Precentage * 5) / 100

	}

	return teacher;
}

module.exports.prepRadarData = function(data) {
	const list = [];

	for (s in data){
		const item = {
			name: data[s].SchoolName,
			num: data[s].NumberOfStudentRatings,
			reputation: data[s].Reputation, 
		    location: data[s].Location, 
		    internet: data[s].Internet, 
		    food: data[s].Food, 
		    oppertunity: data[s].Oppertunity, 
		    facilities: data[s].Facilities,
		    clubs: data[s].Clubs,
		    social: data[s].Social,
		    happiness: data[s].Happiness,
		    safety: ((typeof data[s].Safety) === 'object') ? 0 : data[s].Safety

		}
		list.push(item);
	}

		return list;	
}