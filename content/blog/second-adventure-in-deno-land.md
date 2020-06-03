---
title: Second adventure in deno land
description: Going a little bit deeper on deno. Lock files, testing, running code in the browser.
date: "2020-06-15"
published: true
featuredImage: ./adventures-in-deno-land/banner.png
---

Last time I wrote I covered my adventure in deno.land. I have to say it was a fun one. That excitement of trying some new technology is always there, it makes you think of new possibilities and tools, and what are you going to build with it.

I build a small twitter bot with deno, without any libraries, both to scratch the surface of the standard library, and to get to know deno a little better in a context that is not a overly simple "hello world".

It was very well-received. To be honest it was well more than what I was expected, ended up being, to the time, my most read and reacted post ever. I think I got quite lucky on the "deno hype train".

On my last post I've explored the standard library, module imports, simple permission system and dependency management. Today I'm trying to cover the following topics:

- Tests
- Official VSCode extension
- More granular permissions
- Documentation generation
- Running deno code in the browser
- Lock files
- Oak

Again, if you want to follow the code, [here you have it]().

## Lock files

To complete the information from the last post about dependencies, I'll have to talk about lock files. They're a standard practice in node and they're used to describe the exact tree of dependencies. This is used to make an "install" more repeatable, avoiding issues that may arrise out of version misalignement.

In _deno_ you can generate a lock file for the used dependencies by running

```bash
deno cache --lock=lock.json --lock-write ./src/deps
```

This command will _cache_ (that local installs the used dependencies) based on a `lock.json` file. The `--lock-write` flag updates or creates the `lock.json` file. The last parameter is the file that uses the dependencies.

To install the dependencies while integrity checking every installed resource, one can run:

```bash
$ deno cache -r --lock=lock.json deps.ts
```

The generated file is no more that a json object of dependencies and a checksum for them.

## VSCode extension

The vscode extension is the exact same that I presented last time, it was just moved to the official repo, as the changelog states

> Moved from https://github.com/justjavac/vscode-deno to https://github.com/denoland/vscode_deno in order to have an "official" Deno plugin.

It works very well, even though it still has a small problem of when cmd + click on external dependencies, it does not assume it's language. It should detect automatically if it is a javascript of a ts file and highlight it accordingly.

It's probably an **oportunity for contribution** that I might take, after I get the time to understand the code

## Documentation

Another of the advantages presented by Ryan in his talk has that deno included a documentation generator (as well as other tools) on the official bynary. The documentation generator doesn't have (yet) a section on the website, but we'll explore it a bit here.

### Documentation of remote modules

Deno caching local modules allows stuff like coding in an airplane (that was also possible in node). However, deno provides a cool way to see the third party code documentation without having to browse the code.

```bash
$ deno doc https://deno.land/std/http/server.ts
```

This outputs the methods exposed by the standard library http server.

````
function listenAndServe(addr: string | HTTPOptions, handler: (req: ServerRequest) => void): Promise<void>
  Start an HTTP server with given options and request handler

function listenAndServeTLS(options: HTTPSOptions, handler: (req: ServerRequest) => void): Promise<void>
  Start an HTTPS server with given options and request handler

function serve(addr: string | HTTPOptions): Server
  Create a HTTP server

function serveTLS(options: HTTPSOptions): Server
  Create an HTTPS server with given options

class Server implements AsyncIterable

class ServerRequest

interface Response
  Interface of HTTP server response. If body is a Reader, response would be chunked. If body is a string, it would be UTF-8 encoded by default.

type HTTPOptions
  Options for creating an HTTP server.

type HTTPSOptions
  Options for creating an HTTPS server.
```

Very neat, right? A very nice way of having an overview of the modules.

To see the documentation for a specific symbol, one can also run.

```bash
$ deno doc https://deno.land/std/http/server.ts listenAndServe
```

Which outputs

```bash

function listenAndServe(addr: string | HTTPOptions, handler: (req: ServerRequest) => void): Promise<void>
    Start an HTTP server with given options and request handler
        const body = "Hello World\n";     const options = { port: 8000 };     listenAndServe(options, (req) => {       req.respond({ body });     });
    @param options Server configuration @param handler Request handler

```

The `--json` flag is also supported (however, not for symbols) that allows generating the documentation in the json format, enabling programmatic uses.

One great example of the documentation generation uses is _deno_ [run time API](https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts).

It uses Deno to generate modules with the `--json` command and provides a really nice layout around it.

I've actually started trying to adapt the code and all the logic that deno doc website uses to generate documentation on the fly so people can run it locally for their own projects. [Here it is]()  TODO - not finished
````

## Fine grained permissions

This is, again, one thing that _deno_ got very well. They're easy to use and secure by default. On the last post I explained that in order for a script to be able to access the network, you'd have to explicitly use `--allow-net`.

That is true, however, I was alerted by my friend [Felipe Schmitt] that in order for it to be even safer, we can use:

```
--allow-net=api.twitter.com
```

This would, as expected, allow network calls to `api.twitter.com` but disallow all the other calls. Instead of allowing complete access to network, we're allowing just a bit, by whitelisting and blocking everything else by default.

This is very well explained on the [Permissions page](https://deno.land/manual/getting_started/permissions.). This was recently added on [this PR](https://github.com/denoland/deno/pull/5426), one of the many docs updates that have been happening.

## Running code in the browser

Another very interesting feature of _deno_, also included in the offical binary, is the `bundle` command.

It allows you to bundle your code into a single `.js` file. That file can be run as any other deno program, with `deno run`.

What I find interesting is that the generated code, if it doesn't use the `Deno` namespace, can run in the browser. The possibilities for this are limitless, for instance, what if I wanted a frontend to interact with my API via a client?

I can write that client in deno, here's the code to get the popular tweets.

```js
import { Tweet } from "../twitter/client.ts"

export function popular(handle: string): Promise<Tweet[]> {
  return fetch(`http://localhost:8080/popular/${handle}`)
    .then(res => res.json())
    .catch(console.error)
}
```

This code lives on the API codebase, and thus it is written in _deno_ (you can tell by the imports having file extensions). It uses types from the twitter client the API uses.

Having the client living on the API codebase means that whoever updates the API can also update the client, abstracting the backend and API changes from the frontend code.

Then, I can run the `bundle` command and put the generated file in a folder.

```bash
$ deno bundle client/index.ts public/client.js
```

It will generate the `client.js` file that is able to be run in the browser. Then, for demonstration purposes we can create a `public/index.html` file with the following code:

```html
<script type="module">
  import * as client from "./client.js"

  async function fetchTwitter(event) {
    const value = document.querySelector("#handle").value
    const result = await client.popular(value)

    /*
      Omitted for brevity
    */
  }
</script>
```

And the `public` folder can be served by any webserver. Since we're talking about deno, we can serve it with standard library's file server.

```bash
# inside the public folder
$ deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts
```

With this, our code can use the client that was **originally written in deno** on the frontend, to interact with the API.

## Testing
