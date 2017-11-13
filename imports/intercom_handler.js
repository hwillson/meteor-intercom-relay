/* eslint-disable no-console */

import Intercom from 'intercom-client';
import sentry from './sentry';

// Intercom communication helper.
const intercomHandler = (() => {
  const pub = {};
  const priv = {};

  /* Public API */

  // Verify the environment defined Intercom access token, and initialize
  // a new Intercom library client.
  pub.init = (serverProcess) => {
    priv.serverProcess = serverProcess;
    priv.token = serverProcess.env.INTERCOM_ACCESS_TOKEN;
    if (!priv.token) {
      console.error('Missing INTERCOM_ACCESS_TOKEN environment variable.');
      priv.serverProcess.exit(1);
    } else {
      priv.client = new Intercom.Client({ token: priv.token });
    }
  };

  // Send the passed in `event` details to Intercom. Create a new user
  // account in Intercom first, if needed.
  //
  // `event` format:
  // {
  //   email: 'some@email.com',
  //   name: 'Some event',
  // }
  pub.trackEvent = (event) => {
    if (event) {
      priv.createUserIfMissing(event.email);
      priv.createEvent(event).catch(priv.logError);
    }
  };

  /* Private API */

  // Holds a reference to the Node `process`.
  priv.serverProcess = null;

  // Holds the Intercom access token.
  priv.token = null;

  // Holds the Intercom API client object created using `priv.token`.
  priv.client = null;

  // If an Intercom account already exists with the passed in email, do
  // nothing. Otherwise create a new user account.
  priv.createUserIfMissing = (email) => {
    priv.userExists(email).catch(() => {
      // User doesn't exist, so create it
      priv.createUser(email).catch(priv.logError);
    });
  };

  // Does an Intercom accounts already exist with the specified email address.
  priv.userExists = async email => priv.client.users.find({ email });

  // Create a new Intercom user account.
  priv.createUser = async email => priv.client.users.create({ email });

  // Log a new event in Intercom.
  priv.createEvent = async event => (
    priv.client.events.create({
      email: event.email,
      created_at: Math.floor(new Date() / 1000),
      event_name: event.name,
    })
  );

  // Log an exception in sentry.io.
  priv.logError = (error) => {
    sentry.captureException(error);
  };

  return pub;
})();

export default intercomHandler;
