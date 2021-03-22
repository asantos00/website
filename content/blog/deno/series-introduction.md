---
title: Exploring the deno.lan
description: "A blogpost series about using Deno for multiple contexts, from building CLIs to web scrapping tools, among others"
date: "2020-03-30"
published: true
---

This is the introduction of a blog post series where we'll use Deno to build different applications. Most of the blog posts will be written with collaboration with friends of mine. We're doing this because we think this makes the share more interesting, as these are people with different backgrounds, some of them have *close to none* JavaScript experience.

If you're not familiar with Deno, you can click [here]() to scroll down to the TLDR, or [here](../adventures-in-deno-land.md) to have a look an initial exploratory article I wrote an year ago. If you at least have heard of Deno and you are here for the content, let's not waste you more time.

Here's what we'll cover on the upcoming blog posts: 

- [Creating a CLI with Deno](./build-a-cli-with-deno.md)
- [Using Deno with Puppeteer]()
- [Building a Deno plugin - the interoperability with Rust]()
- [Static site generation in Deno, with aleph.js]()
- ...

We'll use these different use cases to explore Deno and how it can be applied to real world scenarios. Hopefully this will also help you have a better understanding on the new JavaScript runtime.

Let me know if there is any other topic you're interested in reading (or writing) about! I'd be happy to write it down myself, or to contribute to anything you're writing on the subject.

The above blogposts don't have any specific order, if you want a suggestion, you can start by [Creating a CLI with Deno](./build-a-cli-with-deno.md).

Hope that you find this series interesting, feel free to reach me for any questions.

Best,

___




If you're interested in getting to know Deno even better than what we explore on the above-mentioned blogposts, I recently wrote a book on it, called [Deno Web Development: Write, test, maintain and deploy JavaScript and TypeScript web applications using Deno](https://www.amazon.com/Getting-started-Deno-JavaScript-applications/dp/180020566X?ref_=d6k_applink_bb_marketplace).




___


## The creation of Deno - TLDR

Almost a year ago, in May 2020, [Deno](https://deno.land) was launched.

Deno is the outcome of Node.js' creator (Ryan Dahl) experience of using Node.js, after almost a decade of leaving its core team.

Ryan originally created Node.js back in 2009. Back then, Node.js brought JavaScript to the server side. Among other things, Node.js was a paradigm shift in the way many languages handled common tasks, as it deeply leveraged asynchronousity, something familiar among JavaScript users.

It suddently enabled many JavaScript developers to start building server-side applications. From there, it started being used for HTTP servers, but its usecases never stopped growing, helping make JavaScript today's most popular language.

**But...**

However, as all the great creations, Node.js comes with its flaws. And for Ryan, its creator, they were a little itchy, especially when he got back using Node.js again to write simple scripts, after spending a few years without using it. 

Ryan felt like he loved the productivity and prototypability of JavaScript, but some parts of Node.js were now getting in the way, as he explained in this [talk])(https://www.youtube.com/watch?v=M3BM9TB-8yA&ab_channel=JSConf).

Out of this experience's learnings, and following the evolution of JavaScript over the last 10 years, Ryan created Deno, which is, as the documentation says:

> A JavaScript/TypeScript runtime with secure defaults and a great developer experience.

We previously explored some of Deno's premises and how it addresses specific Node.js problems in another article named [Adventures in deno land](https://alexandrempsantos.com/adventures-in-deno-land/), but on this series we'll explore a few of Deno's usecases.



