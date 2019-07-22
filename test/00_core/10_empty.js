const tape = require('tape');
const grargs = require('../../index.js');

tape('empty string', t => {
  t.plan(2);
  grargs([''], (a, b) => {
    t.equal(a, null);
    t.equal(b, '');
  });
});

tape('empty string after equals', t => {
  t.plan(2);
  grargs(['--test='], (a, b) => {
    t.equal(a, 'test');
    t.equal(b, '');
  });
});

tape('arg after empty string after equals', t => {
  let i = 0;
  let pairs = [
    ['test', ''], [null, 'foo']
  ];
  t.plan(pairs.length);
  grargs(['--test=', 'foo'], (a, b) => {
    t.deepEqual([a, b], pairs[i]);
    ++i;
  });
});

tape('empty string as pair value', t => {
  t.plan(2);
  grargs(['--test', ''], (a, b) => {
    t.equal(a, 'test');
    t.equal(b, '');
  });
});
