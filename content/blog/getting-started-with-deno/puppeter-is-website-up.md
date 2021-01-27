---
title: WIP Using Puppeteer with Deno
description: "Building an application that checks if a website is up using Puppeteer and Deno"
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
We previously explored some of Deno's premises and how it addresses specific Node.js problems in another article named [Adventures in deno land](https://alexandrempsantos.com/adventures-in-deno-land/), but today we'll explore a single one.

## Deno with Puppeteer

Puppeteer was a changing piece of technology. It enabled developers to directly use JavaScript to control their browser of choice (Chrome & Firefox) without all the burden that we were used to, from the Selenium times. Together with great documentation and a big community, Puppeteer has been the de-facto solution whenever people want to connect with a headless browser.

A few months ago, [Luca Casonato](), one of Deno's core team members, ported Puppeteer into Deno. This by itself makes it an interesting subject to understand, how much did the code have to change to get it working in Deno. That's not what we're doing today though.

With Deno gaining its place among what people use whenever they want to build quick scripts, having puppeteer is one more use case unlocked. With deno-puppeteer users can now benefit from the ease of use of Deno while writing puppeteer scripts.

## Building a Puppeteer script

Today we'll write a simple CLI utility that will check a website for changes.

This tool will create an image with the difference from the last time it accessed the website. It can work as a QA assurance tool, for you to run after deploying a specific page, and confirming that it is working fine in different resolutions.

To achieve this we'll use a couple of tools from the community, some functions from Deno's standard library, and a couple Node.js packages

- pngjs - PNG encoder/decoder in JS
- pixelmatch - A JS image comparison library
- `Deno.env` to get the screenshots' destination path
- `parse` from Deno's standard-library to parse command-line flags
- Deno file-system APIs (readFile and writeFile)

We'll use [jspm](https://jspm.org/) to make sure `pngjs` and `pixelmatch` are ES6 module's compatible and thus Deno compatible (yes, Deno is fully ES6 compatible!).

The CLI will have two modes/features:

- Screenshot the website in 3 different resolutions and save to a file
- Compare website with previously taken screenshot

As you might have guessed, we'll be using puppeteer for that. The puppeteer code is actually quite simple, it just needs to go to the website, and take a screenshot.

```ts
import puppeteer from "https://deno.land/x/puppeteer@5.5.1/mod.ts";

// cut for brevity

const browser = await puppeteer.launch({
  defaultViewport: viewPort,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.goto(website, {
  waitUntil: "networkidle2",
});

const screenshot = await page.screenshot();
```

Then it is just a matter of either saving the screenshot in the file system, or comparing it with the one previously stored, using `pixelmatch`.


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
  // domain is the website domain, name is the resolution
  `${screenshotBasePath}/diff-${domain}-${name}.png`,
  buffer,
  { create: true },
);
```

The full code is available [here](https://github.com/asantos00/deno-website-resolutions).

Running this is the simplest of things. We just need to use `deno run` command.

However, and as we mentioned all Deno programs run in a sandbox, we need to give your program the specific permissions it needs to execute.

For our specific usecase, it needs to access the environment, network, file system, and have the ability to run processes.

```bash
$ deno run --allow-read --allow-write --allow-net --allow-env --allow-run --unstable mod.ts https://mywebsite.com --write
```

The only thing that's missing is the environment variable required by puppeteer that points to the browser's executable path.

```bash
$ PUPPETEER_EXECUTABLE_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome deno run --allow-read --allow-write --allow-net --allow-env --allow-run --unstable mod.ts https://mywebsite.com --write
```

With this our program will go to `https://mywebsite.com` and save a screenshot of it in the current folder. The next time we run this script it will compare with the previously stored screenshot and will generate an image like the following:

![diff-image]()

And that's it, we have a very simple script that will let us check if a website has changed since the last time we checked. We can now use another Deno command made available in its complete toolchain to have this utility at hand whenever we need it. This command is the ´install´ command.

## Using Deno's script installer

The `install` command will wrap the script in a executable shell program and add it to `/usr/bin` so that it's available as a binary.

```bash
$ PUPPETEER_EXECUTABLE_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome deno install --name website_compare --allow-read --allow-write --allow-net --allow-env --allow-run --unstable mod.ts
✅ Successfully installed website_compare.
/Users/deno/.deno/bin/website_compare
```

Note how we're running the `install` command with the `--name` flag to set the name of the executable.

This way, we can run the website_compare binary wherever we are in our system.

```bash
$ website_compare https://mywebsite.com
Diff stored at /alexandre/website_compare/diff-mywebsite-mobile.png
```

As you can see, the puppeteer usage is as simple as it is on Node.js.
The big difference is that you can leverage all of Deno's advantage. Those are things like native TypeScript support, a cleaner standard-library, no *node_modules* and fine-grained permission control.
