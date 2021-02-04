---
title: "Creating a Deno plugin with Rust"
description: Exploring the process of creating a Deno plugin
date: "2021-01-15"
published: true
---

This post is part of an article series where we explore multiple Deno features. This is the 3rd post, but previously we wrote about:

- Creating a CLI with Deno
- Using puppeteer with Deno

Today we're here to explore a specific feature: Deno plugins.

If you haven't heard of them, Deno plugins enable users to write code in Rust that can be called from JavaScript using message passing.

The main reason we're here exploring this feature is because we believe that this interconnection between JS and Rust unlocks a great amount of potential.

As we want this to resemble the real environment of developing a plugin, we'll develop one through the course of this blog post. To make the scope short enough, we will create a simple image-manipulation plugin with one single feature: **transform an image to grayscale**.

Excited? Let's go!

<!-- TODO: mention unstable -->

If you want to follow by looking at the code, [here you have it]().

## Hello world

Yeah, here we are, the good old hello world. As the main goal of plugins is to enable us to write Rust code in a JavaScript codebase, that's where we started.

This is how the hello_world function looks like in a Deno plugin.

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

For now let's ignore the parameters this function receives and the value it returns. What matters here is that this function is printing a message to the console.

After having the hello\_world function, and for Deno to recognize what functions are available to be called from Rust, we need to register this operation by using one specific Deno's core API - `register_op`.

```rust
use deno_core::plugin_api::Interface;
use deno_core::plugin_api::Op;
use deno_core::plugin_api::ZeroCopyBuf;

#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("helloWorld", hello_world);
}

fn hello_world(
  _interface: &mut dyn Interface,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  println!("Rust: Hello from rust.");

  Op::Sync(Box::new([]))
}
```

<!-- TODO: mention no_mangle? -->

Operation registered, we should now be able to call it from our JavaScript code. Deno's plugin API doesn't allow to directly call a function, but instead we must dispatch a message that will do it for us.

```js
const rustPluginId = Deno.openPlugin(`./rust-plugin/${rustLibFilename}`);

const { helloWorld } = Deno.core.ops();

function runHelloWorld() {
  Deno.core.dispatch(helloWorld);
}

runHelloWorld();
```

That's all we need to get the hello\_world function we wrote on Rust to be called.

Some things are happening here, let me explain it before we execute this.

- Loading the plugin by calling `Deno.openPlugin` with the path for the compiled Rust artifact.

*Gotcha*: Rust artifact's file extension changes depending on the Operative System. We create a function called `resolveRustLibFilename` that handles it [here](https://github.com/NMFR/deno-image-transform/blob/add-rust-plugin/main.js#L9).

- Getting the operation identifier from `Deno.core.ops` with the same name we registered on Rust

- Dispatching a message with the operation identifier (`helloWorld`) to run it

If we execute the following code, this is what we get:

```
$ deno run --unstable --allow-plugin main.ts

ADD OUTPUT HERE
```

And that's it, hello world is done! Pursuing our goal of creating a function that transforms an image into grayscale, the next step is to be able to send parameters into the plugin code, written in Rust. That's what we'll do next.

## Sending parameters

We previously noticed that Deno operation functions are called with two parameters:

```rust
fn hello_world(
  _interface: &mut dyn Interface,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Op {
```

The first parameter, `_interface`, is the same interface made available in the `deno_plugin_init` function, the one that allows us to register new operations.

The second one, `_zero_copy` is what interests us more here. It's a `ZeroCopyBuffer` which directly references the JavaScript buffer. Deno plugin API mandates that all communications are made using buffers, and the `_zero_copy` buffer is where the parameters sent from JavaScript will live.

As you might have guessed by now, if we're sending Buffers but we want to send text, we will need to do some encoding and decoding before we send these messages, as the following JavaScript snippet shows.

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

We're using the globals `TextEncoder` and `TextDecoder` to encode the text "test sent from deno" that will be sent as 3 different paramters to `Deno.core.dispatch`. Then we're decoding the message we get from Rust, and printing it to the console.

To get this message printed on the console from Rust, this is what we'll have to do:

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

You can see that we're converting the buffers coming from JS into text and printing it and returning `Op:Sync`. This method is the way for plugins to send messages back into the JavaScript code.

The final result of executing this is the following:

```shell
$ deno run --unstable --allow-plugin main.js

ADD OUTPUT
```

As we can see, the parameters sent are printed by the Rust code, and the response from Rust code is printed using JavaScript, the communication is working!

The next step towards getting this image to grayscale plugin to work, is to send the image metadata to the plugin using. Since JSON is the native format on JavaScript, that's what we'll use.

## Sending JSON parameters

Our objective here is to send a JSON object with some specificites about the image to the plugin code.

All this communication must be done using buffers, and thus we'll need to convert this JSON object into a Buffer (`Uint8Array`), as the following JavaScript code demonstrates:

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

Note how we're logging the response sent from the plugin to the console. This will make what's happening clear when we execute the code.

Parameters sent from JS, we now need to get this image metadata on Rust. This is how it is done:

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

