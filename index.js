const express = require('express');
const mysql = require('mysql');
const secrets = require('./secrets');
const getUsers = require('./getUsers');
const app = express();

var connection = mysql.createConnection({
    host     : secrets.host,
    user     : secrets.user,
    password : secrets.password,
    database : secrets.database
  });


app.get('/',(req,res) => {
    getUsers.getUsers(connection,res);
});

//this will be called by the user to get more people to show on the swiping page
//the request will contain the uid of the person (and security credentials?) 
//the server should then retrieve from the database their filters, then generate new users
//it should check to make sure they haven't been seen recently or already swiped on recently. 
app.get('/generateUsers',(req,res) => { 
    //in the request they will send the uid, which gender they are etc. all the stuff for their account
    //use that to gather filter information
    id = req.headers.id; //working
    myLatitude = req.headers.latitude;
    myLongitude = req.headers.longitude;
    
    text = `select * from filters where id = '${id}'`;
    if(id != null){
        //retrieve the necessary filter information
        connection.query(text,(error,results,fields) => {
            //console.log(results);
            const result = Object.values(JSON.parse(JSON.stringify(results)));
            result.forEach((v) => {
                //console.log(v.attractedTo);
                //console.log(`latitude: '${myLatitude}', longitude: '${myLongitude}'`);
                var factor = 1/111.0;
                myLatitude = -70;
                myLongitude = 160;
                maxLatitude = myLatitude;
                maxLatitude = maxLatitude + (v.maxDistance * factor);
                //console.log(maxLatitude);
                if(maxLatitude > 90.0) {
                    maxLatitude = 90.0;
                }
                minLatitude = myLatitude;
                minLatitude = myLatitude - v.maxDistance * factor;
                if(minLatitude < -90.0){
                    minLatitude = -90.0;
                }
                maxLongitude = myLongitude + v.maxDistance * factor;
                if(maxLongitude > 180) {
                    temp = maxLongitude - 180;
                    maxLongitude = -180+temp;
                }
                minLongitude = myLongitude - v.maxDistance * factor;
                if(minLongitude < -180){
                    temp = minLongitude + 180;
                    minLongitude = 180-temp;
                }
                v.minBirthday = v.minBirthday.slice(0,9);
                v.maxBirthday = v.maxBirthday.slice(0,9);
                //console.log(v.minBirthday);
                //console.log(v.maxBirthday);
                console.log(`maxLatitude: ${maxLatitude}, minLatitude: ${minLatitude}, maxLongitude: ${maxLongitude}, minLongitude: ${minLongitude}`);
                text2 = `select * from users where sex = '${v.attractedTo}' AND DATE(birthdate) BETWEEN '${v.minBirthday}' AND '${v.maxBirthday}' AND latitude <= ${maxLatitude} AND latitude >= ${minLatitude} AND longitude <= ${maxLongitude} AND longitude >= ${minLongitude} AND id != ${id}`;
                connection.query(text2,(error,results,fields) => {
                    console.log(results);
                });
            
            });

            //var maxDistance =
            //var minBirthday =
            //var maxBirthday = 
            //var attractedTo = 
            
            //now construct request to the user table 

            
        });
        


    }
    console.log(id);
});

app.listen(80);