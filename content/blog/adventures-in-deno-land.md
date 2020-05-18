---
title: Adventures in deno land
description: Thoughts after trying out deno to build a small API that connects to twitter
date: "2020-05-15"
published: false
featuredImage: ./adventures-in-deno-land/banner.png
---

Earlier this week [deno](https://deno.land/) was released. I got very excited by it since I first seen [Ryan Dahl talk](https://youtu.be/M3BM9TB-8yA) at jsconf.

This talk is one of my personal favorites, it is a lesson on humility. Having Ryan looking at what we build and criticizing it shows how easy it is to look at improvements in work we did 10 years ago, even if that work is used by millions of people.

Back to what brought me here, after the excitement I took some hours one of these nights to have a look at deno. The documentation is good, by following what they call _the manual_ one could have a very good understanding of how to use deno.

## I gotta build something with it

After reading the documentation, it looked great. But my way to actually learn is to _build something with it_. It brings me closer to the real pains I have when I write applications.

I decided to **build an API that connects to twitter** and returns 15 tweets from a user with more than 5 likes. I also decided I was deploying it on Kubernetes so it looked a little closer to a real application.

If you wanna follow the code, [here you have it](https://github.com/asantos00/deno-twitter-popular)

At first, I was kinda lost and decided to go explore the [std library](https://deno.land/std). Gotta say I was impressed by how approachable was the code, ended up learning some stuff.

After getting to know some APIs, installing the [VSCode plugin](https://marketplace.visualstudio.com/items?itemName=justjavac.vscode-deno) and `deno` itself, I was ready to start my adventure.

To be honest, _it wasn't a real adventure_, everything looked so familiar that I almost forgot I was using a different runtime.

## Let's get to code

By using std library `http_client` it was very easy to build a server and get it up running and handling requests.

```js
import { serve } from "./deps.ts";

const s = server({ port: 8080 });

for await (const req of s) {
  req.respond({
    status: 200,
    body: "Hello world",
  });
}
```

Step 2 was to connect it to twitter API. Having `fetch` already included on `deno` makes it very familiar.

```js
fetch(
  "https://api.twitter.com//1.1/search/tweets.json&q=(from: ampsantos0 min_faves: 5)",
  { headers: new Headers([["content-type", "application/json"]]) }
)
```

Deno opted for mimicking existing Web APIs where they exist, rather than inventing a new proprietary one. For APIs that are not web standard, the `Deno` namespace is used.

## Running it

Running the code was also a breeze, having permissions being managed by the runtime itself is a big step forward in terms of security.

```sh
$ deno run --allow-net ./index.ts
```

When you happen to use something you don't have permission to here's what you get:

```
error: Uncaught PermissionDenied: access to environment variables, run again with the --allow-env flag
    at unwrapResponse ($deno$/ops/dispatch_json.ts:43:11)
    at Object.sendSync ($deno$/ops/dispatch_json.ts:72:10)
    at Object.getEnv [as get] ($deno$/ops/os.ts:27:10)
```

Which is a very reasonable and comprehensive error.

When running the code, the `--inspect` flag enables developers to use Chrome Dev Tools the same way they did in _node_, so the experience is still great.

## Module resolution

When Ryan first talked about deno, he mentioned that node's way of importing stuff was too complicated and had lots of special cases.

Example:

```js
const path = require("path")
```

The dependency we're importing, `path` might come from node `std-lib` (which is the real place it comes from). At the same time, it can also be from `node_modules`, you could have installed a dependency named `path`, right? Even after you find the dependency, what's the file you're loading? `index.js`? What if `package.json` has a different `main` file defined?

Ok, but local imports are ok... When you do:

```js
const add1 = require("./utils/math")
```

Is `math` a file? Or a folder with an `index.js` inside of it? What is the file is not `.js`?

You get the point, **node imports are hard**, and deno solves if very well.

Following a `golang` like approach, of having _absolute urls_ that might sound strange at first, but give it a try.

- It solves local imports by adding the extension to it.

```js
import { add1 } from "./utils/math.ts"
```

You know just from reading it that `math.ts` is a file.

- It solved third party imports by having an absolute url

```js
import { serve } from "https://deno.land/std/http/server.ts"
```

No more magic module resolution.

This absolute module resolution enabled some fun stuff like what [R. Alex Anderson](https://twitter.com/ralex1993/status/1261039838100221952) did. I'm sure a lot more will appear in the next days.

https://twitter.com/ralex1993/status/1261039838100221952

**Note**: VSCode plugin functions well with the third party imports, you can `cmd+click` on dependen and you're directed to the code.

## Third party dependencies

Let's talk about third party dependencies, first, forget `npm install`. As _deno_ relies on absolute urls, it doesn't need this _installation_ step to run (at least not manually).

When you try to run, it downloads the dependencies, caches them, and then runs with the cached version. To force the caching of a module without running it, you can run `$ deno cache [module url]`.

Don't you want to have urls everywhere? You can have one single file that lists the dependencies and exports only what is needed. They [address this](https://deno.land/manual/linking_to_external_code#it-seems-unwieldy-to-import-urls-everywhere) on the docs and recommend creating a `deps.ts` file.

Again, not relying on any magic, `deps.ts` is a file that imports from url and exports what is needed.

```js
// deps.ts
export { serve } from "https://deno.land/std/http/server.ts"
export { parseDate } from "https://deno.land/std/datetime/mod.ts"
```

The cool thing about having this `deps.ts` file is that you can use docker cache to only run `deno cache` if `deps.ts` changed:

```docker
COPY deps.ts .
RUN deno cache deps.ts
```

Having deno dockerized is also a breeze, as stuff like bundling the code is handled by the platform, the less you have to be concerned.

## Deno binaries

Deno also provides an `install` command, but its usage is similar to the `npm install --global` flag, citing deno website:

_This command creates a thin, executable shell script which invokes deno using the specified CLI flags and main module. It is place in the installation root's bin directory._

When you run this command, you also have to specify what permissions it will need, again, secure by default.

```
$ deno install --allow-net --allow-read https://deno.land/std/http/file_server.ts
```

# Conclusion

Coming from the JS/TS world I'd say deno got lots of things right. It has the familiarity of JS and TS and has types working from day 0 on the standard library (not always easy setup in node).

Their standard library is great, after navigating through the code, it looks both readable and well thought. I like this quote from the std-lib repository.

> deno_std is a loose port of Go's standard library. When in doubt, simply port Go's source code, documentation, and tests.

This is funny but interesting at the same time, as it uses a lot of the effort put by the golang community on their std-lib.

The permission system is also great and intuitive, the module resolution magic is now solved and we can even run code from gists. All the APIs now return Promises, which was becoming a pain in node land (where people created stuff like promisify to avoid callback hell). Using `await` with pretty much with pretty much all the APIs in the standard lib is also a plus.

Adding to all of this, deno also copied from golang the fact it ships a lot of the essential tools in the main binary. Discussions about bundler, formatter, and test runner will no longer be a thing, and even if they are, there's an official way now.

I look forward to how this will evolve, how the documentation generator and the dependency bundler look like (since they're not available on the manual, yet).

Gotta say the experience of building a (very small) with it was very good and intuitive. Can't wait to build something more _real_ with it!
