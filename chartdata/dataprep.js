const Database = require('../database');
const connection = Database.connection;


module.exports.getData = function() {
  const query = "SELECT * FROM EnglandSchool LIMIT 1"
  //connection.connect(function(err){console.log("Connection to database successfully etablished.\n")});
  return new Promise(function(resolve, reject) {
    connection.query(query,function(err, results, fields){
    if(err) console.log("Error getting information: " + err);
      resolve(results);
})
  });
}

