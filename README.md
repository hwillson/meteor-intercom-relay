# meteor-intercom-relay

A small Meteor based web service that receives and relays events to
[Intercom](http://intercom.com).

## Prerequisites

- An [Intercom application access token](https://developers.intercom.com/v2.0/docs/personal-access-tokens).
- This application is pre-configured to log errors to [sentry.io](https://sentry.io). To log errors, you'll need a [Sentry DSN](https://docs.sentry.io/quickstart/) (this is optional - if you don't specify a DSN remote error logging will be disabled).

## Running

```
> git clone https://github.com/hwillson/meteor-intercom-relay.git
> cd meteor-intercom-relay
> SENTRY_DSN="your dsn" INTERCOM_ACCESS_TOKEN="your token" MONGO_URL=null meteor
```

## Usage

Events can be sent into Intercom by POSTing event details to the `/track-event` endpoint. For example, posting the following json

```json
{
  "email": "some@email.com",
  "name": "Some event just happened"
}
```

to `http://localhost:3000/track-event` results in the following event being sent into Intercom:

```js
{
  email: 'some@email.com',
  created_at: [time since epoch in seconds],
  event_name: 'Some event just happened'
}
```
