#!/usr/bin/env node

/**
 * @index.js
 *  
 * This is the main component of the cognito export utility.
 * 
 * Author: Irv Shapiro
 * 
 * License: MIT Open Source
 */

const PROMPT = require("prompt");
const AWS = require("aws-sdk");
const DELAY = require("delay");
const delay = require("delay");

// Since this utility reads 
let csvData = [];

console.log("Starting cognito export");

// Function to retrieve user records from AWS Cognito
//
// This is defined as an async function so the await statement is available
// to synchronize AWS calls which are asynchronous.
//
const getUsers = async (awsProfile, awsPoolId, mwtFileName) => {
  try {
    let allUsers = [];
    let more = true;
    let paginationToken;
    let counter = 0;

    AWS.config.credentials = new AWS.SharedIniFileCredentials({
      profile: awsProfile,
    });

    AWS.config.update({
      region: "us-east-1",
    });

    const cognito = new AWS.CognitoIdentityServiceProvider();

    //  AttributesToGet: ["email"],
    while (more) {
      let params = {
        UserPoolId: awsPoolId,
        Limit: 50,
      };

      if (typeof paginationToken != "undefined") {
        params.PaginationToken = paginationToken;
      }

      // const cognito = new AWS.CognitoIdentityServiceProvider();
      let rawUsers;
      try {
        rawUsers = await cognito.listUsers(params).promise();
        if (typeof rawUsers.Users != "undefined") allUsers = allUsers.concat(rawUsers.Users);
      } catch(err) {
        // skip this user
        console.log(err.message);
      }

      // Now move on to the next users even if the previous user generated an error
      console.log(allUsers.length);

      if (typeof rawUsers.PaginationToken != "undefined") {
        paginationToken = rawUsers.PaginationToken;
      } else {
        more = false;
      }
      await delay(1000);
    }

    // Now write the data out to a file
    await writeUsers(allUsers,mwtFileName);

    console.log(`File: ${mwtFileName} contains ${allUsers.length} users`);
  } catch (e) {
    console.log(e);
  }
};

// Function to write the array of user object to a file in CSV format
const writeUsers = (userList, myFileName) => {
  const fs = require("fs");

  //
  // Create the file with a csv header for the first row
  //

  fs.writeFileSync(myFileName,'"username","email"');

  //
  // Loop through the users
  //

  userList.forEach(function (each) {
    // console.log(JSON.stringify(each, null, 2));
    //console.log(each.Username, each.Attributes[0].Value);
    try {
      fs.appendFileSync(myFileName, `"${each.Username}","${each.Attributes[0].Value}"\n`);
    } catch (error) {
      console.log(error);
    }
  });
};

//
// Prompt at the command line for AWS profile and Cognito pool id and then retrieve the data
//
// Since all IO is asynchronous, we must invoke the rest of this utility inside of the
// prompt callback function.

PROMPT.start();
// Prompt and get user input then display those data in console.
PROMPT.get(
  [
    {
      name: "profile",
      description: "Please enter your AWS profile",
      required: true,
    },
    {
      name: "poolId",
      description: "Please enter your Cognito Pool ID",
      require: true,
    },
    {
      name: "fileName",
      description: "Please a name for your file with an extension",
      require: true,
    },
  ],
  function (err, result) {
    if (err) {
      console.log(err.message);
      return;
    }
    //
    // Invoke getUsers with the input from the command line
    //
    getUsers(result.profile, result.poolId, result.fileName);
  }
);
