import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePlan } from '../planner.js';
import { EXERCISES } from '../exercises.js';

const date = new Date('2026-03-12T12:00:00+08:00'); // Thu

function getWeekNumber(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date - start) / (7 * 24 * 60 * 60 * 1000));
}

function findDateWithPhase(start, phase) {
  const d = new Date(start);
  for (let i = 0; i < 8; i++) {
    if (getWeekNumber(d) % 4 === phase) return new Date(d);
    d.setDate(d.getDate() + 7);
  }
  return new Date(start);
}

function findBaseSets(id) {
  for (const list of Object.values(EXERCISES)) {
    const found = list.find(e => e.id === id);
    if (found) return found.sets;
  }
  return null;
}

test('generatePlan returns 5 exercises with unique roles', () => {
  const plan = generatePlan(date, 0);
  assert.equal(plan.isTrainingDay, true);
  assert.equal(plan.exercises.length, 5);
  const roles = new Set(plan.exercises.map(e => e.role));
  assert.equal(roles.size, 5);
  assert.ok(plan.estimatedTotalMinutes >= 45);
});

test('generatePlan avoids high IAP exercises by default', () => {
  const plan = generatePlan(date, 0);
  const ids = new Set(plan.exercises.map(e => e.id));
  assert.ok(!ids.has('barbell-squat'));
  assert.ok(!ids.has('pull-ups'));
  assert.ok(!ids.has('kettlebell-swing'));
});

test('generatePlan applies deload on week 4 (sets not above base)', () => {
  const deloadDate = findDateWithPhase(date, 3);
  const deload = generatePlan(deloadDate, 0);
  const main = deload.exercises.filter(e => e.role === 'knee' || e.role === 'hip' || e.role === 'upper');
  assert.ok(main.length >= 3);
  main.forEach(e => {
    const base = findBaseSets(e.id);
    assert.ok(base !== null);
    assert.ok(e.sets <= base);
  });
});
