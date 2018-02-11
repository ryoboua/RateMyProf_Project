const rmp_api = require('./rmp_api');


function start(){ 
	//Important link for all professor - http://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacher
var lamda = 0;
var q = 0;
var worm =  setInterval(() => {
    fectch()
}, 5000);

const numberofpages = 5;

function fectch() {
    if (q >= numberofpages) {
    	//console.log(rmp_api.package)
        rmp_api.sendManyTeachersToDb(rmp_api.package);
        return clearInterval(worm);
    }
    else if (lamda == 1){
        console.log("Sending to Db\n")
        //console.log(rmp_api.package)
        rmp_api.sendManyTeachersToDb(rmp_api.package);
        lamda = 0;
        return worm;

    } else {
        const offset = 20 * q;
        console.log("Getting Page " + (q + 1) + "\n")
        rmp_api.getAllProfs(offset);
        q++
        lamda++
    }
}
}

start();