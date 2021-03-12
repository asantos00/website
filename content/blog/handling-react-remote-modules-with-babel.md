---
title: Handling react remote modules with babel (wip)
description: 'WIP'
date: '2021-03-12'
published: false
---

As my friend and colleague David is sharing on his blogpost series, we're using Microfrontends to enable different products to be created under the same codebase.
This is an ongoing effort to give teams the capability to iterate faster, and have independent release cycles while sharing code and maintaining the User Experience. David is doing a great job documenting this whole process and architecture, and thus I'll not repeat myself here.

As part of this initiative, we created a shared library (which works as any other MFE) and only contains the components that are shared across products. All of this lives on a single repo, and we're using Webpack's Module Federation to define this clear interface between products.

Here's what we need to do when we load a component that belongs to the **shared** library. This is what we'll refer to as a "remote component" throughout the rest of the article.

- Import it using the ES6 `import` function - `import('shared/components/Button')`
- Wraps it in a React.lazy `const Button = React.lazy(() => import('shared/components/Button'))`

That would result in something like the following:

```js
import React from "react";

const Button = React.lazy(() => import("shared/components/Button"));

const HomePage = () => {
  return <Button />;
};
```

Then, when this `Button` component is used, it will be fetched from the remote source, and rendered to the page. This makes it possible for webpack to code-split our codebase, only downloading the Button when the user needs it.

However, and even thus it works, we though it would be too much of a burden for developers to do. They shouldn't have to care if the component lives in a remote source or not, nor they have to remember of wrapping it in a React.lazy call. All of this would make it very error prone, and at the same time would get our codebase full of `React.lazy` calls.

That was when we started to think that _this might have been solved_. Our research lead us to believe that this specific problem with remote components wasn't solved. However, our problem wasn't specific to remote components, it was mainly an imports/code transformation problem.

Put shortly, our problem was that we wanted to import components like this

```js
import Button from "shared/components/Button";
```

But they should be acting as if we had written this:

```js
const Button = React.lazy(() => import("shared/components/Button"));
```

We weren't seeing light at the end of the tunnel, but at least we knew which direction to walk.

It seemed to us like this would be a `babel` type of problem. We wanted to interpret the code and transform it. Abstract Syntax Trees, I'm looking at you :eyes:

As the project we're currently doing this was configured using webpack, our starting point was the [babel-loader](https://webpack.js.org/loaders/babel-loader/) documentation page. We understood that we needed to create a custom loader, and load in from webpack's configuration. Because the project uses TypeScript, we needed to register this babel loader to run after `ts-loader`.

This is how it looked on webpack configuration.

```js

const webpackConfig = {
  entry: [ /* entry files */],
  resolve: { /* resolve config */ },
  plugins: [/* plugins import */ ],
  module: {
    rules: [
      {
        test: /\.(tsx?)?$/,
        include: [ path.resolve('src'), ],
        use: [
          {
            loader: require.resolve('./loader.js'),
          },
          {
            loader: 'ts-loader',
          },
        ],
        exclude: /node_modules/,
      },
  },
  // cut for brevity
};
```

We used `require.resolve` to load our `loader.js` file that was on the same folder as this configuration.

From there, our adventure writing a babel plugin to navigate and modify the AST started. [AST Explorer]() was of great use in this step, we used it to develop and debug the script we were writing.

Just doing a small recap, we wanted to do the following transformation:

This:

```js
import Button from "shared/components/Button";
```

To this

```js
const Button = React.lazy(() => import("shared/components/Button"));
```

By adding the initial code on [AST Explorer], we could already see the AST of it, we created a custom babel loader, opened [babel-handbook], and here we go:

This was our initial code.

```js

module.exports = function(babel) {
  const {types: t} = babel;

  function moduleFederationReactImportAliases(_, ...options) {
    return {
      visitor: {
        }
      },
    };
  }

  return {
    config(cfg) {
      return {
        ...cfg.options,
        plugins: [
          ...(cfg.options.plugins || []),
          moduleFederationReactImportAliases
        ],
      };
    },

    result(result) {
      return {
        ...result,
        code: result.code
      };
    },
  };
};
```

