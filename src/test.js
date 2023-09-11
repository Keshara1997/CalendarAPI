const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');

import dotenv from "dotenv";

dotenv.config();


const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json'; 


const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);


async function getBusyIntervals(calendarId, startTime, endTime) {
  try {

    const token = await authorize();
    oAuth2Client.setCredentials(token);

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });


    const timeMin = startTime.toISOString();
    const timeMax = endTime.toISOString();

  
    const response = await calendar.freebusy.query({
      resource: {
        timeMin,
        timeMax,
        items: [{ id: calendarId }],
      },
    });

    const busyIntervals = response.data.calendars[calendarId].busy;
    console.log('Busy Intervals:');
    console.log(busyIntervals);
    return busyIntervals;
  } catch (err) {
    console.error('Error fetching busy intervals:', err);
  }
}


async function authorize() {
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        getNewToken(oAuth2Client)
          .then((newToken) => resolve(newToken))
          .catch((err) => reject(err));
      } else {
        resolve(JSON.parse(token));
      }
    });
  });
}

async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this URL:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();
    try {
      const token = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('Token stored to', TOKEN_PATH);
      return token;
    } catch (err) {
      console.error('Error getting token:', err);
    }
  });
}


getBusyIntervals(calendarId, startTime, endTime);
