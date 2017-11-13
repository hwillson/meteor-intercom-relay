/* eslint-disable no-console */

import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import bodyParser from 'body-parser';
import intercomHandler from '../imports/intercom_handler';

const sendStatusCode = (response, statusCode) => {
  response.writeHead(statusCode);
  response.end();
};

const writeToken = process.env.WRITE_TOKEN;
if (!writeToken) {
  console.error('Missing WRITE_TOKEN environment variable.');
  process.exit(1);
}

// Register the /track-event POST endpoint.
const main = () => {
  const intercom = Object.create(intercomHandler);
  intercom.init(process);

  const app = WebApp.connectHandlers;

  app.use(bodyParser.json());

  app.use('/track-event', (request, response) => {
    if (request.method === 'POST') {
      const headerWriteToken = request.headers['write-token'];
      if (!headerWriteToken || headerWriteToken !== writeToken) {
        sendStatusCode(response, 401);
      } else if (!request.body || !Object.keys(request.body).length) {
        sendStatusCode(response, 422);
      } else {
        intercom.trackEvent(request.body);
        sendStatusCode(response, 200);
      }
    } else {
      sendStatusCode(response, 404);
    }
  });

  app.use('/', (request, response) => {
    sendStatusCode(response, 404);
  });
};

if (Meteor.isServer) {
  main();
}
