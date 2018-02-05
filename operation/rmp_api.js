const Database = require('./database');
const connection = Database.connection;
const scarper = require('./scraper');
const cheerio = require('cheerio');
const mysql = require('mysql');

const package = [];
var i = 0;

// var s = [1452];
// getSchoolInfo(s);
// var p = [997496];
// getProfInfo(p);


// for ( var i = 0; i < 2; i++) {
//     const offset = 20 * i;
//     getProfList("Alicia", offset);
//     //getListByCountry("england",offset)

// }

//Important link for all professor - http://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacher
var lamda = 0;
var q = 0;
var worm =  setInterval(() => {
    fectch()
}, 20000);

const numberofpages = 89440;

function fectch() {
    if (q >= numberofpages) {
        sendToDb(package);
        return clearInterval(worm);
    }
    else if (lamda == 1){
        console.log("Sending to Db\n")
        sendToDb(package);
        lamda = 0;
        return worm;

    } else {
        const offset = 20 * q;
        console.log("Getting Page " + (q + 1) + "\n")
        getAllProfs(offset);
        q++
        lamda++
    }
}

//-------------------------------------------Function Section ---------------------------------------------------------------//


function getListByCountry(country, offset) {
    scarper.fetchPage("http://www.ratemyprofessors.com/search.jsp?query=&queryoption=HEADER&stateselect=&country=" + country + "&dept=&queryBy=schoolName&facetSearch=true&schoolName=&offset=" + offset + "&max=20", catchList);
}

function getProfList(query, offset) {
    scarper.fetchPage("http://www.ratemyprofessors.com/search.jsp?query=" + query + "&offset=" + offset, catchList);
}

function getAllProfs(offset) {
    scarper.fetchPage("http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&queryoption=HEADER&facetSearch=true&offset=" + offset, catchList);
}

