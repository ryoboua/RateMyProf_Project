const Database = require('./database');
const connection = Database.connection;
const scarper = require('./scraper');
const cheerio = require('cheerio');
const mysql = require('mysql');
const _ = require('underscore');


var package = [];
module.exports.package = package;
var i = 0;
//997496
// var s = [1452];
// getSchoolInfo(s);
// var p = [2004247,2004629,2004287];
// getProfInfo(p);



// for ( var i = 0; i < 1; i++) {
//     const offset = 20 * i;
//     getProfList("Alicia", offset);
//     //getListByCountry("england",offset)

// }



//-------------------------------------------Function Section ---------------------------------------------------------------//


function getListByCountry(country, offset) {
    scarper.fetchPage("http://www.ratemyprofessors.com/search.jsp?query=&queryoption=HEADER&stateselect=&country=" + country + "&dept=&queryBy=schoolName&facetSearch=true&schoolName=&offset=" + offset + "&max=20", catchList);
}

function getProfList(query, offset) {
    scarper.fetchPage("http://www.ratemyprofessors.com/search.jsp?query=" + query + "&offset=" + offset, catchList);
}

module.exports.getAllProfs = function(offset) {
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
        taglist[tag[0].trim().toLowerCase()] = num[0];
    })
    return taglist;
}

async function catchProfInfo(data, id) {

    try {

        const $ = cheerio.load(data)

        if (($("div").hasClass('header error')) === true) {
            return console.log("Page Not Found At Id: " + id);
        } else {

            let firstname = $(".pfname").html();
            let lastname = $(".plname").html();
            let department = $(".result-title").html() === null ? '' : getProfDepartment($(".result-title").html().split("<", 1));
            let schoolname = $(".schoolname").text().slice(3);
            let school_id = stripId($(".schoolname").html())

            // Get Quality - Start ----------------------
            const qualitylist = []

            $(".grade").each(function(i, elm) {
                qualitylist[i] = $(this).html();
            });

            let overall_quality = qualitylist[0];
            let retake_precentage = qualitylist[1];
            let difficulty = qualitylist[2];

            //Get Quality - End ------------------------
            let taglist = getProfTagList($(".tag-box").html())

            let numberofrating = $(".rating-count").html().split("S", 1);
            numberofrating = numberofrating[0];


            let results = {

                firstname,
                lastname,
                department,
                rmp_s_id: school_id,
                schoolname,
                overall_quality,
                retake_precentage,
                difficulty,
                numberofrating
            };

            for (info in results) {
                try {
                    results[info] = results[info].trim()
                } catch (error) {
                    break;
                }
            }

            results.rmp_p_id = id;
            results.taglist = taglist



            await package.push(results);
            //  sendOnetoDb(post);
        }
    } catch (err) {
        return console.log("Some weird happned at prof Id: " + id);
    }

}

function catchSchoolInfo(data, id) {


    try {
        const $ = cheerio.load(data)

        if (($("div").hasClass('header error')) === true) {
            return console.log("Page Not Found At Id: " + id);
        } else {
            let sname = $(".result-text").text();

            let location = $(".result-title").html().split(">");
            location = location[1].split("<", 1);
            let slocation = location[0];

            const SchoolQualityStack = getSchoolQualityStack($(".quality-breakdown").html())

            let numberofschoolratings = $(".rating-count").html().split("S", 1);
            numberofschoolratings = numberofschoolratings[0];

            let website = $(".website-icon").attr('href');

            let results = {
                sname,
                slocation,
                numberofschoolratings
            }

            for (info in results) {
                try {
                    results[info] = results[info].trim()
                } catch (error) {
                    break;
                }
            }


            results.rmp_p_id = id;
            results.reputation = SchoolQualityStack[0];
            results.location = SchoolQualityStack[1];
            results.internet = SchoolQualityStack[2];
            results.food = SchoolQualityStack[3];
            results.oppertunity = SchoolQualityStack[4];
            results.facilities = SchoolQualityStack[5];
            results.clubs = SchoolQualityStack[6];
            results.social = SchoolQualityStack[7];
            results.happiness = SchoolQualityStack[8];
            results.safety = SchoolQualityStack[9];
            results.website = website;


            console.log(results)
            // package.push(results);
        }
    } catch (err) {
        return console.log("Some weird happned at school Id: " + id);
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
    let x = data.split("id=");
    x = x[1].split('"');
    return x[0];
}


async function sendManyToDb(data) {
    var numofentries = 0;
    connection.connect(function(err) {
        console.log("Connection to database successfully etablished.\n")
    });
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
    connection.end(function(err) {
        console.log("Connection Terminated. " + numofentries + " items entered\n")
    });
}

function getProfDepartment(data) {
    let info = data;
    info = info[0].trim();
    info = info.split(" ");
    return info[3];
}

function sendOnetoDb(data) {
    connection.connect((err) => {});

    connection.query('INSERT INTO Teacher SET ?', data, function(error, results, fields) {
        if (error) throw error;
        //console.log("Professor successfully inserted in the Teacher table. Insert ID: " + results.insertId + "\n");
        connection.end((err) => {});

    });

}

module.exports.sendManyTeachersToDb = async function(data) {
    var tagholder = [];
    for (let item of data) {

        let temp = _.omit(item, 'taglist')
        await connection.query('INSERT INTO teachertest SET ?', temp, function(error, results, fields) {

            if (error) throw error;

            const pid = results.insertId;
            const list = item.taglist
//Inserting Tags in the Database
            for (let tag in list) {
                findTagId(tag).then(t => {
                    if (t.length > 0) {
                        connection.query('INSERT INTO teacher_tags SET tagid = "?", teacherid = "?", count = ?', [t[0].tagid, pid, list[tag]], (error, results, fields) => {
                            if (error) throw error;                            
                        })
                    } else {
                        addTag(tag).then(t => {
                            console.log(t);
                        } )
                        
                    }
                })

            }


        })
    };

    console.log("Done")

// Clearing the package after each insert to db so there's no duplicates
    package.length = 0;

}

async function findTagId(tag) {
    return new Promise(function(resolve, reject) {
            connection.query('SELECT tagid FROM all_tags WHERE tagtitle = ?', tag, function(error, result, fields) {
            if (error) throw error;
            resolve(JSON.parse(JSON.stringify(result)));
        })
    });
}

async function addTag(tag) {
    return new Promise(function(resolve, reject){
        connection.query('INSERT INTO tags SET tagtitle = ?', tag, (error, results, fields) => {        
        if (error) throw error;
        resolve(JSON.parse(JSON.stringify(results.insertId)));
        })
    })
}