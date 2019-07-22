const tape = require('tape');
const grargs = require('../../index.js');

// not-really-supported-but-nevertheless-defined edge case behaviors

tape('empty string before equals', t => {
  t.plan(2);
  grargs(['--=test'], (a, b) => {
    t.equal(a, '');
    t.equal(b, 'test');
  });
});

tape('empty string before and after equals', t => {
  t.plan(2);
  grargs(['--='], (a, b) => {
    t.equal(a, '');
    t.equal(b, '');
  });
});