function getProfInfoWorm(num) {
    for (var i = 2; i < num; i++) {
        scarper.fetchPageById("http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + i, catchProfInfo, i);
    }
}

function getSchoolInfo(list) {
    for (s in list) {
        scarper.fetchPageById("http://www.ratemyprofessors.com/campusRatings.jsp?sid=" + list[s], catchSchoolInfo, list[s]);
    }
}

function getProfInfo(list) {
    for (p in list) {
        scarper.fetchPageById("http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + list[p], catchProfInfo, list[p]);
    }
}

function getSchoolQualityStack(data) {

    // This part gets the rating scores with the titles
    // const stack = {}
    // const $$ = cheerio.load(data);
    //   $$(".rating").each( function(i, elm) {
    //     const rating = cheerio.load($$(this).html())
    //     stack[rating(".label").text()] = rating(".score").text();
    //   })
    //   return stack;

    const stack = [];
    const $$ = cheerio.load(data);
    $$(".rating").each(function(i, elm) {
        const rating = cheerio.load($$(this).html())
        stack[i] = rating(".score").text();
    })
    return stack;
}

function getProfTagList(data) {
    taglist = {};
    const $$ = cheerio.load(data);
    $$(".tag-box-choosetags").each(function(i, elm) {
        const num = $$(this).text().replace(/^\D+/g, '').split(")")
        const tag = $$(this).text().split("(")
        taglist[tag[0].trim()] = num[0];
    })
    return taglist;
}

async function catchProfInfo(data, id) {
    // create seperate fuunction to trim

    const $ = cheerio.load(data)

    if (($("div").hasClass('header error')) === true) {
        return console.log("Page Not Found At Id: "+id);
    } else {

        const pfname = $(".pfname").html().trim();
        const plname = $(".plname").html().trim();
        const info = $(".result-title").html().split("<", 1);
        const pinfo = info[0].trim();
        const info2 = pinfo.split(" ");
        const schoolname = $(".schoolname").text().slice(3);
        const schoolid = stripId($(".schoolname").html())

        // Get Quality - Start ----------------------
        const qualitylist = []

        $(".grade").each(function(i, elm) {
            qualitylist[i] = $(this).html();
        });

        const quality = {
            Overall_Quality: qualitylist[0].trim(),
            Retake_Precentage: qualitylist[1].trim(),
            Difficulty: qualitylist[2].trim()
        }
        //Get Quality - End ------------------------
        const taglist = getProfTagList($(".tag-box").html())

        const studentrating = $(".rating-count").html().split("S", 1);
        const numberofrating = studentrating[0].trim();

        // console.log("ID: " + id +" - "+ pfname + " " + plname + " is a " +  pinfo + " " + schoolname + " - School Id: "+ schoolid + ".\n")
        // console.log(quality);
        // console.log("\n");
        // console.log(taglist)
        // console.log("\nNumber of Students Ratings: " + numberofrating + "\n");

        // const results = {
        //     id,
        //     FirstName: pfname,
        //     LastName: plname,
        //     Department: info2[3],
        //     //school: {
        //     Id: schoolid,
        //     Name: schoolname,

        //     qualitylist: quality,
        //     taglist,
        //     NumberOfStudentRatings: numberofrating

        // }

        const post = {
            rmp_p_id: id,
            FirstName: pfname,
            LastName: plname,
            Department: info2[3],
            rmp_s_id: schoolid,
            SchoolName: schoolname,
            NumberOfStudentRatings: numberofrating,
            Overall_Quality: quality.Overall_Quality,
            Retake_Precentage: quality.Retake_Precentage,
            Difficulty: quality.Difficulty,
            taglist: JSON.stringify(taglist)
        };
        //console.log(post);
       await package.push(post);
        //sendToDb(package);
    }
}

function catchSchoolInfo(data, id) {
    const $ = cheerio.load(data)

    if (($("div").hasClass('header error')) === true) {
        return console.log("Page Not Found At Id: "+id);
    } else {
        const sname = $(".result-text").text().trim();

        const location_result = $(".result-title").html().split(">");
        const location = location_result[1].split("<", 1);
        const slocation = location[0].trim();

        const SchoolQualityStack = getSchoolQualityStack($(".quality-breakdown").html())

        const numberofschoolratings = $(".rating-count").html().split("S", 1);
        const schoolratings = numberofschoolratings[0].trim();

        results = {
            rmp_p_id: id,
            SchoolName: sname,
            SchoolLocation: slocation,
            NumberOfStudentRatings: schoolratings,
            Reputation: SchoolQualityStack[0],
            Location: SchoolQualityStack[1],
            Internet: SchoolQualityStack[2],
            Food: SchoolQualityStack[3],
            Oppertunity: SchoolQualityStack[4],
            Facilities: SchoolQualityStack[5],
            Clubs: SchoolQualityStack[6],
            Social: SchoolQualityStack[7],
            Happiness: SchoolQualityStack[8],
            Safety: SchoolQualityStack[9]
        }
        package.push(results);
    }
}

function catchList(data) {
    const $ = cheerio.load(data)
    const proflist = [];
    const schoollist = [];

    $(".listings .PROFESSOR").each(function(i, elm) {
        proflist[i] = stripId($(this).html());

    })

    $(".listings .SCHOOL").each(function(i, elm) {
        schoollist[i] = stripId($(this).html());

    })

    //if ((proflist.length && schoollist.length) === 0) return console.log("No Professsor or School found with under search term.")
    //getSchoolInfo(schoollist);
    getProfInfo(proflist);

}

function stripId(data) {
    const x = data.split("id=");
    const id = x[1].split('"');
    return id[0];
}

async function sendToDb(data) {
  var numofentries = 0;
  connection.connect(function(err){console.log("Connection to database successfully etablished.\n")});
  for (let item of data) {
    await connection.query('INSERT INTO Teacher SET ?', item, function(error, results, fields) {
    if (error) throw error;
    //console.log("Professor successfully inserted in the Teacher table. Insert ID: " + results.insertId + "\n");
    });
    numofentries++;
  }
  console.log(numofentries + " items entered\n");
  // Clearing the package after each insert to db so there's no duplicates
  package.length = 0;
  //connection.end(function(err){ console.log("Connection Terminated. " + numofentries + " items entered\n")});
}

