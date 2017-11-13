/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-unused-expressions */

import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Promise } from 'meteor/promise';
import { expect } from 'chai';
import Intercom from 'intercom-client';

const rootUrl = process.env.ROOT_URL;
const writeToken = process.env.WRITE_TOKEN;

describe('Web Service', function () {
  describe('Routing tests', function () {
    it(
      'should return a 404 if requesting anything other than POST /track-event',
      function () {
        try {
          HTTP.get(`${rootUrl}/asdfasf`);
          HTTP.get(`${rootUrl}/track-event`);
          HTTP.get(`${rootUrl}/track-event/asdf`);
        } catch (error) {
          expect(error.response.statusCode).to.equal(404);
        }
      },
    );

    it(
      'should reject access if missing header based authorization token',
      function () {
        try {
          HTTP.post(`${rootUrl}/track-event`, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          expect(error.response.statusCode).to.equal(401);
        }
      },
    );

    it(
      'should return a 422 status code if missing /track-event event params',
      function () {
        try {
          HTTP.post(`${rootUrl}/track-event`, {
            headers: {
              'Content-Type': 'application/json',
              'write-token': writeToken,
            },
          });
        } catch (error) {
          expect(error.response.statusCode).to.equal(422);
        }
      },
    );
  });

  describe('Data tests', function () {
    const testEmail = 'mirtest@example.com';
    const testEventName = 'some test event';

    const intercomClient =
      new Intercom.Client({ token: process.env.INTERCOM_ACCESS_TOKEN });

    const deleteUser = async (email) => {
      await intercomClient.users.delete({ email });
    };

    const findUser = async (email) => {
      const response = await intercomClient.users.find({ email });
      const user = (response && response.body) ? response.body : null;
      return user;
    };

    const createUser = async email => intercomClient.users.create({ email });

    const userEvents = async (email) => {
      const response = await intercomClient.events.listBy({
        type: 'user',
        email,
      });
      const events =
        (response && response.body && response.body.events)
          ? response.body.events
          : null;
      return events;
    };

    const fireTestEvent = () => {
      HTTP.post(`${rootUrl}/track-event`, {
        headers: {
          'Content-Type': 'application/json',
          'write-token': writeToken,
        },
        data: {
          email: testEmail,
          name: testEventName,
        },
      });
    };

    beforeEach(function () {
      try {
        Promise.await(deleteUser(testEmail));
      } catch (error) {
        // If the test user can't be found, great, it has already been removed
      }
    });

    after(function () {
      try {
        Promise.await(deleteUser(testEmail));
      } catch (error) {
        // If the test user can't be found, great, it has already been removed
      }
    });

    it(
      'should first create user then log event in Intercom, if user does not ' +
      'already exist',
      function () {
        fireTestEvent();

        // We have to delay a bit before checking for the user with Intercom, as
        // it takes a bit for them to remove it on their side.
        Meteor._sleepForMs(500);
        const user = Promise.await(findUser(testEmail));
        expect(user).to.not.be.null;

        const events = Promise.await(userEvents(testEmail));
        expect(events[0].event_name).to.equal(testEventName);
      },
    );

    it(
      'should log event in Intercom using existing user, if user already exists',
      function () {
        Promise.await(createUser(testEmail));

        Meteor._sleepForMs(500);
        const user = Promise.await(findUser(testEmail));
        expect(user).to.not.be.null;

        fireTestEvent();

        const events = Promise.await(userEvents(testEmail));
        expect(events[0].event_name).to.equal(testEventName);
      },
    );
  });
});
