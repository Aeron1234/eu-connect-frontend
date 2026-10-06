import { test } from "node:test";
import assert from "node:assert/strict";
import { getFreshLocation } from "../lib/geolocation.mjs";

test("clock-in location request waits for a fresh high-accuracy GPS fix", async () => {
  let options;
  const location = await getFreshLocation({
    getCurrentPosition(success, _failure, requestedOptions) {
      options = requestedOptions;
      success({ coords: { latitude: 13.92301387, longitude: 121.43426039, accuracy: 12 } });
    },
  });
  assert.deepEqual(options, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  assert.deepEqual(location, { latitude: 13.92301387, longitude: 121.43426039, accuracy: 12 });
});

test("missing, invalid, and denied GPS readings never become attendance coordinates", async () => {
  await assert.rejects(getFreshLocation(null), /Location is unavailable/);
  await assert.rejects(getFreshLocation({ getCurrentPosition(success) {
    success({ coords: { latitude: NaN, longitude: 121, accuracy: 100 } });
  } }), /valid location/);
  await assert.rejects(getFreshLocation({ getCurrentPosition(_success, failure) {
    failure({ code: 1 });
  } }), /permission was denied/);
});
