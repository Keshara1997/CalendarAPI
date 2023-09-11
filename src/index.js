import dotenv from "dotenv";

dotenv.config();
//import express and body parser
import express from "express";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



import { google } from "googleapis";
 import axios from "axios";
//import { dayjs } from "dayjs"; 
import dayjs from 'dayjs';

const calendar = google.calendar({
  version: "v3",
  auth: process.env.API_KEY,
})


const PORT = process.env.NODE_ENV || 3000;

const auth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const scopes = [

  "https://www.googleapis.com/auth/calendar"
];

app.get("/google", (req, res) => {
 
  const url =auth2Client.generateAuthUrl({
  acces_type:"offline",
  scope:scopes

  });
  res.redirect(url);
});

app.get('/google/redirect', async (req, res) => {
  const token = req.query.code;


const {tokens} = await auth2Client.getToken(token)
auth2Client.setCredentials(tokens);

  res.send({
    msg : "you have successfully logged in"
  });
});

app.get("/events", async (req, res) => {

 console.log(auth2Client.credentials.access_token);

  await calendar.events.insert(
    {
      calendarId: "primary",
      auth: auth2Client,
      requestBody: {
      summary: "Software engineer Test submit",
      description: "This is a sample event",
      start: {
        dateTime: dayjs().add(1, "day").toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: dayjs().add(1, "day").add(2, "hour").toISOString(),
        timeZone: "Asia/Kolkata",
      }

    },
  });
res.send({
  msg:"Done",

});

});

app.post("/busyevents", async (req, res) => {

  console.log(req.body);

  const startTime = new Date(req.body.startTime);
  const endTime = new Date(req.body.endTime);
  const calendarId = req.body.calendarId;

  const response = await calendar.freebusy.query({
    resource: {
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      items: [{ id: calendarId }],
    },
  });

  const busyIntervals = response.data.calendars[calendarId].busy;
  console.log(response.data)
  console.log('Busy Intervals:');
  console.log(busyIntervals);
  res.send({
    msg:"Done",
    busyIntervals:busyIntervals,
  
  });
  return busyIntervals;

});

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

