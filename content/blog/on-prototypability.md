---
title: Prototype-ability - The tools' feature that is disregarded
description: Considering the ability to prototype as an important feature while choosing our tools.
date: "2020-05-04"
published: false
---

> Tech choices are expensive

This is a quote from an post I really like from [Dan McKinley](https://twitter.com/mcfunley) called [Choose boring technology](http://boringtechnology.club/).

Yes, tech choices are expensive, they can lead to a whole different amount of consequences, most of them unpredictable. As they are expensive, we put quite some effort on it, judging the pros and cons, asking questions and writing decision logs.

When facing a new problem to solve, a real problem, those that user's have we are faced with a lot of choices. It happens that sometimes we have to choose tools. Those tools can be languages, frameworks, libraries and so on. There are a lot of factors that are considered, there's a lot to write about that, but today I'll be focusing on one factor that I don't think has enough attention.

I'm talking about _prototypability_.

There are very good tools that are very hard to prototype with, and the opposite very good tools to write prototypes aren't realiable enough in production.

Some times, you just want to test something fast. To rapidly prototype it can be quick and dirty, we wanna test the traction and the usage of it and later decide on what to do.

There are languages that enable that better than others.

I believe that part of the javascript popularity is also due to that.

You can very easily spin up something quick, wire up a few packages you just downloaded from npm, and put it in front of users. If users like it, you can iterate on it (probably rewriting) and build something that is resilient but that has now a clear goal.

I've heard people saying they like TypeScript interoperability with Javascript because they can do the _quick and dirty_ in javascript to get it working, and rewrite and add types in TS later, and it made sense to me.

There are for sure other languages that enable this experience, but I'd like to contrast this with the golang language experience. It is a very realiable and fun language, I like how minimal it is and some conventions it follows.

However, it is very hard to prototype something with golang. If you have a json serializer and you just want to send one more field, you're screwed, it will not work. The same happens with Java, where you have to create a full class hierarchy to be able to read a file.

Again, this is not a problem with the tools itself, they are good, they provide other advantages like reliability, speed, and so on. Just a matter of using tools where they fit best.

When choosing tools that will live in a fast paced environment, with lots of testing and constant change, prototype-ability is an important factor to have in consideration. Sometimes as important as speed, community, documentation and all that major things.

It might even be because you are very specialized in one stack and you'd be a lot more productive keeping that same stack, or as Dan calls it [boring technology](http://boringtechnology.club/#30).

I don't think the _ease of prototype_ is considered enough. On a startup environment where everything is tested at a fast pace, this it to me **one of the big things to have in consideration**.

# Conclusion

_How easy it is to prototype with X_ might be a question worth asking depending on what you are building.

Don't take me wrong and don't go full on taking quick and dirty stuff to production. It is called a prototype because that is what it is. There is also some work to be done in expectaction management after you develop a _quick and dirty_ prototype in one week and then you need 4 times more to take it to a production-ready state later. Stakeholders from outside might look at your prototype and something that is _pretty much done_ while we all know that's not the state when we're talking about a prototype.

I wanted to expose my take on one of the topics I find more interesting, choosing technologies that solve user and business' problems, specially with a factor that I don't see considered enough.

Do you normally consider _prototype-ability_? I'm curious to hear more about that and all the other factors taken in consideration while trying to fit technologies with business problems, feel free to reach out to me, I want to hear your thoughts!
