kaba-shelf-less
===============

A [kaba] shelf implementation of the [less] compiler.


Installation
------------

Just install via npm / yarn:

```bash
yarn add kaba-less
```


Usage
-----

In your `kabafile.js` use it like any other shelf task:

```js
const kaba = require("kaba");
const lessShelf = require("kaba-shelf-less");

const less = lessShelf({
    /* config here */
})

kaba.task("less", less);

```


Configuration
-------------

Only files at the root of the directory are compiled.

All configuration options:

| Option          | Type                       | Description                                                                                                  | Default value                     | Comment                                                                                               |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `input`         | `string`                   | A glob that matches all directories that contain LESS files                                                  | `"src/**/Resources/assets/less/"` | As this parameter is passed unaltered to [glob] it will accept everything that glob accepts.          |
| `output`        | `string`                   | The output dir for compiled files                                                                            | `"../../public/css"`              | This path is relative to the (resolved) `input` path for the given file.                              |
| `browsers`      | `array`                    | The list of supported browers                                                                                | `["last 2 versions", "IE 10"]`    | This value is passed to [autoprefixer], so please look in their documentation for all allowed values. |



[kaba]: https://github.com/Becklyn/kaba
[less]: http://lesscss.org/
[glob]: https://www.npmjs.com/package/glob
[autoprefixer]: https://www.npmjs.com/package/autoprefixer
