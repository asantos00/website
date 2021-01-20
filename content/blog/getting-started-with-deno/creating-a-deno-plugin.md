---
title: "Creating a Deno plugin with Rust"
description: Exploring the process of creating a Deno plugin
date: "2021-01-15"
published: true
---

In May 2020, the first stable version of Deno was launched. There was plenty of enthusiasm around its release, many people jumped on the hype train and started to try it out.

As a JavaScript enthusiast and as someone that loved Deno's premises from the day Ryan first presented it, I did the same and documented it in a [blogpost]().

Since this first release, 7 minor versions have been launched, Deno is now at version 1.7, and many new features were added.

Today we are here to explore one of Deno's most promising features. Its plugin API.

I still remember one thing Ryan said in its initial talk.
His desire was that ideally, a developer would be able to start coding in JavaScript, later migrate some code into TypeScript and eventually migrate part of their performance critical code into Rust. This seemed like a thing that was too far ahead, but at the same time it seemed like a big enabler in terms of performance. Deno plugin API seemed the solution for this.

Deno shipped a plugin API from its early days. It is unstable, and thus subject to change at any time. This plugin API is what enables the interoperability between Deno's core (written in Rust), and the Deno code, written in JavaScript. Put simple, it enables developers to send information from JavaScript code into Rust and get a response back.

In the following article we'll explore how can we use this capacity to execute performance critical code. We'll write a Deno plugin that converts images to grayscale. We will create the Rust crate that will be the plugin, create a hello world function, and call it from Deno. After this, we will implement the functionality to convert an image to greyscale.

## Creating the plugin

The first two things we'll need to build a plugin are: A JavaScript file to send messages to the plugin, and the plugin code, written in Rust.

