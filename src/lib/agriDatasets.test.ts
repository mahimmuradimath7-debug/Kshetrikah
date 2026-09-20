import test from 'node:test';
import assert from 'node:assert/strict';

import { recommendCropForSoil, recommendFertilizerForField } from './agriDatasets';

test('recommendCropForSoil matches the prepared crop recommendation dataset', () => {
  const crop = recommendCropForSoil({
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    temperature: 20.88,
    humidity: 82.00,
    ph: 6.50,
    rainfall: 202.94,
  });

  assert.equal(crop.label, 'rice');
  assert.ok(crop.confidence >= 0.8);
});

test('recommendFertilizerForField matches an expected fertilizer recommendation', () => {
  const fertilizer = recommendFertilizerForField({
    temperature: 26,
    humidity: 52,
    moisture: 38,
    soilType: 'Sandy',
    cropType: 'Maize',
    nitrogen: 37,
    potassium: 0,
    phosphorous: 0,
  });

  assert.equal(fertilizer.name, 'Urea');
  assert.ok(fertilizer.score >= 0.7);
});
