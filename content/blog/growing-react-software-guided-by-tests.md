---
title: TDD in the real world
description: "How I started using TDD for an amazing improve in DX and UX"
date: "2019-11-04"
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
- it looks like I'm selling it, but pretty much all the stuff software design books  is applied there
- you can sleep at night
- you don't loose sight of where you at


# ideas

- build a couple of screens with tdd
- build a todo list (shitty). Better to build a small app
- from reducer to view
- before tdd, after tdd?
- ask miguel/janos for their opinions

I recently finished reading [Growing Object Oriented Software, Guided by Tests](https://www.goodreads.com/book/show/4268826-growing-object-oriented-software-guided-by-tests). The book is one the best I've read, it takes a real world approach to problems while teaching and helping solve some daily life concerns, while explaining (based on the authors experience) how using TDD and having that mindset helps making writing/growing software easier. As you can probably guess, it changed my mindset. I read quite a lot about TDD in the past, did some on those small and useless projects, when it came to use it in a "more real" project I used that common misconception that the authors point out "this doesn't apply to my usecase". A couple of weeks after trying it, I can admit that I was completely wrong.

It was actually one of the author's quotes that made me question this. Throughout the book authors build an application that participates in auctions and based on some criteria, bids for items (of course trying to win them). The interesting thing here is to see how the program grows, what changed, what should be refactored now and what should stay "as is".

The book recurrently presents a checklist that was created on the first chapter. That checklist is created based on the requirements, the application use cases. Those represent the features that **have to be working** for the application to be ready to ship.

We all use checklists, but these have a special thing, it auto checks and unchecks itself while you're doing the task, because every checklist item represents one test, and that's the beauty of it.

I'll try to explain you a little bit how it influenced my workflow. The book examples are written in Java, I'll use javascript and react for this blog post.

## What do we want to build?

A small personal app to keep track of wine orders and payments from friends. The high level requirements are the following:

- Add/remove a bottle of wine
- Keep track of orders
- Create bottle orders for people
- Declare orders as paid
