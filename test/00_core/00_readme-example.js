const tape = require('tape');
const grargs = require('../index.js');

const readmeArgv = "chug package --verbose --env production --images foo.png bar.png --rescale=50% huge.png --scripts --minify index.js helper.js update-and-push".split(' ');
const readmeExpected = [
  [null, "chug"],
  [null, "package"],
  ["verbose", null],
  ["env", "production"],
  ["images", "foo.png"],
  [null, "bar.png"],
  ["rescale", "50%"],
  [null, "huge.png"],
  ["scripts", null],
  ["minify", "index.js"],
  [null,"helper.js"],
  [null,"update-and-push"]
];

tape('example from README', t => {
  t.plan(1);
  const pairs = [];
  grargs(readmeArgv, (a, b) => pairs.push([a, b]));
  t.deepEqual(pairs, readmeExpected);
});
