---
title: TDD in the real world
description: 'How I started using TDD for an amazing improve in DX and UX'
date: '2020-02-07'
published: false
---

# TDD is not 'writing tests first'

## Agenda:

- Presentation
- Curiosity about the book, about what changed
- Why should you want to do TDD / Misconceptions
- What TDD **is not**
- What changes when you write tests first?

- What is it?

  - Acceptance for business
  - Unit for developers

- Example workflow

## Presentation

Hi, I'm Alexandre Santos, full-stack developer at KI labs LX. Today I'm here to talk about how following a recommendation completely changed my development workflow.

A couple of weeks ago I finished 'Growing Object Oriented Software Guided by Tests', the book is amazing, couldn't recommend more.

Throughout the book the author have the challenge of building a real app, it's like you are pair programming with them while they do it. As you may have guessed, they do it using TDD.

## Cepticism

Wasn't this book a recommendation I got from Miguel, I would probably stop and think 'this is just one more TDD book', discarding all the knowledge with that common excuse that we've all used.

> TDD does not apply to my usecase

This is one of the misconceptions I want to dismiss in the following minutes.

Just for context purposes, I was that guy a month ago, I had read multiple TDD articles, heard great stuff about it, but it **never applied to my usecase**.

Spoiler alert: I've changed my mind, here's why. Bare with me for a while...

## Isn't it just writing the tests I already write, but at the beginning?

Let me say **no, complete no**. And I think this is the biggest misconception about TDD.

## Practices that support change

The authors found (and pretty much all of us in our daily lifes) that the sofware we write **will change**. So, in order to build a system that is able to grow, we have to copy with the _unanticipated changes_. The book identifies two things that are critical in order to do this, and I expect you to agree with me:

- We need tests to catch regression errors, so we can add new fixtures without breaking existing ones.

- We need to keep the code as simple as possible so it is easy to understand and modify.

You'd agree that if developers spend more time reading code that writing, we should optimize for that. Refactor should be a constant thing, to remove duplication and making sure the code clearly expresses what it does.

## Until now, everyone agrees, right?

What's the catch?

The catch is that few developers enjoy testing their code. In many development groups, writing automated tests is not seen as 'real' work compared to adding features, and boring as well. Most people even feel it's uninspiring.

Right?

## TDD turns this 'on its head'

Let me ask you a question... How many of you are interested in software design, in our the pieces fit together and how can certains patterns enable software to grow?

Ok...

What if I told you that writing the tests first is a design activity?

We use TDD to clarify what we want our code to do. Quoting Kent Beck

> I was finally able to separate logical from physical design. I'd always been told to do that but no one explained how"

Adding to this, the fact that you write the test first gives you faster feedback about the quality of your design ideas. You wanna fail as fast as you can. And making code testable drives towards making it cleaner and more modular.

# But... What am I going to test then? I don't know how it is built

... and you don't need to. That exactly the point.

## What TDD is not

- No, we're not writing **all the tests first**

## What writing and running tests bring us?

By writing tests:

- We clarify the acceptance criteria for the next piece of work so we don't get lost.

- Add and acceptable description to what the code does

- We're encouraged to write loosely coupled components so they can be tests in isolatio and combined together

- Add a regression suite for the feature

By running tests:

- Detect errors while context is fresh in our mind

- Lets us know when we've done enough, discouraging 'gold plating' and unnecessary features

## The golden rule of TDD

> Never write a new functionality without a failing test

![inner and outer feedback loops in tdd]()

The outer loop measures demonstrable progress, and as the test suite grows protects regression failures. Acceptance tests take a while to pass.

The inner loop supports the developers. The unit tests help us maintain the quality of the code and should pass soon after they've been written.

Recommendation: Test end-to-end

## Enough with the words... Let's code!

Imagine I want to build an app to keep track of my wine stock at home. It is a pretty simple one, I just want to have a list of wines where I can add stuff to.

We're going to use `react` and `jest` for this. If you wanna follow the code [here you have it]().

```js
it("shows the home page", () => {
  cy.visit("/")

  cy.contains(/Wine Stock/i).should("exist")
  cy.contains(/Available wines/i).should("exist")
  cy.contains("button", "Add new wine").should("exist")
})
```

We're writing tests for the outer loop, whenever this test passes, our first *unit of work* is finished.

Do you remember the `guided by tests`? Let's follow the guidance:

```js
// App.js

const App = () => (
  <div className="App">
    <header>Wine Stock</header>
  </div>
)

```

And that error disappeared

```js
const App = () => (
  <div className="App">
    <header>Wine Stock</header>
    <h2>Available wines</h2>
  </div>
);
```

One more...

```js
const App = () => (
  <div className="App">
    <header>Wine Stock</header>
    <main>
      <h2>Available wines</h2>
      <button>Add new wine</button>
    </main>
  </div>
);
```

Yeah! We're done. We never lost focus, we were guided by tests, we did not need to refresh our browser multiple times.

But this was too easy, right? That is not real world.

Let's add the `WineListPage` component and encapsulate this a little.

```js
import WineListPage from './WineListPage';
import { render } from '@testing-library/react';

it('should render', () => {
  const { getByText } = render(<WineListPage />);

  expect(getByText('Available wines')).toBeInTheDocument();
  expect(getByText('Add new wine')).toBeInTheDocument();
  expect(getByText('Wine name')).toBeInTheDocument();
  expect(getByText('Year')).toBeInTheDocument();
  expect(getByText('Region')).toBeInTheDocument();
})
```









---

---

---

# Let's get back to the book title 'guided by tests'

We all know those features where we've started, super motivated. We start to change the code, that refactor a bit, then change code, create new modules, everything is coming together but then we try to run it and it is **completely broken**.

We look at our `git diff` and we've changed 10 files, and now our code doesn't even run.

**We just lost focus**

That's where the **guided by tests** part comes in.
