/*
This is a simple way to get the data from the Google Analytics4 with few dependencies

Before running this you will need to create a SERVICE ACCOUNT with permissions to your Google Analytics 4 property
visit https://console.cloud.google.com/apis/credential create a service account and download the json file then add the email address
from that file to your google analytics 4 property as a user with read only permissions

download the key file REPLACE sample-key.json with your key file

You will also need to get your property id from the Google Analytics admin console (GA4) only

You will modify the information you receive back as well as adding filters and other parameters requestBody object
line 57 - 65
 */

async function test() {
    const propertyId = 'YOURPROPERTY ID E.G 123456'; // replace with your property id (GA4)
    const keyFile = 'sample-json-data.json';// replace with your key file,if you want to move the key file to a different location you will need to update the path or change
    const startDate = '2020-09-01';
    const endDate = '2022-12-15';
    const data = await runReport(propertyId, keyFile, startDate, endDate);
    console.log('RETURNED DATA', data);
}

test();



async function runReport(propertyId, keyFile, startDate, endDate) {
    const { JWT } = require('google-auth-library');
    const fs = require('fs');
    const request = require('request');
    // The scope for the Google Analytics Data API
    const scope = 'https://www.googleapis.com/auth/analytics.readonly';

    // Load the service account key file ***NOTE YOU COULD FEED THE JSON DATA DIRECTLY HERE
    const key = JSON.parse(fs.readFileSync(keyFile));
    // Create a JWT client
    const client = new JWT({
        email: key.client_email,
        key: key.private_key,
        scopes: [scope]
    });

    // Set the impersonated user
    client.subject = key.client_email;

    try {
        // Retrieve the access token
        const { access_token: accessToken } = await client.authorize();

        // Set up the request body with the necessary parameters
        // you can find samples of data you want here
        const metrics = [{ name: 'activeUsers' }];
        const dimensions = [{ name: 'country' }];

        const requestBody = {
            dateRanges: [
                {
                    startDate,
                    endDate
                }
            ],
            metrics,
            dimensions
        };

        // Set up the request options
        const options = {
            url: `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(requestBody)
        };

        // Make the request to retrieve the data
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if (error) {
                    console.error(error);
                    return reject(false);
                }
                // Parse the response body
                const data = JSON.parse(body);
                // Resolve with the data
                resolve(data);
            });
        });
    } catch (error) {
        console.error(error);
        return false;
    }
}


