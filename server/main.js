import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import bodyParser from 'body-parser';
import intercomHandler from '../imports/intercom_handler';

const sendStatusCode = (response, statusCode) => {
  response.writeHead(statusCode);
  response.end();
};

// Register the /track-event POST endpoint.
const main = () => {
  const intercom = Object.create(intercomHandler);
  intercom.init(process);

  const app = WebApp.connectHandlers;

  app.use(bodyParser.json());

  app.use('/track-event', (request, response) => {
    if (request.method === 'POST') {
      if (!request.body || !Object.keys(request.body).length) {
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
