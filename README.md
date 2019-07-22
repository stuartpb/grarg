# grarg

> **&ldquo;Grr. Argh.&rdquo;** &ndash; [Mutant Enemy](https://www.youtube.com/watch?v=H7alErR8cAE)

grarg is a minimal bring-your-own-logic parser for command-line arguments.

## Why? What makes you think Node.js needs *another* argument parsing library?

Because every existing argument parser in the npm.com registry (or at least, all the ones I could find) follows the same flawed model. Not all command line arguments are map keys, and not all "bare" arguments are sequential. Many applications are better suited to a sort of state-machine argument parsing model, where options transform a state that determines how successive non-options are parsed.

For example, say you have a command like `chug package --verbose --env production --images foo.png bar.png --rescale=50% huge.png --scripts --minify index.js helper.js update-and-push`. It's pretty clear how this command would interpret these arguments, but there's no clean way to express it in a model like the one used by [minimist](https://www.npmjs.com/package/minimist) (or its successors like yargs/getopts/caproal/mri).

With `grarg`, you can write your own option-by-option parsing logic with an iterative callback that takes options and values as a series of (sometimes partial) pairs.

## API: grarg([argv,] [params,] cb)

The `grarg` function returned by `require('grarg')` takes an array of arguments (`argv`), an object of parameters (`params` - not yet implemented), and a function to call back with option/value pairs (`cb`).

`argv` defaults to `process.argv.slice(2)` by default. For most scripts, this is what you want. (If running in a binary-is-the-script environment like Electron, where there's no script name to chop off the argv array, you'll want to explicitly use `process.argv.slice(1)` instead.)

`params` effectively defaults to `{"end": "--"}` (though each parameter's default is considered individually if unspecified).

## Callback signature

If an option begins with two hyphens, it will be passed to the callback as the first parameter (with those double-hyphens stripped).

If an option is followed by a value (either as a pair like `--foo bar` or with an equals sign like `--foo=bar`), the option and its accompanyng value are passed to the callback as its first and second parameters, respectively.

Note that this means `--foo=bar` is indistinguishable from `--foo bar`. If you support the first form, you ought to support the second form as an alternative syntax for the same specification: any kind of cleverness with differing behavior between the forms is user-hostile and unsupported.

Also note that this means you may get an option that is unrelated to the argument following it: for example, `shred --quickly buster.dat lindsay.dat` would be parsed as `cb(null, "shred")`, `cb("quickly","buster.dat")`, and `cb(null, "lindsay.dat")`. It's up to your callback to interpret and handle values that may be attached this kind of "unrelated" argument: always remember to check if a "standalone value" has been provided alongside any "standalone option".

If an option is followed by *another option*, the "standalone" option is passed to the callback with `null` as its second parameter.

If multiple successive non-hyphen-prefixed options are encountered, they will be passed to the callback with `null` as the first parameter.

For example, the command in the "Why?" section above, if passed to `grarg((k,v)=>console.log(JSON.stringify([k,v])))`, would look like:

```js
[null, "chug"]
[null, "package"]
["verbose", null]
["env", "production"]
["images", "foo.png"]
[null, "bar.png"]
["rescale", "50%"]
[null, "huge.png"]
["scripts", null]
["minify", "index.js"]
[null,"helper.js"]
[null,"update-and-push"]
```

## The `end` parameter

*Not yet implemented.*

If `end` is `"--"`, the first standalone `--` argument encountered in the input array will be passed to the callback as `cb(null, "--")`, and then all successive arguments will be passed to the callback with `null` as the first parameter, even if they appear to represent an option. (For example, `-- --foo=bar` would pass the second option as `cb(null, "--foo=bar")` and not `cb("foo", "bar")`)).

This is generally used to define a list of arguments for a subprocess, like in the case of `ssh`, where `--` separates arguments to the SSH client SSH from arguments to a command to run on the host.

If `end` is a number, the first non-option argument after `end` number of non-options have been parsed will end argument parsing. A value of 1 will work like minimist's `stopEarly` (stopping parsing after the first non-option argument), and values of 2 and higher can be used to permit a number of positional arguments (such as commands or subcommands) before ceasing to parse options. (The value of 0 is reserved as a possible way to disable argument parsing altogether in certain circumstances.)

If `end` is `false`, any standalone `--` argument will be passed to the callback as `cb(null, "--")`, and paired parsing will continue. (To reuse an earlier example, the second argument of `-- --foo=bar` *would* be passed as `cb("foo", "bar")` when `end` is `false`.).

Note that this means a standalone `--` will *always* be interpreted as a standalone value, even when `end` is `false`. If you need to define `"--"` as the value of an option, you need to specify it using the `=` syntax, ie. `--foo=--` is the only way to get a parse result of `cb("foo", "--")`. (Of course, this rule applies for *any* option-value that may begin with `--`, as longer strings would be interpreted as the beginning of a new option.)

## The `short` parameter

*Not yet implemented.*

If `params.short` is `true`, items starting with a single hyphen will be treated as options (ie. they will cause a prior option to be passed as `cb('--that-option',null)`), and passed to the callback with `'-'` as the first argument, and the rest of the item as the second argument (for example, `-xzf` would be passed to the callback as `cb('-','xzf')`).

This can interfere with negative numbers as values, so if `params.short` is `'nan'` (case-insensitive), this will only be applied if the argument does not evaluate to a number.

If `params.short` is `false` or undefined, arguments beginning with `-` are treated just like any other non-double-prefixed argument.

Note that the single hyphen `-` is *always* treated as an ordinary argument.

Note that, technically speaking, the call signature of short options with this parameter overlaps that of a triple-hyphen option, ie. `--- foo` is indistinguishable from `-foo`. If that's a problem for your use case, then don't use `short`.

## Example usage

Here's some code that uses `grargs` to implement `minimist`'s core default behavior in seven lines:

```js
const args = {_:[]};
require('grarg')((key, value) => {
  key = key || '_';
  if (value === null) value = true;
  if (Array.isArray(args[key]) args[key].push(value);
  else if (args[key] !== undefined) args[key] = [args[key], value];
  else args[key] = value; });
```
