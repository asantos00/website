---
title: Adventures in Deno land 🦕
description: Thoughts after trying out Deno to build a small API that connects to twitter
date: "2020-05-15"
published: true
featuredImage: ./adventures-in-deno-land/banner.png
---

Earlier this week [Deno](https://deno.land/) was released.

As I was very excited ever since I first heard about it on [Ryan Dahl's talk](https://youtu.be/M3BM9TB-8yA) at [jsconf](https://jsconf.eu), I had to give it a try.

This talk is one of my personal favorites, it is a lesson on humility.
Having Ryan looking at what he built 10 years ago with a criticizing tone is interesting. Even when _node_ is used by millions of people, its creator still feels bad about some decisions made at the time.

Getting back to what brought me here... After hearing of the launch of v1.0 I took some hours to learn more about it. The documentation is very well written and structured, which by following what they call _the manual_ one could have a very good understanding of how to start using it.

## Building something

After reading the documentation, it looked great, in theory. But my default way to learn is normally to _build something with it_. It normally helps me identify pains I'd have in the real world if I had to build a _real_ application with it.

The decision was to **build an API that connects to twitter** and returns 15 tweets from a user with more than 5 likes, I called it _popular tweets_. This small server should then run on a Kubernetes environment.

If you wanna follow the code, [here you have it](https://github.com/asantos00/deno-twitter-popular)

At first, I was kinda lost and didn't know any APIs. I've decided to go explore the [standard library](https://deno.land/std). I got very impressed by how approachable was the code, took some time to read it, and learned a ton.

It got this idea on the back of my mind, which might lead to a future article, similar to what [Paul Irish](https://twitter.com/paul_irish) did 10 years ago on [10 things I learned from the jquery source](https://www.paulirish.com/2010/10-things-i-learned-from-the-jquery-source/) but for Deno source, might actually do it!

After getting to know the basics, installing the [VSCode plugin](https://marketplace.visualstudio.com/items?itemName=justjavac.vscode-deno) and Deno, we were ready to start my adventure.

To be honest, _it wasn't a real adventure_, everything looked so familiar that I almost forgot I was using a different runtime.

## Getting to code

By using the standard library's `http server` it was very easy to build a server and get it up running handling requests.

```js
import { serve } from "./deps.ts";

const s = serve({ port: 8080 });

for await (const req of s) {
  req.respond({
    status: 200,
    body: "Hello world",
  });
}
```

Step 2 was to connect it to twitter API. Having `fetch` already included on `deno` made it very easy and familiar.

```js
fetch(
  "https://api.twitter.com/1.1/search/tweets.json&q=(from: ampsantos0 min_faves: 5)",
  { headers: new Headers([["content-type", "application/json"]]) }
)
```

Deno opted for mimicking existing Web APIs where they existed, rather than inventing new proprietary ones. For APIs that are not web standard, the `Deno` namespace is used. This looks like a smart choice to me, improving discoverability and reusing knowledge developers already have of the existing APIs.

## Running it

Running the code was a breeze. One of deno's selling points is security and I couldn't agree more, it improved over _node_. You notice it the first time you try to run a program:

```sh
$ deno run ./index.ts
```

Once we are, in this case, using network to both expose our **endpoint** (:8080) and access **Twitter's API** without our explicit consent, here's what you get:

```
error: Uncaught PermissionDenied: network access to "0.0.0.0:8080", run again with the --allow-net flag
    at unwrapResponse ($deno$/ops/dispatch_json.ts:43:11)
    at Object.sendSync ($deno$/ops/dispatch_json.ts:72:10)
    at Object.listen ($deno$/ops/net.ts:51:10)
    at listen ($deno$/net.ts:152:22)
```

This is a very reasonable and comprehensive error, again, good job on this!

A good approach for this is by enabling whitelist permissions by using the flag `--allow-net` which Deno does it in a very simple and pragmatic way:

```sh
$ deno run --allow-net=0.0.0.0:8080,api.twitter.com index.ts
```

When running the code, the `--inspect` flag enables developers to use Chrome Dev Tools the same way they did in _node_, the debugging experience is as good as developers are used to.

## Module resolution

When Ryan first talked about Deno, and the _mistakes made in node's design_, one of the big things he mentioned that _node's_ way of importing modules was too complicated and had lots of edge cases.

Example:

```js
const path = require("path")
```

The dependency we're importing, _path_ might come from _node_ standard library. At the same time, it can come from _node\-modules_, or you could have installed a dependency named _path_, right? Ok, now you found the dependency, do you know what is the file you are requiring? Is it index.js? What if _package.json_ has a different _main_ file defined?

Lots of unknowns...

What about local imports? When you do:

```js
const add1 = require("./utils/math")
```

Is `math` a file? Or a folder with an `index.js` inside of it? What is the file extension? Is it _.js_, _.ts_?

You get the point... **Node imports are hard**.

Deno follows a `golang` like approach, of having _absolute urls_. If it sounds strange to you, bare with me. Let's look at the advantages:

- It solves local imports by adding the extension to it.

```js
import { add1 } from "./utils/math.ts"
```

You know just from reading it that `math.ts` is a file.

- It solves third party imports by having an absolute URL

```js
import { serve } from "https://deno.land/std/http/server.ts"
```

No more magic module resolution.

This absolute module resolution enabled some fun stuff like what [R. Alex Anderson](https://twitter.com/ralex1993/status/1261039838100221952) did, running code from a set of gists.

https://twitter.com/ralex1993/status/1261039838100221952

**Note**: VSCode plugin functions well with the third party imports, you can `cmd+click` on dependency and you're directed to the code, as usual.

## Keeping track of dependencies

Let's talk about managing dependencies. As _deno_ simplified the module imports, it allowed it to _automatically cache_ dependencies.

When you first try to run it, it downloads the dependencies, caches them, and then runs with the cached version.

To force the caching of a module without running it, you can run `$ deno cache [module url]`.

You are probably thinking it is strange and error-prone to URLs all around the code? That's right. You can manage it however you want, as all modules have absolute URLs now, it's just code at the end of the day.

Deno recommends having a `deps.ts` file, you can call it whatever you want but since it [is in the documentation](https://deno.land/manual/linking_to_external_code#it-seems-unwieldy-to-import-urls-everywhere), I see this start becoming a standard. On that file, you can import all the dependencies from the URLs and export the methods used.

```js
// deps.ts
export { serve } from "https://deno.land/std/http/server.ts"
export { parseDate } from "https://deno.land/std/datetime/mod.ts"

// index.ts
import { serve } from "./deps.ts"
```

Having one single `deps.ts` file allows you to do some caching (as you did in `package.json`) on docker builds.

```docker
COPY deps.ts .
RUN deno cache deps.ts
```

By doing this, the `RUN` command will only run if the `deps.ts` file changed. With this, and as the installation step is now _automatic_, running it on docker became simpler.

There is one thing that has to be taken care of with Deno, we have to send the flags for the permissions.

```docker
CMD ["run", "--allow-net", "index.ts"]
```

## Deno binaries

Deno provides an `install` command. But, as I said earlier, it does not install dependencies on the project, as that is done automatically.

Its usage is similar to the `npm install --global` flag, citing the explanation on the official website about `install`:

_This command creates a thin, executable shell script which invokes Deno using the specified CLI flags and main module. It is placed in the installation root's bin directory._

When you install a global binary, you have to specify what permissions it will need to run, again, secure by default.

```
$ deno install --allow-net --allow-read https://deno.land/std/http/file_server.ts
```

And you can then run `$ file_server`

# Conclusion

Coming from the JS/TS world I'd say Deno got lots of things right. It has the familiarity of JS and TS with small twists, to the better side. Having the standard library written in TS is a big plus, at it isn't always straightforward to set it up in _node_.

The standard library is great, it looks both readable and well thought. Quoting the `deno_std` main repo:

> deno_std is a loose port of Go's standard library. When in doubt, simply port Go's source code, documentation, and tests.

This is funny and interesting at the same time, Deno used the effort the golang community put in its standard lib to drive its own, the result looks great.

The permission system is great and intuitive. Module resolution is now simpler and removes pretty much all the magic we got used to in _node lands_.
All the async APIs return Promises now. It means using `await` and `.then` everywhere, not incurring into callback hell and not needing tools like `promisify` and such.

Adding to all of this, Deno also got inspiration from golang by shipping a lot of the essential tools in the main binary. Discussions about bundler, formatter, and test runner will no longer be a thing, and even if they are, there's an official way now. I haven't tried the test suite and the documentation generator yet, I might write about it later.

Gotta say the overall experience of building a (very small) application with it was very good and intuitive. Can't wait to build something more _real_ with it!

I'm excited to see how this will evolve and thus I wrote another article, my [second adventure in Deno land](https://alexandrempsantos.com/second-adventure-in-deno-land/) where I go a little deeper on the runtime.
