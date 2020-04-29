---
title: Ok, TDD sounds great, but...
description: Do you have to write all the tests first? Is it that different if you write them afterwards?
date: "2020-04-29"
featuredImage: ./growing-software-guided-by-tests/feedback-loop-tdd.png
published: false
---

After reading my last post, [Yes, tdd does apply to your usecase](https://alexandrempsantos.com/yes-tdd-does-apply-to-your-usecase/), my friend [Ruskin](https://twitter.com/jonnyparris) gave me very interesting feedback.

He pointed out some existing flaws of my proposed solution, and this was great. I don't believe in software as something individual and done once and forgot forever. Or at least that was never how it worked for me on the real world.

I got so intrigued about the feedback that I had the dilema: _Should I edit the last post?_

Instead of editing my last blog post, which would mean losing the initial thoughts and how to improve on them, I've decided to write this one.

# What feedback did I got?

- Some **common myths about TDD** were listed but it does not explain why I believe they're wrong.

- In order to go completely _interface first_. I should have done the flow differently (I'll explain it later)

# Debunking the myths

These were some common TDD thoughts that came to my mind everytime I tried TDD before reading the book:

- I **can't** write all the tests upfront, that's impossible
- I **can** write the tests afterwards and still **not be biased**, it is pretty much the same thing, right?

I've finished my last post without clearly explaining, at least explicitly, why **they're both wrong**.

That is what we're here for.

## No, you don't need to write all the tests upfront

This was always my though from the first times I read about TDD. I've seen this people who used it as some kind of magicians that would know **everything** about how they would code their features from the first moment. And I couldn't do it.

After reading the book, it was clear to me that those kinds of magicians **do not exist**, or at least they're very rare.

Again, quoting Kent Beck:

> I'm not a great programmer; I'm just a good programmer with great habits.

Those _magicians_ just had **better habits**, and they knew how to use them in order to design overal better and easy to change software.

A few chapters in "Growing Object-Oriented Software Guided by Tests" and I was feeling magic because the tools were helping me. In this case, _the tests were helping me_ designing better software and testing my ideias faster. That blew my mind 🤯.

**TLDR:** You don't need to write all the tests upfront. You just need to write the _simplest meaningful test_ for the feature you're writing, and come back to write the next one when it is green.

You do write tests before coding, just not all of them. Just keep this short cycle of writing a test and writing the logic for it until a piece of functionality is done.

## I can write the tests afterwards

You actually can, and that's what I did most of the times. I thought I wouldn't be biased, that I wouldn't test implementation details. At the end of the day I'm not here to trick myself, right?

More than anyone I'm sorry to say this, but **I was wrong**.

What happened (and what still happens if I don't write tests first) is that I know too much about the implementation for that not to influence me when testing.

It was a little like the following image:

![colors-words](./common-tdd-myths/colors-words.jpg)

Try to say the underlying colors and not the words.

Thought job right? Your brain automatically reads the words while you're trying to say the color.

Quoting Daniel Kahneman on _Thinking fast and slow_ looking at the two modes of the brain as _systems_.

> "System 1" is fast, instinctive and emotional; "System 2" is slower, more deliberative, and more logical.

The instinctive brain (System 1) is tricking you, getting in your way. You want to say the underneath colors, but your mind automatic reads the word. This is how _testing last_ was to me. It also felt like starting to do something without a clear goal in mind.

Let me quote Seneca (yes, I like quotes) in a saying that is very common in my hometown, Ericeira:

> There is no favorable wind for the sailor who doesn’t know where to go

By writing tests first I noticed I was putting the bar much higher before writing my logic. It turned out as a safety, knowing I did establish my completion criteria before starting to code made me sleep better at night.

**TLDR:** You can write tests last, yes. But do not expect most of the TDD advantages. It is the fact that you do it first that makes it so effective, **it's a matter of discipline** more than anything else.

# Going "interface first"

In the [last post](https://alexandrempsantos.com/yes-tdd-does-apply-to-your-usecase/), on point `2` we wrote a failing acceptance test for the feature we were writing.

```js
// cypress/integration/stock.ts

import { Server } from "miragejs";
import { makeServer } from "../../makeServer";

let server: Server

beforeEach(() => {
  server = makeServer({ environment: "test " })
})

afterEach(() => {
  server.shutdown()
})

it("renders wine names", () => {
  cy.visit("/")

  server.get("/wines", () => [
    { name: "Pomares", year: 2018 },
    { name: "Grainha", year: 2017 },
  ])

  expect(cy.contains("Pomares 2018")).to.exist
  expect(cy.contains("Grainha 2017")).to.exist
})
```

Then we went on the quest to write the logic to satisfy it.

I mistakenly **jumped to conclusions**, skipping some intermediate steps, and stating that we would need an _API client_.

Be strictly following the principle I advocated, **I shouldn't have done it**. We should have first started testing the component itself, and only come to the API client when it was _strictly needed_.

Doing a small recap:

The first thing after the acceptance test should be to write a failing **unit test** for the component.

```js
// pages/index.test.tsx
import { render } from "@testing-library/react"
import { Home } from "./index"

it("renders", () => {
  const  { getByText } = render(<Home />);

  expect(getByText('Wine Cellar')).toBeTruthy();
  expect(getByText('Available Stock')).toBeTruthy();
})

```

After this, we would realize the need to connect to an API to get the wines and the need to have an API client.

```js
// pages/index.test.tsx
import { render } from "@testing-library/react"
import { Home } from "./index"
import * as Api from "../services/api"

it("tries to get wines", () => {
  const getWines = jest.fn()

  // @ts-ignore
  Api.getWines = getWines
  // ts-ignore is needed to be able to mutate the `readonly` property

  render(<Home />)

  expect(getWines).toHaveBeenCalled();
})

```

From here until the end, the whole flow would evolve naturally. First by creating the API client tests, then the API client logic itself, and then using it on the component, following the flow of the [previous post](https://alexandrempsantos.com/yes-tdd-does-apply-to-your-usecase/).



This makes much sense in terms of going **interface down** instead of **implementation up** and would make it more intuitive to follow and would end up improving the overall design and code structure.

# Conclusion

I hope to have answered some questions that were left floating from the last post.

At the same time I want to demonstrate how both writing and software are **iterative** and **feedback driven** processes. The day after I had my post published, I was already rewriting and improving part of it.

It also shares the precious knowledge that [Ruskin](https://twitter.com/jonnyparris) shared with me (many thanks for that 🙏). Adding to that, some of his problems/doubts were probably common in other people, which I hope to have clarified on this post.

Are you still not convinced by TDD? What problems do you had implementing it? Doesn't it apply to your use case?

I'd love to hear from you.
