---
title: Mistakes I've made writing react/redux applications
description: A compilation of mistakes and lessons from writing react/redux applications
date: "2018-10-24"
---

# Mistakes I've made writing react/redux applications

[Video](https://www.youtube.com/watch?v=0FPeP4abYp0) | [Slides](https://speakerdeck.com/asantos00/redux-applications)

I love [react](https://reactjs.org/), I've been writing applications with it since 2014. I've used lots of good and bad patterns, tools and approaches. Some of them make me proud, some make me feel ashamed.

Now I start to get that this is kind of a normal feeling, especially after seeing great developers like Ryan Dahl's and his talk called [10 Things I Regret About Node.js](https://www.youtube.com/watch?v=M3BM9TB-8yA). If you did not see it, yet, you're missing a great piece of knowledge.

Some of these errors principles, patterns and mistakes are not react/redux only, in my opinion, you can apply them to most of the software you write.

Getting back to the main topic, the good part of doing all those kinds of mistakes is that we definitely learn. Either by looking back and thinking or by stumbling with you and your code from a year ago.
The main objective of this is to share them so you don't waste time doing the same exact mistakes I did.

With no more to say, let's proceed to the mistakes.

## 1. _Componentize_ to soon - Create abstractions you don't need

We've all been there. Components and modules make our eyes shine, we like this utopic idea that one day building a feature will be just grabbing a bunch of components we built 6 months ago, wire them together and we're done. And I wouldn't say this does not happen, but I will say this is not how it normally happens.

Normally, deluded by this idea, we do things like this:

We have a button component

```html
<button className="{styles.button}">
  Buy me!
</button>
```

Isn't it so neat? We're going to use it in a lot of other places, let's abstract it.

```javascript
const Button = ({ children }) => (
  <button className={styles.button}>{children}</button>
)

render(<Button>Buy me!</Button>)
```

What if we want to format this text?

```html
<Button>
  <Text bold>Buy me!</Text>
</Button>
```

What if we want to format every single word?

```html
<Button>
  <Text bold>
    <Word onHover="{doStuff}">Buy</Word>
    <Word>me!</Word>
  </Text>
</Button>
```

You get the point, you needed this:

![screwdriver](./mistakes-react-redux/screwdriver.png)

And you ended up with this:

![swiss-knife](./mistakes-react-redux/swiss-knife.png)

## Lesson 1 - Do not predict the future. You are not gonna need it

Martin Fowler has a term for this [yagni](https://martinfowler.com/bliki/Yagni.html)

We often commit this mistake, we should only build what we need.

> Do the simplest thing that can possibly work

## 2. Just one more

We all know, it's always more 10 minutes in bed, more 40 minutes watching Netflix, one more drink.

![just one more](./mistakes-react-redux/just-one-more.jpeg)

The same happens with our components. We had this beautiful button with a pixel-perfect style:

```html
<Button>
  Hello!
</Button>
```

But we needed to invert the colors, and so we add a prop.

```html
<Button inverted>
  Hello!
</Button>
```

But we needed to make it wider, and we added a prop

```html
<Button wide>
  Hello!
</Button>
```

But we needed to make it have a special behavior while on header, and we added a prop

```html
<Button isHeader>
  Hello!
</Button>
```

Once again, you get the point. Now our beautiful button is everywhere, every time we need to touch that button's code, we pray and try to think about all the possible use cases so we don't end up breaking it. We shouldn't have to do this.

## Lesson 2 - Compose components - Design with the open-closed principle in mind

The open closed principle states

> Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification

What does this mean in this case?

Given the header example composition should have been used, something like the following:

```javascript
import Button from 'components/button';

const HeaderButton = (props) => (
    <Button {...props} onClick={() => {
        myNewBehaviour();
    }}
        Hello I'm an header button
    </Button>
)

```

Here the original button is extended, keeping the same API, without touching the original code, but using it and extending it. It is fully compliant to **the open-closed principle**, and thus much more easy to change in the future.

## 3. Badly designed redux store

Redux is heavily used, and even though it establishes some conventions, it does not do much to enforce them. You can design your store as you want, create the actions you want, etc. You have full freedom.

This is both a pro and a con, it's a tradeoff. What this means is that sometimes people will design their store badly, and this is not redux's fault.

Ever seen those components that have loads of logic on render? Or that info that you already have on the store but it is so hard to access it that you end up duplicating it? That's a **badly designed redux store**.

Imagine the following scenario: You fetch a list of _todos_ from an API, you wanna show them in a list. You store them, and you end up with a store that looks like this:

```javascript
const state = {
  todos: [
    { text: "Write a blogpost", id: 1 },
    { text: "Go to a meetup", id: 2 },
    { text: "Learn golang", id: 3 },
  ],
  selectedTodo: { text: "Write a blogpost", id: 1 },
}
```

And them you just `map` through the _todos_ to display them, it works right?

Huuuum... not really.

You've probably spotted some of the mistakes.

Starting by the redundancy of the `selectedTodo`. What will happen if you update the `selectedTodo`? Will you have to remember to go to the list and update it again? Or will you forget and get incoherent data?

What happens if you want to access the todo with the `id = 3`? Yes, we will have to iterate on the list, to try to find it. That's ok for now, but we know it is going to be a problem.

## Lesson 3.1 - Design your store like a database

Think about what queries are you going to do to your database? What are the indexes? Is it going to be updated? Or just read?

Store items by indexes, use references, it **is a database**.

```javascript
const state = {
  todos: {
    byId: {
      1: { text: "Write a blogpost", id: 1 },
      2: { text: "Go to a meetup", id: 2 },
      3: { text: "Learn golang", id: 3 },
    },
    selected: 1,
    allIds: [1, 2, 3],
    idsOrderedByText: [2, 3, 1],
  },
}
```

Can you see how easy it is to update _todo_ with the `id = 2` now? Or to change the selected one without having incoherent information?

You might be thinking, what if I want to display them in a list (remember that was the original requirement?). You can still do it like this:

```javascript
todos.allIds.map(id => todos.byId[id])
```

## 3.2 Coupling UI state with data

This is also connected to the principle above. Remember that time you fetched information from an API that you needed for the header? Imagine `users`, and at the time it made sense to store it on the `header` index? Something like the following:

```javascript
const state = {
  header: {
    userBar: {
      isOpen: false,
      users: [
        { first: "Alexandre", last: "Santos", id: 1 },
        { first: "Pedro", last: "Santos", id: 2 },
      ],
    },
  },
}
```

A couple of months later, when you were doing the footer and you needed users' first name, you ended up accessing it like `header.userBar.users[0]` on the footer component? Remember?

Doesn't sound good, does it? What happens if the developer that is touching the header changes the structure? Will he remember to go and fix the footer? Most likely not.

## Lesson 3.2 - UI and Entities should be stored separately

Not to talk about the need (or not) to store UI data on redux (most of the times you don't), if you store it, keep the UI data in one place, and keep your data (your entities) in a completely different place.

They shouldn't be coupled, you don't wanna mess the header loading state just because you changed the structure of a user, right?

```javascript
const state = {
  header: {
    userBar: {
      isOpen: false,
    },
  },
  users: {
    byId: {
      1: { first: "Alexandre", last: "Santos", id: 1 },
      2: { first: "Pedro", last: "Santos", id: 2 },
    },
    allIds: [1, 2],
  },
}
```

## 4. Components directly accessing the store

We all remember how magical it looked the first `mapStateToProps` we wrote, isn't it easy to just get the data you need from the store? It is so declarative!

It has it's advantages, for sure, but it also lets you do things like this:

```javascript
const mapStateToProps = state => ({
  user: state.users.list[0].name.first
})

```

Sounds familiar? If it is in one place, that's not so bad (a litte bit though). But what if this spreads all around your application? What if the user store changes its structure? Will you come back and change it everywhere it is used?

## Lesson 4 - Depend on abstractions

This is the **d** from [SOLID](https://www.engineerspock.com/2017/06/08/introduction-to-solid-principles/) that pplied to this specific context, means that you **shouldn't depend on concretions, but on abstractions**.

What does that mean? What if you used a **selector** to get the user's first name? Something like this:

```javascript
const getUserFirstName = (state) => state.users.list[0].name.first;
```

Store it near the reducer and whenever you change the store structure, you also update this.

Then your components can depend on the selector, and your `mapStateToProps` now looks a little bit cleaner:

```javascript
const mapStateToProps = state => ({
  user: getUserFirstName(state)
})

```

Your components depend now on an abstraction, making it much easier to change in future without breaking anything.

## Bonus - Lifting all the state up

We've probably seen that too, store every single piece of state in redux store.

This leads to a lot of store updates and a lot of data made globally that in reality is only being accessed locally. And why? Just because "we want to have redux advantages, we want to use reducers and actions".

Good news is that you can do that while using the components' local state. I [wrote a blog post about it](https://alexandrempsantos.com/reducing-the-local-state/), give it a read, I promise it will be useful!

## Conclusion

Those were the mistakes I made and I've seen doing while writing applications. There are definitely more but these were the ones I think are most impactful and the ones that can end up causing problems in maintaining an application.

Below is a TLDR of them, if you just skimming through this post or if you wanna take short notes.

❌ Create needless abstractions

✅ You are not gonna need it. Do not predict the future

❌ Always add _one more prop_

✅ Compose compose compose

❌ Badly designed redux store

✅ Think of your store like a database

❌ Store UI data and Entities together

✅ Completely decouple UI from data

❌ Components depend on store structure

✅ Depend on abstractions, selectors

❌ Lift all the state to redux

✅ Use reducer pattern locally, lift state when needed

What were the mistakes you made as a beginner? What mistakes are you still doing today? I would love to hear from you, reach out to me in any of the networks mentioned below.

Appreciate your time reading!
