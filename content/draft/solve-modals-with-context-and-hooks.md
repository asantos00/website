---
title: Solve modals with context and hooks
description: "Take advantage of React's new features to solve the hassle that popup are"
date: "2019-09-05"
---

React Context was launched a while ago, in version v16.3.0. From there, lots of questions and opinions aroused.

Some of them questioning when should Context be used, others asking if it replaces Redux. This latter one I have to admit bothers me a little bit. Redux itself doesn't share state across the tree, it's just a functional state container, `react-redux` `connect()` does it, and I think there's lot of misconceptions around that.

Anyways, not gonna spend more keystrokes this discussion. 5 minor versions later, `react` launched hooks, there was lots of excitment when [Dan Abramov]() [first spoke about it](https://www.youtube.com/watch?v=dpw9EHDh2bM) and v16.8.0 brought that to a _production level_ (and everyone started rewriting their apps with hooks).

I shared the enthusiasm, moderatedly, we didn't rewrite our apps. But now, every-time I see a usecase for it whenever I'm building a new component or fixing a bug, I'll use it without thinking twice. I actually commented a few days ago with a former colleague that hooks are one of the best abstractions I've seen in React.

Because of how easy it is to share functionality (no more copy-pasta methods in classes). I personally think of hooks as something like _componentized functionality_ ™️.

# The problem

Since the time of `jquery` that Modals were already a pain in the \*ss. Modals on top of modals, `z-index` problems, libraries with global selectors that broke others, it was though. React (and other libraries/frameworks) solved some of this problems, it's definitely getting easy to manage all of this.

This week we were faced with a consistency/code repetition problem, we were using a 3rd party library `material-ui` in one of our projects, and we were using its `Dialog` component, which is nice. The problem was that anybody that was using that component was doing it in a different way, resulting in incoherent `Dialogs` all around the application and, as metioned, lots of repeated code.

Second problem, most of the repeated code didn't have anything to do with the `Dialog` visuals, it was related to _when and how_ to open the modal, handling the multiple callbacks (`onConfirm`, `onCancel`, `onBackdropClick`), and worst, handling the context you need to call the callbacks. What do I mean you may ask?

This is how it was being handled before:

```javascript
class UserListPage extends Component {
  state = {
    userToRemove: null,
    isRemoveModalOpen: false,
  }

  // methods

  render() {
    const { isRemoveModalOpen, userToRemove } = this.state

    return (
      // Other logic
      <Dialog open={isRemoveModalOpen}>
        <DialogTitle>Remove user</DialogTitle>
        <DialogContent>
          Are you sure you wanna remove {userToRemove?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.deleteUser(userToRemove)}>Confirm</Button>
          <Button color="secondary">Cancel</Button>
        </DialogActions>
      </Dialog>
    )
  }
}
```

And by looking at this, it itches a little bit. I don't really like this _stateful_ approach of storing the `userToRemove` as I think it scatters the logic all around the component, enlarging the possibility of people deleting/touching code that deals with this without them knowing.

All of this and the big pain that this wasn't reusable, we could extract the component (tbh, that how is was, wrote it this way for demo purposes) but in the end, as it is _stateful_, it will always be coupled to a `class`.

We also didn't wanted to be copy pasting `Dialog` code whenever we want a new modal, we just wanted to delegate this to _someone else_. And yes, if you ask, this could have been handled with a parent component that had this dialog and logic. Even though it kind of fixes it, it would mean we would have to start passing callbacks to every component that wanted to open a modal.

It is probably a case for `Context`, we thought.

# Context

First thought we had was, let's create a `ModalStateContext`, share it between a top level `Dialog` component and everyone who wants to trigger it. And so we did.

```javascript
const ModalStateContext = React.createContext()
const ModalUpdaterContext = React.createContext()

function App() {
  const [modalOptions, setModalOptions] = useModalState({
    isOpen: false,
    modalProps: {}
  });

  return (
    <ModalUpdaterContext.Provider value={setModalOptions}>
      <ModalStateContext.Provider value={modalOptions}>
        <Modal />
        <UserListRoute>
        <ArticlesRoute>
        <ArticleDetailRoute>
      </ModalStateContext.Provider>
    </ModalUpdateContext.Provider>
  )
}

render(App, document.getElementById('#app'));
```

Later we noticed that we also have to create another `context` for the update function, in order not to be [creating objects in render](https://reactjs.org/docs/context.html#caveats) which leads to always re-rendering the components.

After a while we also created a custom hook: `useModalState`. It is just a hook we created to encapsulate the logic that sets the modal context, it basically sets a default value for `modalProps` when users are calling `setModalOptions({ isOpen: false })` so they dont need to send the empty `modalProps: {}`.

```javascript
const useModalState = initialState => {
  const [isOpen, setIsOpen] = useState(initialState.isOpen)
  const [modalProps, setModalProps] = useState(initialState.modalProps)

  const setModalState = ({ isOpen, modalProps = {} }) => {
    setIsOpen(isOpen)
    setModalProps(modalProps)
  }

  return [{ isOpen, modalProps }, setModalState]
}
```

And then, in our `Dialog` Component side, we would do something like:

```javascript
const Modal = () => {
  const {
    isOpen,
    modalProps: {
      context,
      title,
      message,
      onConfirm,
      onCancel,
      onBackdropClick,
    },
  } = useContext(ModalStateContext)

  return (
    <Dialog open={isOpen} onBackdropClick={e => onBackdropClick(e, context)}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContentText>{message}</DialogContentText>
      <DialogActions>
        <Button onClick={e => onConfirm(e, context)}>Confirm</Button>
        <Button color="secondary" onClick={e => onCancel(e, context)}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
```

Notice that the `Dialog` component only subscribes to the `ModalStateContext` as it does not need the updater context.

Also notice that the `context` variable is being sent to every callback.

Then, the next step is to use this `ModalUpdaterContext` we created to trigger the modal whenever it makes sense.

This is how our `Route` component looks like:

```javascript
const UserListRoute = () => {
  const [name, setName] = useState('Alexandre');
  const setModalOptions = useContext(ModalUpdaterContext);

  const modalProps = {
    context: name,
    title: "Remove service",
    message: `Do you wanna remove ${name}?`,
    onConfirm: (_, context) => alert(`User ${context} was deleted!`),
    onBackdropClick: () => setModalOptions({ isOpen: false }),
    onCancel: () => setModalOptions({ isOpen: false })
  };

  return (
    <main>
      <h2>My pretty route that might want to open a modal</h2>
      <input
        value={name}
        onChange={ev => setName(ev.target.value)}
      />
      <button onClick={() => setModalOptions({ isOpen: true, modalProps })}>
        Open modal!
      </button>
    </main>
  );
};
```
Notice the `context` parameter on the `onConfirm` callback. Without it, we could not access the item that triggered the callback, we're using closures at its best ot keep the context.

And now every Component that wants to trigger the modal only has to subscribe to this context. And call the `setModalOptions` function.
There's also an alternative syntax for this, that was to use the _render prop_ from the context itself but I find the `useContext` hook makes it a lot cleaner.

```javascript

<ModalUpdaterContext>
  {setModalOptions => (
    <button onClick={setModalOptions({ option1, option2, ... })}/>
    {/* Continues */}
  )}
</ModalUpdaterContext>
```


And in the end, if you wanna keep the logic away from your `App`, you can create a `WithModal` component like the following, that just provides the Modal contexts to its children

```javascript

const WithModal = ({ children }) => {
  const [modalOptions, setModalOptions] = useModalState({
    isOpen: false,
    modalProps: {}
  });

  return (
    <ModalUpdaterContext.Provider value={setModalOptions}>
      <ModalStateContext.Provider value={modalOptions}>
        <Modal />
        {children}
      </ModalStateContext.Provider>
    </ModalUpdaterContext.Provider>
  );
};

```

And refactor your `App` to do the following:


```javascript
function App() {
  return (
    <div className="App">
      <WithModal>
        <Route />
      </WithModal>
    </div>
  );
}
```

By having it in a separate Component, it also allows you to have multiple modals that are triggered by different contexts, making the possibilities unlimited!

# Conclusion

Hooks are awesome, I love what they enable you for such a simple syntax. The fact that it's so easy to create and share a custom hook makes them my _go-to solution_ to write *reusable* functionality.

This is one of the many use cases we found in our daily jobs, and made it easy to solve the problem again.

There is a site I use whenever I'm writing hooks and wanna see other examples, [useHooks](https://usehooks.com/). That is also good if you just wanna grab a simple hook you've used/written many times like `useLocalStorage` and don't want to add a project dependency for that.
