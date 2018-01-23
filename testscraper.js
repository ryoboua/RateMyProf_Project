const scarper = require('./scraper.js');
const cheerio = require('cheerio');
const Stagger = require('stagger');

function getProfInfoWorm(num){
  for (var i = 2; i < num; i++) {
        scarper.fetchPageById("http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + i, catchProfInfo, i);
  }
}

function getProfInfo(list) {
    for (p in list) {
        scarper.fetchPageById("http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + list[p], catchProfInfo, list[p]);
    }
}

function getSchoolInfo(list) {
  for (s in list) {
        scarper.fetchPageById("http://www.ratemyprofessors.com/campusRatings.jsp?sid=" + list[s], catchSchoolInfo, list[s]);
    }
}

function getProfList(query, offset) {
   //console.log(offset)
    scarper.fetchPage("http://www.ratemyprofessors.com/search.jsp?query="+ query + "&offset=" + offset, catchList);
}

function catchProfInfo(data, id){
    // create seperate fuunction to trim

    const $ = cheerio.load(data)

    if(($("div").hasClass('header error')) === true) {
      return console.log("Page Not Found");
    } else {

    const pfname = $(".pfname").html().trim();
    const plname =  $(".plname").html().trim();
    const info = $(".result-title").html().split("<",1);
    const pinfo = info[0].trim();
    const info2 = pinfo.split(" ");
    const schoolname = $(".schoolname").text().slice(3);
    const schoolid = stripId($(".schoolname").html())

    // Get Quality - Start ----------------------
    const qualitylist = []
   
    $(".grade").each(function (i, elm){
      qualitylist[i] = $(this).html();
    });

    const quality = { 
        Overall_Quality: qualitylist[0].trim(),
        Retake_Precentage: qualitylist[1].trim(),
        Difficulty: qualitylist[2].trim()
      }
    //Get Quality - End ------------------------
   const taglist = getProfTagList($(".tag-box").html()) 

    const studentrating = $(".rating-count").html().split("S",1);
    const numberofrating = studentrating[0].trim();
      
    // console.log("ID: " + id +" - "+ pfname + " " + plname + " is a " +  pinfo + " " + schoolname + " - School Id: "+ schoolid + ".\n")
    // console.log(quality);
    // console.log("\n");
    // console.log(taglist)
    // console.log("\nNumber of Students Ratings: " + numberofrating + "\n");

    const results = {
      id,
      FirstName: pfname,
      LastName: plname,
      Department: info2[3],
      school: {
        Id: schoolid,
        Name: schoolname
      },
      qualitylist: quality,
      taglist,
      NumberOfStudentRatings: numberofrating

    }
    //console.log("------------------------------------------------------------------------------------------------------------------------------\n")
    console.log(results)
 }
}

function catchSchoolInfo(data, id) {
    const $ = cheerio.load(data)
    const sname = $(".result-text").text().trim();
    
    const location_result = $(".result-title").html().split(">");
    const location = location_result[1].split("<",1);
    const slocation = location[0].trim();
    
    const SchoolQualityStack = getSchoolQualityStack($(".quality-breakdown").html())
    
    const numberofschoolratings = $(".rating-count").html().split("S",1);
    const schoolratings = numberofschoolratings[0].trim();
    
    // console.log(sname,slocation);
    // console.log(schoolqualitystack);
    // console.log("schoolratings: " + schoolratings);

    results = {
      id,
      SchoolName: sname,
      SchoolLocation: slocation,
      NumberOfStudentRatings: schoolratings,
      SchoolQualityStack
    }

    console.log(results);
    
}

function catchList(data){
   // console.log(data)
    const $ = cheerio.load(data)
    const proflist = [];
    const schoollist = [];

    $(".listings .PROFESSOR").each( function (i, elm){
        proflist[i] = stripId($(this).html());
        
    })

    $(".listings .SCHOOL").each( function (i, elm){
        schoollist[i] = stripId($(this).html());
        
    })

    if((proflist.length && schoollist.length) == 0) return console.log("No Professsor or School found with under search term.")
    getSchoolInfo(schoollist);
    getProfInfo(proflist);
}

function stripId(data) {
  const x = data.split("id=");
  const id = x[1].split('"');

  return id[0];
}

function getSchoolQualityStack(data){
  const stack = {}
  const $$ = cheerio.load(data);
    $$(".rating").each( function(i, elm) {
      const rating = cheerio.load($$(this).html())
      stack[rating(".label").text()] = rating(".score").text();
    })
    return stack;
}

function getProfTagList(data){
  taglist = {};
  const $$ = cheerio.load(data);
  $$(".tag-box-choosetags").each( function(i, elm){
    const num = $$(this).text().replace( /^\D+/g, '').split(")")
    const tag = $$(this).text().split("(")
    taglist[tag[0].trim()] = num[0];
  })
  return taglist;
}



var s = [1452];
getSchoolInfo(s);
var p = [4];
getProfInfo(p);


 // for ( var i = 0; i < 1; i++) {
 //     const offset = 20 * i;
 //     getProfList("Ottawa", offset);
 // }

 //getProfInfoWorm(20);


// stagger = new Stagger(requestsPerSecond=1,maxRequests=1)

// for (var i=0; i<4; i++){
//     const offset = 20 * i;
//     stagger.push(getProfList("Ryan", offset));
// }
 
// stagger.on("progress", function(event){
//   console.log(event.value);
// });
 
// stagger.on("finish", function(event){
//   console.log("finish", event.duration);
// });
 
// stagger.start();




