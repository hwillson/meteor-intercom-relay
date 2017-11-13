/* eslint-disable no-console */

let sentry;

if (process.env.SENTRY_DSN) {
  import raven from 'raven';
  raven.config(process.env.SENTRY_DSN).install();
  sentry = raven;
} else {
  console.warn(
    'WARNING: No SENTRY_DSN environment variable found; ' +
    'sentry.io reporting is disabled.',
  );
  sentry = {
    captureException(error) {
      return error;
    },
  };
}

export default sentry;
