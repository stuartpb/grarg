module.exports = function grarg(argv, cb) {
  let opt = null;
  if (!cb) {
    cb = argv;
    argv = process.argv.slice(2);
  }
  for (let i = 0; i < argv.length; ++i) {
    let arg = argv[i];
    if (/^--/.test(arg)) {
      if (opt) {
        cb(opt, null);
      }
      if (/=/.test(arg)) {
        cb(arg.replace(/^--([^=]*)=.*/,'$1'),
          arg.replace(/^--[^=]*=(.*)$/,'$1'))
      } else {
        opt = arg.replace(/^--/,'');
      }
    } else {
      cb(opt, arg);
      opt = null;
    }
  }
  if (opt) return cb(opt, null);
};