For this, we'll need to create a rust plugin, we'll do it in a folder named `rust-plugin`. We had to setup the manifest, defining multiple crate-types so that it compiles to multiple operative systems (https://doc.rust-lang.org/reference/linkage.html).



We'll later need to compile this using `cargo`, Rust's package manager, which you can install [here](https://doc.rust-lang.org/cargo/getting-started/installation.html).

To make this work as a Deno plugin, we need to do a couple of things. The first is to define what will be our `hello_world` function.

```rs
fn hello_world(
  _interface: &mut dyn Interface,
  _zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  println!("Hello from rust");

  Op::Sync(Box::new([]))
}
```

Operation functions are always called with an `Interface` (ask Nuno for details) and with a `ZeroCopyBuf` that contains the parameters sent from Deno. When operations are synchronous (more about this later) the operation function must return an `Op` with the response.

We'll need to register our operation (Hello world) in Deno's plugins API, and write the code to print hello world to the console.

```rs
use deno_core::plugin_api::Interface;

#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("helloWorld", hello_world);
}


fn hello_world(
  // Cut for brevity
}
```

The public `deno_plugin_init` function is what will be called by Deno when trying to initiate a plugin, and that's where operations are registered, by calling the `register_op` function with a name and a reference for the operation function (`hello_world` for the case). The hello world function just returns an empty Op, to match the operations function interface.

With this we have the bare minimum for a plugin to work. We just need to compile it, and load it from Deno.

It might take a little on the first time, as it will fetch all the dependent crates, including `deno_core` we established as a dependency. After it finishes, a `target` folder will be created. Inside there will be a folder named `debug` with a `libtest_plugin.so` file (the file exntension might change depending on the OS), this is the file we'll load on Deno in the next section.

// TODO: talk about git fetch env variable CARGO_NET_GIT_FETCH_WITH_CLI

## Loading the plugin from Deno

Rust code done and compiled, we can't wait to interact with it. To do it we'll use a couple of unstable APIs from Deno, `openPlugin` and `core`.

We'll need to load the plugin, using `Deno.openPlugin`, and handling the different file extensions depending on the Operative System.

```ts
const filenameBase = "test_plugin";

let filenameSuffix = ".so";
let filenamePrefix = "lib";

if (Deno.build.os === "windows") {
  filenameSuffix = ".dll";
  filenamePrefix = "";
}
if (Deno.build.os === "darwin") {
  filenameSuffix = ".dylib";
}

const filename = `./rust-plugin/${filenamePrefix}${filenameBase}${filenameSuffix}`;

const rid = Deno.openPlugin(filename);
```

Keep in mind that the `filenameBase` variable must match the crate name in `Cargo.toml`. What is returned by the `openPlugin` API is Deno's "equivalent" to a process id, the resource id.

After having the plugin loaded, it is time to start calling and getting results from the core side.

```ts
const rid = Deno.openPlugin(filename);
const { helloWorld } = Deno.core.ops()

Deno.core.dispatch(helloWorld)
```

Now it's just a matter triggering this `helloWorld` operation to run. Deno's architecture is thought so that all the communication between JavaScript and Rust are made using message passing, and that's what we'll do. We can now execute our script.

```bash
$ deno run --allow-plugin --unstable main.js
Hello from rust
```

Hello world is done! We managed to write code in Rust and call it from the Deno side, our initial job here is done! We can now proceed into our initial requirements, write a plugin that converted an image to greyscale, and that's what we'll do next.

## Converting an image to greyscale

This was our initial main goal, to leverage the power of Rust to do processor heavy operations. Now that we know how to develop and communicate with a plugin, we're in great shape to start fulfilling our requirements.

Let's create a new operation function that will receive a buffer of the decoded bytes of an image and convert it to grayscale.

```rs

pub fn deno_plugin_init(interface: &mut dyn Interface) {
  // Ommited for brevity
  interface.register_op("toGreyScale", op_to_grey_scale);
}

fn op_to_grey_scale(
  _interface: &mut dyn Interface,
  zero_copy: &mut [ZeroCopyBuf],
) -> Op {
  let arg0 = &mut zero_copy[0];
  let image_array: &mut[u8] = arg0.as_mut();

  to_grey_scale(image_array);

  Op::Sync(Box::new([]))
}

fn to_grey_scale(image_array: &mut[u8]) {
  // Logic to convert each separate pixel to grayscale
}

```

Once again, we need to register the operation and the associated function. In this specific case we're again returning an empty `Op` from the operation function. If you are wondering why that happens is because we are directly mutating the `ZeroCopyBuf`. This gives us some performance benefits, since we don't need to be cloning this array and we can directly mutate the one sent.

The logic to convert to grayscale is quite simple, it's just going through all pixels and calculating the average of the 3 colors (red, green and blue), the result is the gray color to be converted too. It is available [here]() if you want to check the code.

On Deno's side, we need to read an image file, decode it and call this operation we just registered. We'll be using a library (jpegts) to encode and decode the JPEG image.

```ts
import { decode, encode } from "https://deno.land/x/jpegts@1.1/mod.ts";

// Ommited for brevity

const { helloWorld, toGreyScale } = Deno.core.ops();

// Ommited for brevity

let raw = await Deno.readFile(`dino.jpeg`);

const image = decode(raw);

Deno.core.dispatch(toGreyScale, image.data);

raw = encode(image, 100);

await Deno.writeFile(`dino-grey.jpeg`, raw.data);
```

The code is quite straightforward, at first we read the JPEG image, then we `dispatch` an action for the `toGrayScale` operation, and send the image data. All the data sent into operations must be sent and received `Uint8Array` format.

By running this, we can actually convert any image into grayscale, in our case we have an image in the current folder, named `dino.jpeg`, and after running the script we get a `dino-grey.jpeg`. Look at the comparison below:

![image-color]()
![image-gray]()

And that's it!

We just fulfilled our requirement and we got it working, leveraging Rust to delegate performance critical operations, and calling that from Deno.

There are other details that we think might be interesting. Those are things like asynchronous operations and when to use them in favour of synchronous operations, or what's the performance differences between running such code in JavaScript or Rust. We'll address those next.

## Sending and retuning JSON

The usecase we just did was quite simple. All we needed was to send an image and convert it to grayscale. As we try to handle more complex logic, it is very likely that we need to send more complex parameters.
The go-to solution is to send JSON back and forth to the plugin. To do it, we need to JSON marshalling and unmarshalling. This isn't much different to what we did in the past, with the small difference that we're now encoding and decoding the buffer sent.

- Mention json crate (and not using it because of async)
- Mention deno PR about json comms
_______________________


## Pitfalls

But not everything is perfect and full of roses. Currently, and mainly due to its still unstable nature, there are still a couple of pitfalls one might encounter while developing a Deno plugin. We'll list the ones we found until now.

### Plugin extension for multiple OSes

As we previously mentioned, the process of developing a plugin requires you to write a file in Rust that gets compiled and later loaded into Deno.

The outcome of this Rust code compilation results in different file extensions depending on the target operating system. To get a Deno plugin running on the currently suported environments (Windows, MacOS, Linux), we have to take this in consideration, and load different files depending on the host Operating System.

This is why you'll find code like this in plugins very frequently:

```ts
const filenameBase = "test_plugin";

let filenameSuffix = ".so";
let filenamePrefix = "lib";

if (Deno.build.os === "windows") {
  filenameSuffix = ".dll";
  filenamePrefix = "";
}
if (Deno.build.os === "darwin") {
  filenameSuffix = ".dylib";
}

const filename = `./rust-plugin/${filenamePrefix}${filenameBase}${filenameSuffix}`;

const rid = Deno.openPlugin(filename);
```

### No type definitions

Another topic where Deno really shines are type definitions. The fact that its core and standard-library are written and TypeScript makes sure there are very well-defined types. This gives developers a really complete documentation and autocomplete experience.

However, as of the plugins API, this isn't yet the case, again due to this API being in constant evolution and still unstable.
