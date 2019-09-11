---
title: "MirageJS to increase developer productivity"
description: "How to build a production ready frontend without a finished API"
date: "2019-10-10"
published: false
---

[Code](https://codesandbox.io/s/cool-mestorf-ybn1q)

A few months ago I wrote about how [mocked apis](https://alexandrempsantos.com/using-mocked-apis-to-increase-developer-productivity/) can help in the real world where we sometimes build frontends for APIs that are not ready yet.

Outside the ember world, there _was_ no _go to solution_ to develop frontends without a finished API.

Funny thing was that the [ember-cli-mirage](https://twitter.com/samselikoff/status/1131309704318193665) team was also thinking about something similar:

https://twitter.com/samselikoff/status/1131309704318193665

## They were starting to **extract the core** of `ember-cli-mirage` to `@miragejs/server`!

At the time I replied to this tweet and ended up having a few chats with Sam because he wanted to understand what were people's painpoints and how could Mirage help solve them.

I ended up helping them with the extraction to [@miragejs/server](https://github.com/miragejs/server), learned a lot and had a very nice opportunity to work with [Sam](https://twitter.com/samselikoff) and [Ryan](https://twitter.com/ryantotweets), they are awesome 🙏.

A few months latter `@miragejs/server` is in beta! `v0.1.25` is out, as well as the [new website](https://miragejs.com/)!

# The problem

Developing frontends without a finished API... That's a pain right? And why?

The [miragejs website](https://miragejs.com/) explains it better than I ever could:

## Have you ever worked on a React or Vue app that needed to talk to a backend API before it was ready?

If so, how’d you handle it?

Maybe you created some mock data directly in your app just to keep you moving:

```js
export function App() {
  let [users, setUsers] = useState([])

  useEffect(() => {
    // API not ready
    // fetch('/api/users')
    //   .then(response => response.json())
    //   .then(json => setUsers(json.data));

    // Use dummy data for now
    setUsers([
      { id: "1", name: "Luke" },
      { id: "2", name: "Leah" },
      { id: "3", name: "Anakin" },
    ])
  }, [])

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

Seems harmless enough.

Weeks later, the server’s ready and you wire up your app — but nothing works like it did during development.

Some screens flash with missing data, others are broken entirely, and worst of all, you have no idea how much of your code needs to be rewritten.

What went wrong?

## You ignored the network for too long.

Networking code isn't the kind of thing you can just tack onto the end of a sprint.

Think about everything that comes along with making network requests: loading and error states, fetching partial data, caching... not to mention the fact that asynchronous APIs like network requests add _tons_ of new states to each one of your app's existing user flows.

If you don't grapple with this crucial part of your application up front, you'll have to rewrite a ton of code when it comes time to deploy your app.

You're not doing yourself any favors by writing code that pretends the network doesn't exist. You're just poking holes in reality. And code that ignores reality isn't ready for production.

(source: https://miragejs.com/)

# Mocked APIs v2 - A much better version

I'll be showing how to do the same thing (and a little more) that I [wrote about](https://alexandrempsantos.com/using-mocked-apis-to-increase-developer-productivity/) last time, but now with the amazing `@miragejs/server`.

---

You have your app running, you wanna start mocking some endpoints. Let's imagine this is your _fetching code_

```js
// Somewhere in your react component

const [posts, setPosts] = useState([])

useEffect(() => {
  fetch("https://alexandrempsantos.com/api/v1/posts")
    .then(response => response.json())
    .then(json => setPosts(json))
}, [])
```

In order to start mocking this endpoint with `@miragejs/server`, here's what we'd do:

```js
import { Server } from "@miragejs/server"

let server = new Server()

server.urlPrefix = "https://alexandrempsantos.com/api"
server.namespace = "v1"

server.get("/posts", () => [
  {
    id: 1,
    title: "Mocking an API with axios",
    author: "asantos00",
    createdAt: 1557937282,
    body: "Lorem ipsum dolor sit amet, consectetur.",
  },
  {
    id: 2,
    title: "Forget axios interceptors. @miragejs/server",
    author: "asantos00",
    createdAt: 758851200,
    body: "Lorem ipsum dolor sit amet, consectetur.",
  },
])
```

With just this code Mirage will intercept your requests and start answering with the defined response.

## What if I want to do more?

I've just demonstrated the simplest use case where you just return a plain json. Let's make it a little bit smarter:

```js
import { Server } from "@miragejs/server"

let server = new Server({
  scenarios: {
    'default': ({ db }) => {
      db.loadData({
        posts: [
          {
            id: 1,
            title: "Mocking an API with axios",
            author: "asantos00",
            createdAt: 1557937282,
            body: "Lorem ipsum dolor sit amet, consectetur.",
          },
          {
            id: 2,
            title: "Forget axios interceptors. @miragejs/server",
            author: "asantos00",
            createdAt: 758851200,
            body: "Lorem ipsum dolor sit amet, consectetur.",
          },
        ],
      })
    },
  },
})

server.urlPrefix = "https://alexandrempsantos.com/api"
server.namespace = "v1"

server.get("/posts", schema => schema.db.posts)
```

By doing this, Mirage stores `posts` in a database that you can then access and modify later.

Talking about modifying stuff... Now that we have `posts` persisted, let's add the endpoint that enables to edit them:

```js
server.put("/posts/:id", (schema, request) => {
  schema.db.posts.update(request.params.id, {
    title: request.requestBody.title,
  })
})
```

After we do a `PUT /posts/1` with the body `{ "title": "test-edit" }`, this how our list of posts it's going to look:
```js
{
  id: 1,
  title: "test-edit",
  author: "asantos00",
  createdAt: 1557937282,
  body: "Lorem ipsum dolor sit amet, consectetur.",
}

```

By having the `posts` stored into a database, we can now manipulate them in the route handlers (ex: create and delete routes).

## Useful features

Mirage offers lots of features, since serializers to models (you can check in the docs). Besides those _complex_ ones, there are a couple of simple features that end up being very useful:

- *Custom responses* - Useful for things like developing error scenarios

```js
import { Response } from '@miragejs/server';

// ...

server.get("/posts", () => {
  return new Response(
    400,
    { "Content-Type": "application/json" },
    { message: "Title not valid" }
  );
});

```

- *API latency* - Useful to test how your app deals with loading

```js

const server = new Server();

server.timing = 2000 // all the apis

server.get('/posts', handlePosts, { timing: 3000 }) // only applies to single api

```

Another great use of `@miragejs/server` is testing.

You can start the server before the tests with the provided data and then assert that the endpoints where called and that the right data was mutated (that's material for another blogpost).

# Conclusion

Now that [mirage is out]() there is no more reason to be mocking data locally in your application or to spin up your whole infrastructure just to develop a single page.

Mirage enables you to develop your frontend with the same exact concerns you would have if you would be developing against a server, but it makes it easier to simulate states.

More important than that **you're not ignoring the network**.

Have you tried `@miragejs/server`? Are you interested? Hope this is useful.

I would love to hear what you have to say about both this blogpost, Mirage, or any questions you might have.

Reach out to me!
