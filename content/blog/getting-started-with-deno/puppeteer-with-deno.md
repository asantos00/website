---
title: Using Puppeteer with Deno
description: "Interacting with puppeteer and headless browsers using Deno"
date: "2020-01-11"
published: true
---

Almost a year ago, in May 2020, [Deno](https://deno.land) was launched.

It is the outcome of Node's creator (Ryan Dahl) experience of using Node.js after almost a decade of leaving its core team.

Ryan originally created Node.js back in 2009. Back then, Node.js brought JavaScript to the server side. Among other things, Node.js was a paradigm shift in the way many languages handled common tasks, as it deeply leveraged asynchronousity, something familiar among JavaScript users.

It suddently enabled many JavaScript developers to start building server-side applications. From there, it started being used for HTTP servers, but its usecases never stopped growing, helping make JavaScript today's most popular language.

**But...**

However, as all the great creations, Node.js comes with its flaws. And for Ryan, its creator, they were a little itchy, especially when he used Node.js again to write simple scripts, after a few years not using it. Ryan felt like he loved the productivity and prototypability of JavaScript, but some parts of Node.js were now getting in the way, as he explained in this [talk])(https://www.youtube.com/watch?v=M3BM9TB-8yA&ab_channel=JSConf).

Out of this experience's learnings, and following the evolution of JavaScript over the last 10 years, Ryan created Deno, which is, as the documentation says:

> A JavaScript/TypeScript runtime with secure defaults and a great developer experience.

We previously explored some of Deno's premises and how it addresses specific Node.js problems in another article named [Adventures in deno land](https://alexandrempsantos.com/adventures-in-deno-land/). This time we're here for a series or articles that will explore different Deno features.

Today we'll explore `deno-puppeteer`, a port of [puppeteer]() to deno. We'll demonstrate how Deno can make it even simpler to write *puppeteer* scripts and applications.

## Deno with Puppeteer

Puppeteer was a changing piece of technology. It enabled developers to directly use JavaScript to control their headless browser of choice (Chrome & Firefox) without all the burden that it used to be.

Together with great documentation and an engaged community, Puppeteer has been one of the best solutions when it comes to writing applications connecting with headless browsers.

A few months ago, [Luca Casonato](https://twitter.com/lcasdev), one of Deno's core team members, ported Puppeteer into Deno.

https://twitter.com/lcasdev/status/1344279906809741312

This is, by itself, an interesting topic to explore: how much did the code have to change to get it working in Deno. But that's not what we're doing here today.

As Deno gains its place among script tools, being able to use *puppeteer* is another interesting step taken. With `deno-puppeteer`, users  can now benefit from the ease of use of Deno while writing *puppeteer* scripts.

In this blogpost we will build a CLI utility that will demonstrate that.
## Building a Puppeteer script

The objective of the CLI utility we'll build is to check a website for visual changes in different resolutions. This tool will check the website and create an image with the difference from the last time it was checked.

It was multiple use cases, but it can work as a QA assurance tool. Something that runs after deploying your website to confirm that it is working fine in different resolutions.

To achieve this, we'll use a couple community packages and tools. Some are functions from Deno's standard library, others are just Node.js packages

- pngjs - PNG encoder/decoder in JS
- pixelmatch - A JS image comparison library
- Deno file-system APIs (`readFile` and `writeFile`)

We'll use [jspm](https://jspm.org/) to make sure `pngjs` and `pixelmatch` (both Node.js packages) are **ES6 module compatible**. This will make sure they work on Deno (yes, Deno is fully ES6 compatible!).

The CLI application will have two modes/features:

1. Screenshot the website state in different resolutions
2. Compare website with previous versions

As you might have guessed, we'll be using *puppeteer* to access the website. The code for this quite simple, it just needs to go to the website, and take a screenshot.

```ts
import puppeteer from "https://deno.land/x/puppeteer@5.5.1/mod.ts";

// cut for brevity

const browser = await puppeteer.launch({
  defaultViewport: viewPort,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();

// website is a cli parameter
await page.goto(website, {
  waitUntil: "networkidle2",
});

const screenshot = await page.screenshot();
```

After having a screenshot it is just a matter or saving it to the filesystem or comparing it with the one previously stored.

To save to the file system we'd just use `Deno.writeFile`, but to compare with the previously saved image we'll use `pixelmatch` and `pngjs`.


```ts
import pixelmatch from "https://jspm.dev/pixelmatch";
import { PNG } from "https://jspm.dev/pngjs";

// Cut for brevity

const newImage = await parsePNG(screenshot as Uint8Array);
const oldImage = await parsePNG(await Deno.readFile(screenshotPath));
const diff = new PNG(viewPort);

pixelmatch(
  newImage.data,
  oldImage.data,
  diff.data,
  viewPort.width,
  viewPort.height,
  { threshold: 0.5 },
);

const buffer = PNG.sync.write(diff);
await Deno.writeFile(
  // domain is the website domain, resolution the screen resolution
  `${screenshotBasePath}/diff-${domain}-${resolution}.png`,
  buffer,
  { create: true },
);
```

The full code is available [here](https://github.com/asantos00/deno-website-resolutions).

Again, the code is quite straightforward. We're using `Deno` runtime APIs to access the filesystem, and the third-party packages to decode and compare both images.

If the Deno APIs look strange to you, fear nothing, the Deno documentation is quite complete on that.

## Documentation

Any questions regarding the available APIs, or how they work is delighfully explained in Deno's documentation (https://doc.deno.land/).

Deno supports directly importing modules by URL in the code, and the documentation isn't any different. By using the provided URL (https://doc.deno.land) plus the URL to a package, we get a beautifully designed page with the package types and documentation.

For instance, to check `readFile` documentation we just need to navigate to https://doc.deno.land/builtin/stable#Deno.readFile and this is what we get.

![readfile-documentation](./deno-read-file.png)

*This is possible to be used with a direct GitHub link, ex: https://doc.deno.land/https/raw.githubusercontent.com/timonson/djwt/master/mod.ts*

For the builtin functions, which include everything that's made available by JavaScript itself (`fetch`, `setTimeout`, `window`, and so on) and the Deno namespace functions (like the `Deno.env.get`), we can use https://doc.deno.land/builtin/stable.

## Executing the code

After having Deno installed on the system, executing the code is the simplest of tasks. We can just use `deno run` plus the path to the file we want to execute (in our case we've called it `mod.ts`).

However, and as we previously mentioned, all Deno programs run in a sandbox thus we need to give your program the specific permissions it needs to execute.

For our specific usecase, and because *puppeteer* needs quite a lot of permissions, it needs to access the environment, network, file system, and have the ability to run processes.

We'll also have to use the `--unstable` flag to enable our program to access a few unstable Deno APIs.

```bash
$ deno run --allow-read --allow-write --allow-net --allow-env --allow-run --unstable mod.ts https://picsum.photos --diff
```

The only thing that's missing is the environment variable required by *puppeteer* that points to the browser's executable path, as mentioned in the [documentation](https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-environment-variables). We can add that variable to `.bashrc` or use it inline, as we're doing below:

```bash
$ PUPPETEER_EXECUTABLE_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome deno run --allow-read --allow-write --allow-net --allow-env --allow-run --unstable mod.ts https://picsum.photos
```

With this our program will go to `https://picsum.photos` and save a screenshot in the current path, inside a folder called `screenshots`. The next time we run this script (with the `--diff` flag) it will compare with the previously stored screenshots and will generate an image like the following:

![diff-image](./diff-picsum-Mobile.png)

And that's it!

We have a simple program that will let us check if a website has changed since the last time we checked.

We can now use another Deno command (available in the toolchain) to have this utility at hand whenever we need it - the script installer.

## Using Deno's script installer

To conclude, we'll explore one of the main tools Deno includes in its binary. The script installer, made available by the `install` command. This is one of many features like a test runner, linter, code formatter that you get access too as long as you install Deno.

The `install` command will wrap any Deno script in an executable bash program and add it to `/usr/bin`, making it's available across the system.

```bash
$ deno install --name website_compare --allow-read --allow-write --allow-net --allow-env --allow-run --unstable mod.ts
Check file:///Users/alexandre/dev/personal/deno/puppeteer/mod.ts
✅ Successfully installed website_compare
/Users/alexandre/.deno/bin/website_compare
```

*Note how we're running the `install` command with the `--name` flag to set the name of the executable. We're also setting the permissions the script needs to execute, this is the only time we'll need to do it.*

After doing this, we can run the `website_compare` wherever we are in our system.

```bash
$ website_compare https://picsum.photos
Diff stored at /Users/alexandre/dev/personal/deno/puppeteer/screenshots/diff-picsum-mobile.png
```

And this completes our objective for the blogpost!

We've demonstrated how can we use Deno's simplicity to make it even easier to write *puppeteer* scripts.

You had the opportunity to notice that everything works the same as in Node. The big difference is that you can take advantage of some parts of Deno. Those are things like native TypeScript support, a clean standard-library, no *node_modules* and fine-grained permission control.

## Conclusion

Today we've explored `deno-puppeteer`, a package that makes it possible to write *puppeteer* scripts on Deno.

Scripting is one of many use cases for Deno, one of the reasons Deno was created, but definitely not the only one. In this blogpost series' we'll explore different parts of Deno, from rust interoperability to static site generation.

We truly believe that, by building on the shoulders of giants (TypeScript, Node.js and Rust) and adding a few things to the mixture, Deno has all it takes to stand out.

If you're interested in knowing more about Deno and how to use it to build tools and web applications, make sure you checkout my recently launched book [Getting started with Deno](). In the book, we'll carefully explain all the mentioned Deno features (and many others) while building real-world applications.

This article (and code) was written by me my friend [Felipe Schmitt](https://twitter.com/schmittfelipe), a declared *puppeteer* fan which is always ready to explore new pieces of technology.

We'd like to hear what you think about it! If you have any questions, make sure you it us on Twitter or LinkedIn. I'll leave the links below.

Felipe: [Twitter](https://twitter.com/schmittfelipe) | [LinkedIn](https://www.linkedin.com/in/felipeschmitt/)

Alexandre: [Twitter](https://twitter.com/ampsantos0) | [LinkedIn](https://www.linkedin.com/in/alexandrempsantos/)