Our previous knowledge tells us that `_zero_copy` contains the paramters sent from JS. Here we're getting the first item of the array, containing the image metadata buffer.

We're decoding this buffer using `serde_json` module, made available by the Deno core. This function decodes JSON parameters into a dicionary object, which we called `json` here.

Then, we're logging the paramters, and sending a JSON object back to JavaScript indicating that the function run successfully.

We can now run this code and check the result:

```shell
$ deno run --unstable --allow-plugin main.js

OUTPUT
```

We can see that the parameters are being printed from Rust, and that the success message sent from the plugin is reaching the JS code. We're getting there! The next step is to send the image to grayscale into the plugin.

## Sending the image to the plugin

We're getting closer to our final goal. Until now we managed to get the communication working between the plugin and the JavaScript code. We're also able to send a JSON object back and forth.


When we go back to JavaScript code, we'll send the image together with its metadata into the plugin.

After that it's the plugins' job to convert it into grayscale. That's what the following code does:

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

  println!("Rust: sleeping for 2000 ms (simulating a >2000 ms execution time)");
  std::thread::sleep(std::time::Duration::from_secs(2));

  to_grey_scale(image_array, pixel_size);

  println!("Rust: to_grey_scale() finished");

  Op::Sync(Box::new([]))
}
```

Once again we're decoding the image metadata and getting its parameters. Then we're checking what's the pixel size based on that (images with alpha channel have a pixel size of 4, while images without transparency have a pixel size of 3).

You might have noticed that we're running `std::thread::sleep` method inside this function. We're using this to simulate a CPU heavy task that will take more than 2 seconds. We'll come back to this later.

The conversion into grayscale is then delegated to another function, `to_grey_scale`, which contains the following code:

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

*Converting an image to grayscale is just setting the values of the red, green, and blue pixels to a value that's the average of all of them.*

<!-- TODO: better explanation -->

What we'll do now is to load the image from the filesystem using Deno APIs, and sending it's decoded content into Rust for it to do its magic.

The JavaScript code that does this is quite simple:

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

We're using a third-party library named `jpegjs` to decode the image from JPEG into a buffer. That buffer is then sent to the plugin. After the plugin runs, all we do is writing its result into a file.

If we execute the following code with a random image, this is the result we get.

```shell
$ deno run --unstable --allow-plugin --allow-read

OUTPUT
```

**Before**

![image-before]()

**After**

![image-after]()

And it is working!

**But wait...**

One thing you might have noticed that we're not getting the return value from Rust after calling `Deno.core.dispatch`, even though it still works. This is quite a strange behaviour, let me tell you why it happens:

In the above snippet we're using the same exact `image` variable that before contained the image in colors to save to the filesystem, and its working, but why?

We previously mentioned that the `ZeroCopyBuffer` sent into the plugins is a reference to the buffer sent from JS. This means that when this buffer is modified (as it was by Rust's code), these changes are directly reflected on the JavaScript side. That's what happened here.

Even though we got it working, this behaviour might be a little unintuitive. We'll fix it later in this blogpost.

It might seem like our final objective is achieved. Not so fast 😄. Remember that `std::tread::sleep` that we said we'd be back to? That's what we're doing now

One of the reasons we want to delegate CPU heavy tasks like image manipulation to a plugin is because of performance. We know that these logics will run much faster in Rust, enabling us to keep executing JavaScript code as the task is being executed in the background.

Is Deno really executing code while the plugin code is running? Let's discover it on next section.

## Plugin code is 'stopping the world'

Our code might have worked, but it might not be using this *asychronosity* as it should.

Let's do a test and add a couple of console logs to a function that calls `toGreyScale` so that we get a better understanding of the execution order.

```js
const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function runToGreyScaleHangTest() {
  const toGreyScalePromise = runToGreyScale("dice.jpg", "hang-dice.jpg");

  console.log(
    "Deno: runToGreyScale() started, will try to do other stuff meanwhile"
  );

  for (let i = 0; i < 5; ++i) {
    console.log(
      "Deno: sleeping for 200 ms (pretending to do something in parallel of runToGreyScale())"
    );
    await sleep(200);
  }

  await toGreyScalePromise;
}

await runToGreyScaleHangTest();
```

Note how we're firing the `runToGreyScale` execution but only awaiting on its execution at the end of the function with `await runToGreyScaleHangTest()`. If you are familiar with JavaScript, and assuming that our `runToGreyScale` function is asynchronous, the code inside the for loop (logging sleeping to the console) should run before `runToGreyScale` finishes, right?

Well... Let's check.


```shell
$ deno run

OUTPUT
```

It doesn't seem like it... The function is triggered to start on the plugin, but then it *stops the world* and nothing is executed while the Rust code is executing (and waiting for 2 full seconds).

This isn't the behaviour we want. One of the advantages of JavaScript asynchronicity is that it allows other code to be executed while heavy processing tasks are happening.

The next section we'll explain how can we solve this problem.

## Fully leveraging asynchronicity
