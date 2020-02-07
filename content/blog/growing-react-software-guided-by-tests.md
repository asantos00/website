---
title: TDD in the real world
description: 'How I started using TDD for an amazing improve in DX and UX'
date: '2019-11-04'
published: false
---

- Started reading Growing Object Oriented Software, Guided by Tests. Amazing book, super real use case, you build a project through the book.
- Book helped understand the importance of TDD, how that could apply
- is not slower, the time you will **not** spend manually testing will make up for that
- helps in providing design hints
- works as a checklist
- shows you the way on what to do next
- helps you not to bikeshed
- yagni - you build only what is necessary
- started from the top (now we're here :joy:)
- api first / user first (inside out)
- you focus on business requirements
- you don't jump to the solution
- **incremental**
- it looks like I'm selling it, but pretty much all the stuff software design books is applied there
- you can sleep at night
- you don't loose sight of where you at

# ideas

- build a couple of screens with tdd
- build a todo list (shitty). Better to build a small app
- from reducer to view
- before tdd, after tdd?
- ask miguel/janos for their opinions

- Hi
- read a book
- who heard or tdd?
- how many do it?
- why? It never applies to our usecase:
- 2 things are needed to grow software
  - check
  - easy to change and update code. What does it need?
- tests. Why aren't there any?
  - tests are boring to write
  - developers don't like writing tests
  - in some companies testing is not even considered real work when compared to adding features
- isn't it the same thing if I write the tests afterwards?
- how comes I'm testing a feature that I don't know how it's built?
- I don't know where to start
- I don't know how it will look like
- what is this feature?

And this is, for me, where it changed. When you test first, testing becomes a design activity. You start asking questions and thinking about the answers. You answer them completely unbiased. You don't know how does the implementation looks like, and you don't need to.


I recently finished reading [Growing Object Oriented Software, Guided by Tests](https://www.goodreads.com/book/show/4268826-growing-object-oriented-software-guided-by-tests). The book is one the best I've read, it takes a real world approach to problems while teaching and helping solve some daily life concerns, while explaining (based on the authors experience) how using TDD and having that mindset helps make writing/growing software easier. As you can probably guess, it changed my mindset.

I'vr read quite a lot about TDD in the past, did some on those small and useless projects, when it came to use it in a 'more real' project I used that common misconception that the authors point out 'this doesn't apply to my usecase'. A couple of weeks after trying it, I can admit that I was completely wrong.

It was actually one of the author's quotes that made me question this. Throughout the book authors build an application that participates in auctions and based on some criteria, bids for items (trying to win them). The interesting thing here is to see how the program grows, what changed, what should be refactored now and what should stay 'as is'.

The book recurrently presents a checklist that was created on the first chapter. That checklist is created based on the requirements, the application use cases. Those represent the features that **have to be working** for the application to be ready to ship.

We all use checklists, but these have a special thing, it auto checks and unchecks itself while you're doing the task, because every checklist item represents one test, and that's the beauty of it.

I'll try to explain you a bit how it influenced my workflow. The book examples are written in Java, I'll use javascript, react and jest for this blog post.

## What do we want to build?

A small app to keep track of wine orders and payments from friends. The high level requirements are the following:

- Add/remove a bottle of wine
- Show the list of bottles for the current order
- Keep track of orders
- Create bottle orders for people
- Declare orders as paid

Payments are made offline, this just keeps track of it.

## Let's start

We don't know how we're going to build this, we didn't give it that much thought. But that's ok, we know what we want, let's start with that.

Following the book authors' recommendation, let's try to get the simplest meaningful test written.

If you wanna follow the code, [here you have it]()

```js
import App from './index'

it('lists', () => {
    const wrapper =
});
```

# requirements

- add available wines
- show available wines
- order wine for people
- declare order as paid

get the simplest meaningful test to pass

# food for thought

focus on writing the simplest/lighter test you can for whatever you wanna test (you don't want to create an e2e test for something you could have unit tested)

write the simplest piece of software that satisfies your requirement. Remember the `red > green > refactor`, we want to get to the green so we can refactor

building a feature

- create the simplest test to grant that the bare minimum works (can be integration or unit but most likely is integration)
- your small feature will be done when that test passes

example:

create a form to add wines to a table of wines (the big feature)

smaller features (tests to be written):

- wine X and Y should appear on the table with year and region

let's write the test:

Integration test that visits the page and asserts that wine X and Y are there together with region and year

**test will fail**

## we start writing the feature

- open the table page component (it has nothing)
- open the table page component test

### TablePage - write the test (unit)

- test it renders, has a title and a table

you write the test, it's failing. You go and implement the feature, done?

**implement the feature**

ok, now you want the wines to be shown, right?

- test that some wines should appear on the table, with name, year and region

**implement the feature**

isn't it ugly to not have a message when the table is empty? reflect that on tests

- test that by going to the page, an empty table message should appear

**implement the feature**

isn't your code a little bit messy? (messi image :joy:). It is, we got to the green, lets refactor.

One of the big advantages the authors talk about in the book, TDD will let you use your developers instincts to
detect where refactor is needed, it will take care of the *it's working?*  part.

Lets refactor our table to a `WinesTable` that does logic we don't wanna see here too often.

- create the folder > file
- let's then write your logic.............. kidding, we apply the same principle, write the test first

**test steps**

1. ok, import our component, it should render
2. sending wines in, it should render as much tr as there's wines
3. wines years, names and region should be presented

- every test is failing, amazing!

let's do an interesting thing: if what we have to do is the simplest implementation that works, let's do it the simplistic way.
We're copying the hardcoded version of the table in.

- what happened? some of our tests are passing? we did a great job, let's keep those on green while we implement the rest of the feature

- implement the logic to list wines with `.map` and etc (are the test still green? cool)

- all green! does it work? amazing!

**note:** without looking at your browser you've implemented a table that you're
confident enough that it works, aren't you? How many refreshes did it take? How many clicks? Exactly.

Remember our tests for the `TablePage`



**implement the feature**


passing? amazing

- test that by clicking on the `Add` button it should redirect to the `/add` page

**implement the feature**

- test that by filling up the fields and clicking on submit, a callback should be called

**implement the feature**

- test that after the wine creation is successful, it should redirect to the table


Are you confident that your page is working? Are you confident that is has what it needs to? Let's look at our checklist.
