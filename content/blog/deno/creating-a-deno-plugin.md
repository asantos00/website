---
title: "Creating a Deno plugin with Rust"
description: Exploring the process of creating a Deno plugin
date: "2021-04-13"
published: true
---

*This blog post is part of a a [blog post series](/deno/series-introduction) where we use [Deno](https://deno.land) to build different applications. We'll go from CLIs to scrapping tools, among others. You can find the other posts [here](/deno/series-introduction).*

We previously explored some of Deno's premises and how it addresses specific Node.js problems. But that's not why we are here today. 

Today we'll explore Deno plugins. If you haven't heard of them, Deno plugins enable users to write code in Rust and then call it from JavaScript.

## Building a plugin

We want this exploration to resemble a real world use case, so we'll be creating a simple image-manipulation Rust plugin with one single feature: **transform an image to grayscale**.

Plugins in Deno are written in Rust. Deno provides an API to load and call the plugin's code from JavaScript. The plugin API dispatches events to and from the plugin, all the communication is made using `Uint8Array`s.

*Note: It's worth to mention that Deno's Rust plugin feature is at the _unstable_ stage, so expect its API to change.* 

By the end of this blog post, we'll have a Deno application that uses a Rust plugin to grayscale an image.

If you want to follow by looking at the code, [here you have it](https://github.com/asantos00/deno-image-transform).

## Hello world

Yeah, here we are, the good old hello world. Let's get started with a Rust hello world called from Deno.

[lib.rs](https://github.com/asantos00/deno-image-transform/blob/main/rust-plugin/src/lib.rs#L17)
```rust
use deno_core::plugin_api::Interface;
use deno_core::plugin_api::Op;
use deno_core::plugin_api::ZeroCopyBuf;

fn hello_world(
  _interface: &mut dyn Interface,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  println!("Rust: Hello from rust.");

  Op::Sync(Box::new([]))
}
```

For now let's ignore the parameters this function receives and the value it returns. What matters here is that this function is printing a message to the console, using `println!`.

After creating the `hello_world` Rust function, we'll use `register_op` to register it as an operation on Deno.

[lib.rs](https://github.com/asantos00/deno-image-transform/blob/main/rust-plugin/src/lib.rs#L9)
```rust
#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("helloWorld", hello_world);
}
```

*Note: The `#[no_mangle]` attribute turns off Rust's name mangling, so that it is easier to link to. Deno requires this.*

Operation registered, we should now be able to load and call it from our JavaScript code. The way we call Rust operations from Deno is by dispatching a message. We'll use `Deno.core.dispatch` for that.

[main.js](https://github.com/asantos00/deno-image-transform/blob/main/main.js#L49)
```js
const rustPluginId = Deno.openPlugin(`./rust-plugin/${rustLibFilename}`);

const { helloWorld } = Deno.core.ops();

if (!(helloWorld > 0)) {
  throw "bad op id for helloWorld";
}

function runHelloWorld() {
  Deno.core.dispatch(helloWorld);
}

runHelloWorld();
```
_Note: The the reason our examples are in JavaScript and not in TypeScript is due the Deno plugin API being still in the unstable stage. The `Deno.core` type definition is missing and this will cause type errors if we try to use `.ts`. We will also need to use the deno `--unstable` flag to use Rust plugins._

That's all we need to get the `hello_world` Rust function called.

If we run:

```bash
$ deno run --unstable --allow-plugin main.ts
```

We should see this output:

```bash
Rust: Hello from rust.
```

## Breaking it down

Lets break down this hello world:

- We start by loading the plugin in Deno by calling `Deno.openPlugin` with the path for the compiled Rust artifact.

```js
const rustPluginId = Deno.openPlugin(`./rust-plugin/${rustLibFilename}`);
```

*Note: Rust artifact's file name and extension change depending on the Operative System. We created a function called [`resolveRustLibFilename`](https://github.com/NMFR/deno-image-transform/blob/add-rust-plugin/main.js#L9) that handles this.*

- Deno will load the Rust artifact and will execute the Rust `deno_plugin_init` function. This function in turn registers the `hello_world` Rust function has an operation with the name `helloWorld`.

```rust
#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("helloWorld", hello_world);
}
```

- After the plugin is loaded we get the `helloWorld` operation identifier from `Deno.core.ops`.

```js
const { helloWorld } = Deno.core.ops();
```

- We check if the operation identifier is valid ensuring that Deno knows the `helloWorld` operation.

```js
if (!(helloWorld > 0)) {
  throw "bad op id for helloWorld";
}
```

- We then dispatch a message with the `helloWorld` operation identifier telling Deno to call the Rust operation.

```js
Deno.core.dispatch(helloWorld);
```

- The dispatch will in turn call the `hello_world` Rust function, and the function will print the output that we see.

And that's it, hello world is done! 

Pursuing our goal of creating a function that transforms an image into grayscale, the next step is to send parameters and receive results from the plugin code, written in Rust. 

That's what we'll do next.

## Sending and received data

We previously mentioned that Deno operation functions are called with two parameters:

```rust
fn hello_world(
  _interface: &mut dyn Interface,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Op {
```

The first parameter, `_interface`, is the same interface made available in the `deno_plugin_init` function. At this stage, it allows us to register more operations.

The second one, `_zero_copy` is what interests us more here. It's a `ZeroCopyBuffer` which directly references the JavaScript buffer. Deno plugin API mandates that all communications are made using `Uint8Array` buffers. The `_zero_copy` buffer is where the parameters sent from JavaScript are accessible.

 Since we're limited to `Uint8Array` buffers for the communication, and we'll need to send other types of data, we will most likely need to do some encoding and decoding.

[main.js](https://github.com/asantos00/deno-image-transform/blob/main/main.js#L56)

```js
const rustPluginId = Deno.openPlugin(`./rust-plugin/${rustLibFilename}`);
const { testTextParamsAndReturn } = Deno.core.ops();

function runTestTextParamsAndReturn() {
  const textEncoder = new TextEncoder();
  const param0 = textEncoder.encode("text");
  const param1 = textEncoder.encode("sent from");
  const param2 = textEncoder.encode("deno");

  const response = Deno.core.dispatch(
    testTextParamsAndReturn,
    param0,
    param1,
    param2
  );

  const textDecoder = new TextDecoder();
  const result = textDecoder.decode(response);
  console.log(`Deno: result: ${result}`);
}

runTestTextParamsAndReturn();
```

We're using the globals `TextEncoder` and `TextDecoder` to encode the text "text sent from deno" that will be sent as 3 different parameters to `Deno.core.dispatch`. Then, we're decoding the message returned from Rust, and printing it to the console.

To get this message printed on the console from Rust, this is what we'll need to do:

[lib.rs](https://github.com/asantos00/deno-image-transform/blob/main/rust-plugin/src/lib.rs#L26)
```rust
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("testTextParamsAndReturn", op_test_text_params_and_return);
}

fn op_test_text_params_and_return(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  for (idx, buf) in zero_copy.iter().enumerate() {
    let param_str = std::str::from_utf8(&buf[..]).unwrap();

    println!("Rust: param[{}]: {}", idx, param_str);
  }

  let result = b"result from rust";
  Op::Sync(Box::new(*result))
}
```

You can see that we're converting the buffers coming from JavaScript into text and printing it. After this, we return an `Op:Sync` with the result. This is the way for plugins to send synchronous messages back into JavaScript.

The final result of executing this is the following:

```bash
$ deno run --unstable --allow-plugin main.js

Rust: param[0]: text
Rust: param[1]: sent from
Rust: param[2]: deno
Deno: result: result from rust
```

As we can see, the parameters sent are printed by the Rust code, and the response from Rust code is printed using JavaScript. We can now send and receive data from the plugin.

The next step towards getting this image to grayscale plugin to work, is to send the image metadata to the plugin. Since JSON is the native format on JavaScript, that's what we'll use.

## Sending JSON parameters

Our objective is to send a JSON object with the image metadata to the plugin.

All this communication must be done using `Uint8Array` buffers, and thus we'll need to convert this JSON object into a buffer.

[main.js](https://github.com/asantos00/deno-image-transform/blob/main/main.js#L78)
```js
const rustPluginId = Deno.openPlugin(`./rust-plugin/${rustLibFilename}`);
const { testJsonParamsAndReturn } = Deno.core.ops();

function runTestJsonParamsAndReturn() {
  const textEncoder = new TextEncoder();
  const image = {
    hasAlphaChannel: true,
    size: {
      width: 100,
      height: 50,
    },
  };

  const imageMetadata = textEncoder.encode(JSON.stringify(image));
  const response = Deno.core.dispatch(testJsonParamsAndReturn, imageMetadata);

  const textDecoder = new TextDecoder();
  const result = textDecoder.decode(response);
  console.log(`Deno: result: ${result}`);
  const jsonResult = JSON.parse(result);
  console.log(`Deno: jsonResult.success: ${jsonResult.success}`);
}

runTestJsonParamsAndReturn();
```

Now we need to read the sent JSON in the Rust plugin.

[lib.rs](https://github.com/asantos00/deno-image-transform/blob/main/rust-plugin/src/lib.rs#L40)
```rust
use deno_core::plugin_api::Interface;
use deno_core::plugin_api::Op;
use deno_core::plugin_api::ZeroCopyBuf;
use deno_core::serde_json;

 fn op_test_json_params_and_return(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let image_metadata = &zero_copy[0];
  let json: serde_json::Value = serde_json::from_slice(image_metadata).unwrap();
  let has_alpha_channel: bool = match &json[("hasAlphaChannel")] {
    serde_json::Value::Bool(b) => *b,
    _ => true,
  };
  let width = match &json["size"]["width"] {
    serde_json::Value::Number(n) => n.as_u64().unwrap_or(0),
    _ => 0,
  };
  let height = match &json["size"]["height"] {
    serde_json::Value::Number(n) => n.as_u64().unwrap_or(0),
    _ => 0,
  };

  println!("Rust: json param: {}", json);
  println!("Rust: has_alpha_channel: {}", has_alpha_channel);
  println!("Rust: width: {}", width);
  println!("Rust: height: {}", height);

  let result = serde_json::json!({
    "success": true
  });
  Op::Sync(serde_json::to_vec(&result).unwrap().into_boxed_slice())
}
```

As we previously saw, `_zero_copy` contains the parameters sent from JavaScript. Here we're getting the first item of the array, containing the JSON image metadata as a buffer.

We're decoding this buffer using `serde_json` module, made available by the Deno core. This function decodes JSON parameters into a dicionary like object, which we called `json` here.

Then, we're logging the parameters, and sending a JSON object back to JavaScript indicating that the function run successfully, using `Op:Sync`.

We can now run this code and check the result:

```shell
$ deno run --unstable --allow-plugin main.js

Rust: json param: {"hasAlphaChannel":true,"size":{"width":100,"height":50}}
Rust: has_alpha_channel: true
Rust: width: 100
Rust: height: 50
Deno: result: {"success":true}
Deno: jsonResult.success: true
```

We can see that the parameters are being printed from Rust, and that the success message sent from the plugin is reaching the JavaScript code.

We're getting there! The next step is to send the image's pixel data so the plugin can convert it to grayscale.

## Sending the image to the plugin

In the JavaScript code, we'll send the image and its metadata to the plugin. We'll start by reading and decoding the image file. After that, we will send the image meta (JSON) and pixel data (a `Uint8Array` array of the pixel's colors).

We expect the plugin to directly modify the `Uint8Array`, grayscaling the pixels. After that we will write the modified `Uint8Array` to a file.

[main.js](https://github.com/asantos00/deno-image-transform/blob/main/main.js#L102)
```js
import { decode, encode } from "https://deno.land/x/jpegts@1.1/mod.ts";

const rustPluginId = Deno.openPlugin(`./rust-plugin/${rustLibFilename}`);
const {
  toGreyScale,
} = Deno.core.ops();

async function runToGreyScale(inputFilename, outputFilename) {
  let raw = await Deno.readFile(`images/${inputFilename}`);
  const image = decode(raw);
  const textEncoder = new TextEncoder();
  const imageDescriptor = {
    hasAlphaChannel: true,
    size: {
      width: image.width,
      height: image.height,
    },
  };
  const imageMetadata = textEncoder.encode(JSON.stringify(imageDescriptor));
  const decodedImage = image.data;

  Deno.core.dispatch(toGreyScale, imageMetadata, decodedImage);

  raw = encode(image, 100);

  await Deno.writeFile(`images/output/${outputFilename}`, raw.data);

  console.log(
    `Deno: runToGreyScale(\"images/${inputFilename}\") > "images/output/${outputFilename}"`
  );
}

await runToGreyScale("dice.jpg", "dice.jpg");
```

On the Rust side, we'll need to parse the image metadata. This is mainly done to know the pixel size in bytes, since a pixel might take 3 (RGB) or 4 (RGBA) bytes.

[lib.rs](https://github.com/asantos00/deno-image-transform/blob/main/rust-plugin/src/lib.rs#L84)
```rust
const RGB_PIXEL_SIZE: usize = 3;
const RGBA_PIXEL_SIZE: usize = 4;

#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("toGreyScale", op_to_grey_scale);
}

fn op_to_grey_scale(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let image_metadata = &zero_copy[0];
  let json: serde_json::Value = serde_json::from_slice(image_metadata).unwrap();
  let has_alpha_channel: bool = match &json[("hasAlphaChannel")] {
    serde_json::Value::Bool(b) => *b,
    _ => true,
  };
  let pixel_size = if has_alpha_channel { RGBA_PIXEL_SIZE } else { RGB_PIXEL_SIZE };
  let image = &mut zero_copy[1];
  let image_array: &mut[u8] = image.as_mut();

  to_grey_scale(image_array, pixel_size);

  println!("Rust: to_grey_scale() finished");

  Op::Sync(Box::new([]))
}
```

All that is left to do is to convert the image pixels into grayscale. This is done by averaging the values of the red, green, and blue (RGB) components of a pixel. 

[lib.rs](https://github.com/asantos00/deno-image-transform/blob/main/rust-plugin/src/lib.rs#L73)
```rust
fn to_grey_scale(image_array: &mut[u8], pixel_size: usize) {
  let image_array_length = image_array.len() - (image_array.len() % pixel_size);

  for i in (0..image_array_length).step_by(pixel_size) {
    let pixel_average = (((image_array[i] as u16) + (image_array[i + 1] as u16) + (image_array[i + 2] as u16)) / 3) as u8;
    image_array[i] = pixel_average;
    image_array[i + 1] = pixel_average;
    image_array[i + 2] = pixel_average;
  }
}
```

If we run this with this image:

![image-before](dino.jpeg)

This is the result we will get:

![image-after](dino-gray.jpeg)

It is working! Notice that we modified the image pixels directly instead of returning a new `Uint8Array` for performance reasons.

## Mission accomplished

What we've done so far accomplishes our objective for this article. 

We've created a Deno plugin, written in Rust, that converts an image to grayscale. Then we've used the API provided by Deno to communicate with it from the JavaScript side.

We'll later explore more about writing Deno plugins, namely how use the asynchronous API to leverage Rust performance on CPU heavy tasks, in another article of this series.

If you're interested in knowing more about Deno and how to use it to build tools and web applications, make sure you checkout my recently launched book [Deno Web Development](/deno/i-published-a-book-deno-web-development). In the book, we carefully explain all the mentioned Deno features (and many others) while building real-world applications.

This article (and code) was written by me and my friend [Nuno Rodrigues](https://twitter.com/nfrodrigues),

We'd like to hear what you think about it! If you have any questions, make sure you it us on Twitter or LinkedIn. I'll leave the links below.

If you want to read more about Deno, check out the [other posts in this series](/deno/series-introduction).

Best,

Nuno: [Twitter](https://twitter.com/nfrodrigues) | [LinkedIn](https://www.linkedin.com/in/nmfr/)