We knew that babel-loaders needed to use the `babel-config` `custom` function with a callback, and that they would need to register themselves as a plugin in the global configuration.

As we skimmed through babel-handbook, we also noted that we'd most likely use the visitor pattern, starting by _visiting_ the `ImportDeclarations`, since our initial code was one of them. We decided that we wanted every import starting with `shared` to be a target for this transformation, and thus we added the code to do that.

```js
  function moduleFederationReactImportAliases(_, ...options) {
    return {
      visitor: {
        ImportDeclaration: function (path, state) {
          if (path.node.source.value.startsWith('sharedcomps/')) {
```

From here it was a matter of replacing the import statement code with the `React.lazy` code. Our initial tries led to something that's not very readable, but that opens many possibilities: 

We generated all the `const Button = React.lazy(() => import('...')); ` declaration using the babel types. It resulted in something like this:

```js
function moduleFederationReactImportAliases(_, ...options) {
  return {
    visitor: {
      const componentPath = path.node.source.value;

      const newDeclaration = t.variableDeclaration(“const”, [
        t.variableDeclarator(
          t.identifier(name),
          t.callExpression(
            t.memberExpression(t.identifier(“React”), t.identifier(“lazy”)),
            [
              t.arrowFunctionExpression(
                [],
                t.callExpression(t.import(), [t.stringLiteral(componentPath)])
              )
            ]
          )
        )
      ])
    }
  },
};
```

And this actually worked, it was doing the transformation we wanted. But we weren't very comfortable on how difficult it was to read, and we found out a new way that looked much more readable:

```js
function moduleFederationReactImportAliases() {
  return {
    visitor: {
      const componentPath = path.node.source.value;

      if (path.node.source.value.startsWith('sharedcomps')) {
        const componentPath = path.node.source.value;
        const exportName = path.node.specifiers[0].local.name;

        const transformed = babel.template.statement.ast`const ${exportName} = React.lazy(() => import('${componentPath}'))`;

        path.insertAfter(transformed);
      }
    }
  },
};
```

This fits our goal, it was grabbing the correct import declarations, and replacing it with the new one that included the remote modules. 

There was still a small problem. With the above logic, anything that was imported from this _remote components_ was being transformed into this `React.lazy` imports.

What would happen if, together with the component `Button`, we imported a type, as in the following example:

```js
import Button, { ButtonProps } from "shared/components/Button";
```

As you're probably expecting, this would be transformed to:

```js
const Button = React.lazy(() => import("shared/components/Button"));
```

And we would loose the `ButtonProps` import, and that was wrong. We had to make a few changes so that we would only add the _dynamic import_ to the object that was being exported by default in the module. And this is how the final code looked like.

```js
function moduleFederationReactImportAliases(_, ...options) {
  return {
    visitor: {
      ImportDeclaration: function (path, state) {
        // console.log('opts', state)
        if (path.node.source.value.includes('sharedcomps/Button')) {
          const componentPath = path.node.source.value;
          const defaultExportName = path.node.specifiers.find((spec) => spec.type === "ImportDefaultSpecifier").local.name;
          const specWithoutDefault = path.node.specifiers.filter((spec) => spec.type !== "ImportDefaultSpecifier");
          path.node.specifiers = specWithoutDefault;

          const transformed = babel.template.statement.ast`const ${defaultExportName} = React.lazy(() => import('${componentPath}'))`;
          path.insertAfter(transformed);

          return
        }
      }
    },
  };
}
```

The above code finds the `ImportDefaultSpecifier` and modifies the initial import declaration so that it keeps all except the default. Then it adds the code to do the dynamic import, together with `React.lazy`.

This completely solved our problem, enabling developers to seamlessly import shared components in their code, allowing the underlying infrastructure to take care of how the code was loaded and imported for them. That was the experience we wanted.

We believe that, even though the loader's code might not be too easy to understand, it is a much simpler experience for whoever is using the `shared` library that you can directly import it.

It was also a very nice learning opportunity, navigating in the world of babel plugins and AST manipulation.

TODO: conclusion & fixing bugs




