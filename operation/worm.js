var prompt = require('prompt');
const rmp_api = require('./rmp_api');


// var s = [1452];
// getSchoolInfo(s);
// var p = [2004247,2004629,2004287];
// getProfInfo(p);

// for ( var i = 0; i < 1; i++) {
//     const offset = 20 * i;
//     getProfList("Alicia", offset);
//     //getListByCountry("england",offset)

// }

// Worm parameters
var numOfDataset = 0;
var index = 0;
const numberofpages = 1;

startWorm()

function startWorm(){
    prompt.start()

    prompt.get('wormType', (err, result) => {

        switch(result.wormType) {
            case 'prof':
                console.log("Opening worm hole\n")
                let pworm =  setInterval(() => {
                    profWorm()
                }, 5000);
                
                function profWorm() {
                    if (index == numberofpages) {
                        console.log("Sending Final Dataset to Db and closing worm hole")
                        //rmp_api.sendManyTeachersToDb(rmp_api.package);
                        return clearInterval(pworm);
                    }
                    else if (numOfDataset == 1){
                        console.log("Sending to Db\n")
                        //rmp_api.sendManyTeachersToDb(rmp_api.package);
                        numOfDataset = 0;
                        return ProfWorm;
                
                    } else {
                        const offset = 20 * index;
                        console.log("Getting Page " + (index + 1) + "\n")
                        //rmp_api.getAllProfs(offset);
                        index++
                        numOfDataset++
                    }
                }
            break;
            case 'school':
                console.log("Opening worm hole\n")
                let sworm =  setInterval(() => {
                    schoolWorm()
                }, 5000);
        
                function schoolWorm() {
                    if (index === numberofpages){
                        console.log("Sending Final Dataset to Db and closing worm hole")
                        //rmp_api.sendManySchoolsToDb(rmp_api.package);
                        return clearInterval(sworm);
                    }
                    else if (numOfDataset === 1) {
                        console.log("Sending to Db\n")
                        //rmp_api.sendManySchoolsToDb(rmp_api.package);
                        numOfDataset = 0;
                        return SchoolWorm;
                
                    } else {
                        const offset = 20 * index;
                        console.log("Getting Page " + (index + 1) + "\n")
                        //rmp_api.getListByCountry('canada',offset);
                        index++
                        numOfDataset++
                    }
                }
            break;
            default:
                console.log('Worm type not found')
        }
    })



}

