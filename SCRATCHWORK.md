```jsx
import React, { useCallback, useState } from 'react'
import { useResource } from 'resourcery'
import RecipeResource from 'resources/Recipe'
import TextInput from 'components/TextInput'

const RecipePage = ({ recipeId }) => {
  const { resource: recipe, update } = useResource(RecipeResource)(recipeId)
  const [isSavingBody, setIsSavingBody] = useState(false)

  const handleUpdateBody = useCallback(
    newBody => {
      setIsSavingBody(true)
      return update(lastRecipe => ({
        ...lastRecipe,
        body: newBody,
      })).finally(() => {
        setIsSavingBody(false)
      })
    },
    [update, setIsSavingBody],
  )

  if (recipe === null) return 'Loading...'

  return (
    <div className="RecipePage">
      <h1 className="__title">{recipe.title}</h1>
      <img className="__image" src={recipe.image} />
      <div className="__intro">{recipe.overlongIntroductoryEssay}</div>
      <TextInput value={recipe.body} onSave={handleUpdateBody} />
      {isSavingBody && 'Saving...'}
    </div>
  )
}

export default RecipePage

const RecipePage = ({ recipeId }) => {
  const { resource: recipe, update } = useResource(RecipeResource)(recipeId)

  const handleUpdateBody = useCallback(
    newBody => {
      setIsSavingBody(true)
      return update(lastRecipe => ({
        ...lastRecipe,
        body: newBody,
      }))
    },
    [update, setIsSavingBody],
  )

  if (recipe === null) return 'Loading...'

  return (
    <div className="RecipePage">
      <h1 className="__title">{recipe.title}</h1>
      <img className="__image" src={recipe.image} />
    </div>
  )
}
```

recipe.update

recipe.title
// recipe.inspect
no - keep methods off properties

update(recipe)

components are functions called with a controlled signature

Component(props)

Resource(blah)

it's easy enough to update state locally.

The issue is, we can't just diff state every time it changes and spray requests out.

It needs to be somewhat imperative.

maybe everything that isn't declarative can be described as "offboard" for a time.

You're mapping intentions to requests to state changes

enter text
save text to state
execute instructions to save to server

every set of instructions executes async

start
resolve - check state
reject - check state

start(write state) -> resolve(write state)
--> break

within a component, I only ever want to call a method by name

recipe -> addIngredient (...args)

which means the caller needs to manage all of the state updates that follow.

addIngredients would be defined against the resource

describe.addIngredients(store => {

})

describe.addIngredients(instance => {

})

describe.addIngredients((instance, context) => {

})

addIngredients(newIngredients)

update(oldInstance => )

writeStore(oldStore)

what if new ingredients wants to read from the store.

also - are people expected to useResource at every level of their app? That seems kind of silly. Although it's nice to have access to these functions wherever.

CddDetails
onValueChange

ActionModal
onValueChange

It would be nice not to have to pass them down.

const {
resource,
methods
} = useResource(...)

Frankly, the read operation should be treated as altogether different from anything else. It has no effect.

Read vs set

state vs setstate(state => )

state vs dispatch ( action )
action -> function which handles shit

or action is function which handles shit

const [ resource, dispatch ] = useResource(Resource)(resourceId)
const [ resource, dispatch ] = Resource.use(id)

will that break hooks linting?

actually... I wonder if I even need hooks at some point. Like, can't I just store all this stuff on my own and use the information I'm getting at each render to decide what to return? I guess I lose the ability to push updates out at some point.

const [ resource, actions ] = useResource()

(imperatives? methods)

maybe that's more what I'm looking for. I don't want composition happening in the component, really. I just want important data passed down.

The nice thing about setState is that you know exactly what's happening with the value you return.

If I do something like action.addIngredient(recipe => ({ ... })) it's unclear what I actually need to return. I don't want to return the whole recipe sometimes, assuming the actual updater will need to figure out what changed.

I might be okay doing action.addIngredient(ingredient)... but then I'm taking control out of the user's hands.

Unless the definition of addIngredient looks like this:

```jsx
const addIngredient = newIngredient => recipe => {}
// it could take the whole store if it were in a context like this:
const Recipe = instance => ({
  addIngredient: newIngredient => ({
    ...instance,
    ingredients: [...instance.ingredients, newIngredient],
  }),
})

const RecipeResource = createResource('Recipe')(describe => {
  describe.inspect(recipeId =>
    axios.get(`https://myapi.co/v1/recipes/${recipeId}`),
  )
})

const RecipeInterface = createInterface('Recipe')(instance => ({
  inspect: store => axios.get(`https://myapi.co/v1/recipes/${instance.id}`),
}))

const RecipeInterface = createInterface('Recipe')((instance, store) => ({
  inspect: () => axios.get(`https://myapi.co/v1/recipes/${instance.id}`),
}))

const RecipeInterface = createInterface('Recipe')(({ instance, store }) => ({
  inspect: () => axios.get(`https://myapi.co/v1/recipes/${instance.id}`),
  addIngredient: newIngredient => ({
    ...instance,
    ingredients: [...instance.ingredients, newIngredient],
  }),
}))
```

What if I wanted to update a parent item in response to this? I'd want addIngredient to return the whole store. But that'd be cumbersome if I had to do it every time.

I could add some kind of parent/child idea, but that sounds like such a nightmare.

```js
class Recipe extends Resource {
  // ...
}
```

That was nice too, with just an update function. But that was based on a very model-centric view.

The update function (and actions in general) are really good for updating resource state in a structured way.

But there's a question about when you want those updates to leave the client.

A container component will generally manage a lot of that stuff.

I want one place to define
properties
actions
services

Well, it's more like

services

properties
actions

services -> inspect, index
services -> update, destroy, create

oh fuck. Creating is a whole other thing.

```js
const RecipeInterface = createInterface('Recipe')(
  ({ deliverInstance, deliverStore }) => ({
    inspect: () => axios.get(`https://myapi.co/v1/recipes/${instance.id}`),
    addIngredient: newIngredient =>
      deliverInstance(instance => ({
        ...instance,
        ingredients: [...instance.ingredients, newIngredient],
      })),
  }),
)
```

But what if I need the instance to deliver the store.

{
store,
location
// resources.recipe.12
}

Since actions kind of start at the top level and everything else is relevant only to one resource, can't I totally separate them?

```
resources/
  Recipe/
    index.js
      (how to read the resource)
    properties.js
    actions.js
    services.js
```

```js
// index.js

import { createResource } from 'resourcery'

const Recipe = createResource('Recipe')(({ recipeId }) =>
  axios.get(`https://myapi.co/v1/recipes/${recipeId}`),
)

export default Recipe

// actions.js

import Recipe from 'resources/Recipe'

export const addIngredient = Recipe.action(
  ({ newIngredient, recipeId }) => ({ getStore, dispatch }) => {
    // deliver immediate state update
    // deliver final state update
  },
)
// export const addIngredient = Recipe.completeAction() // an action type which actually syncs the store to the server without a need for a refetch
```

Imagine the complexities that come with updating parents in this way. Like - two update responses go out that will have competing results - say they both increment a count on the parent. Do we want to ensure they both follow all of their steps in call order?

What if I just take a step back, treat this all like one big json tree, and try to manage really abstract updating from afar.

Apollo does this pretty well, all of your data is just a graph. I think this is a fundamental difference in approach. You're supposed to be able to "ground" yourself on each resource. Each resource is a hub for actions and properties and predictable state updates.

Is that meaningful? If you understand your code, state updates are always predictable.

Recipe

vs

RecipeController
inspect
create
update
destroy

Apollo doesn't care about giving you state information in mutations. That does make things simpler.

inspect
create
INSTANCE -> mutations

(updaters?)

const {...} = Recipe.use({ id, ... })

// recipe use will call the fetcher with these arguments
const [resource, updaters] = Recipe.use({ id })

// how are errors reported?

if recipe === null, it's loading // or resourcery.loading
if recipe === resourcery.error, there's an error

```jsx
const RecipePage = ({ recipeId }) => {
  const [response, updaters] = Recipe.use({ id: recipeId })

  // Error
  // if (response instanceof Error) ...
  if (isError(response)) return 'Error!'

  // null
  // if (response === null) ...
  if (isLoading(response)) return 'Loading...'

  // if (response instanceof Recipe) ...
  // if (Recipe.is(response)) ...

  return <RecipeDisplay {...response} />
}
```

the resource should only be returned as the most current result of the most current outgoing result

```jsx
// const RecipePage = ({ recipeId }) => {
  const [response, updaters] = Recipe.use({ id: recipeId })

  const [response, updaters] = RecipeList.use(activeView)

  const [response, updaters] = Recipe.useOne({ id: recipeId })
  const [response, updaters] = Recipe.useMany(query)
  response = [
    Recipe,
    Recipe,
    ...
  ]

// if (isError(response)) return 'Error!'
// if (isLoading(response)) return 'Loading...'

// return
// }
```

make sure there's a Recipe.isLoaded() util.

```jsx
const RecipePage = ({ recipeId }) => {
  const [recipe, updaters] = Recipe.useOne({ id: recipeId })

  if (isError(recipe)) return 'Error!'
  if (isLoading(recipe)) return 'Loading...'

  return (
    <div>
      <div>{recipe.title}</div>
      <Checkbox
        label="Recipe is public."
        disabled={recipe.wasCreatedByCurrentUser && recipe.canEdit}
        value={recipe.isPublic}
        // onChange={updaters.toggleRecipeIsPublic}
        onChange={isPublic => updaters.setIsPublic(isPublic)}
      />
    </div>
  )
}

// this will totally break hooks linting
// useRecipe = Recipe.use

const RecipePage = ({ recipeId }) => {
  const [recipe, { toggleIsPublic }] = Recipe.use({ id: recipeId })
  // this means toggle is public needs to be the same in a single hook, but different between hooks
  // this also means triggering two renders when saving is done.
  const isSaving = useIsActionActive(toggleIsPublic)

  const handleToggleIsPublic = newIsPublic => {
    toggleIsPublic(newIsPublic)
  }

  if (isError(recipe)) return 'Error!'
  if (isLoading(recipe)) return 'Loading...'

  return (
    <div>
      <div>{recipe.title}</div>
      {isSaving && 'Saving...'}
      <Checkbox
        label="Recipe is public."
        disabled={recipe.wasCreatedByCurrentUser && recipe.canEdit}
        value={recipe.isPublic}
        onChange={handleToggleIsPublic}
      />
    </div>
  )
}
```

Apollo has a mutation component. And renders it with data based on the mutation state.

Updating the cache is separated.

What if returning null in the update cache instructions is the way to force a refetch? Assuming a component still exists that has a hook that needs the information, it could see that the thing was null, note that no active process is running to get the thing, and take that on itself.

---

is the use case where I want to show saving state in one component really important? Or - more specifically, the ui component that triggered the update.

solved above

---

If I want to solve this hooks linting thing, I could just export useRecipe by default, using the name of the resource. I'd have to check to make sure the provided name started with an uppercase letter.

There are definitely going to have to be a suite of warnings and behaviors that work one way in production and another in dev.

---

Kay, now we need to deal with actually running the updates.

I think the design decision is: imperative updates.

```js
const toggleIsPublic = () => ({ instance, writeStore }) => ({
  start: store => {
    // return value updates cache
    // cannot return undefined
  },
  resolve: store => {
    //
  },
  reject: store => {},
})
```

Doing this means you don't get optimistic updates for free.

Does that make sense? I mean you do want to tell the store what to write when.

Maybe you don't want any of this cache writing stuff to be "for free"

I do like that apollo separates the definition of the action, the spaces you can fire it from, its state, and how it influences the cache.

I need to support a use case where the user wants to conduct any number of async operations before finalizing the update.

I could also separate useRecipe from useRecipeAction

useResource useAction

const recipe = useRecipeResource({id})
const action = useRecipeAction({
updateCache,
saveResource,
})

that's not great for lists. and what do you do when the recipe is not a recipe?

You still should return the updaters.

Maybe actions should take ids when they need them.

const [recipe, { toggleIsPublic, create, destroy, destroyAll }] = Recipe.use({ id: recipeId })

So actions don't just target a particular recipe?

const recipe = Recipe.useResource({ id: recipeId })
const { toggleIsPublic, create, destroy, destroyAll } = Recipe.useActions()

```jsx
const RecipePage = ({ recipeId }) => {
  const recipe = Recipe.useResource({ id: recipeId })
  const { toggleIsPublic, create, destroy, destroyAll } = Recipe.useActions()
  // this means toggle is public needs to be the same in a single hook, but different between hooks
  // this also means triggering two renders when saving is done.
  const { isActive: isSaving, error } = useActionState(toggleIsPublic)

  const handleToggleIsPublic = useCallback(
    newIsPublic => {
      toggleIsPublic({ newIsPublic, recipeId })
    },
    [toggleIsPublic, recipeId],
  )

  if (isError(recipe)) return 'Error!'
  if (isLoading(recipe)) return 'Loading...'

  return (
    <div>
      <div>{recipe.title}</div>
      {isSaving && 'Saving...'}
      <Checkbox
        label="Recipe is public."
        disabled={recipe.wasCreatedByCurrentUser && recipe.canEdit}
        value={recipe.isPublic}
        onChange={handleToggleIsPublic}
      />
    </div>
  )
}
```

```js
const toggleIsPublic = ({ recipeId }) => async ({
  deliverStore,
  deliverResource,
}) => {
  deliverResource()
}
```

update({
resource type,
resource id,
changes/write changes
})

```js
const { result, called, error } = useQuery({ query })
const { action, loading, error, called } = useMutation({ mutation })
```

I want get and set to be stuck to individual resources, though.

```jsx
const RecipePage = ({ recipeId }) => {
  const recipe = Recipe.useResource({ id: recipeId })
  const { toggleIsPublic, create, destroy, destroyAll } = Recipe.useActions()

  if (isError(recipe)) return 'Error!'
  if (isLoading(recipe)) return 'Loading...'

  return (
    <div>
      <div>{recipe.title}</div>
      <Checkbox
        label="Recipe is public."
        disabled={recipe.wasCreatedByCurrentUser && recipe.canEdit}
        value={recipe.isPublic}
        onChange={handleToggleIsPublic}
      />
    </div>
  )
}

const toggleIsPublic = ({ recipeId }) => store => {
  // but then the user has to manage all of the running processes.
}

const toggleIsPublic = createAction({
  // called immediately, sync, reverted on failure
  updateStore: ({ recipeId }) => store => ({
    ...store,
    recipes: {},
  }),
  // called immediately, async, can return new state/have effects
  saveResource: ({ recipeId }) => store => {},
})

// the above isn't a great api.

// apollo's isn't that great either, to be frank. they take a mutation and an update prop. I basically want to return twice.

const toggleIsPublic = createMutation({
  service: ({ recipeId }) => store => ({}),
  optimistic: ({ recipeId }) => store => ({}),
})

function* () {
  yield optimistic
  yield Promise.resolve(service) // until the promise resolves, the store needs to report itself as out of date? Or does the user need to report what's out of date? If we know something in the client wasn't read directly from the server and isn't saved to the server yet, that should matter, no?
}

// the generator would be nice if I wanted to return more than twice. Is that something I want to do?

update loan checklist item,
update loan,
update blah...

// it would make it easier to split complicated operations up into multiple files.

// but no one likes that API.

const toggleIsPublic = createMutation({
  service: ({ recipeId }) => store => ({}),
  optimistic: ({ recipeId }) => store => ({}),
})

// maybe optimistic updates should live in the component?
// should optimistic updates be optional? If I'm expecting a user to display a resource directly from a hook, it seems kind of essential that they are.

const toggleIsPublic = createMutation({
  update: ({ recipeId }) => store => ({}),
  optimisticUpdate: ({ recipeId }) => store => ({}),
})

// this doesn't do a great job showing that one of these methods should be a promise, the other sync.

const toggleIsPublic = createMutation(optimistic)(update)

const toggleIsPublic = createMutation({
  // by design, this is optional - maybe separate "isOptimistic" from "updateStore"
  // although that makes it seem like you can't update the store twice, which you can.
  service: () =>  (),
  onStart: () => (),
  onResolve: () => (),
  onReject: () => (),
})

```

Maybe there's a larger problem with this "update the store twice" model. I know, under the hood here, that this is an issue. If you update the store async - _literally anything can have happened in the meantime_.

If I update a recipe, that recipe could have been deleted when the request comes back. Do I want to add checks to every single response? Will the user have to add checks? If they can update the whole store, I guess they will.

Is there a better way of expressing a protracted process like this? Or are there a set of principles I can adhere to that guarantee some element of state looks the same before and after an update.

If this library is encouraging users to ground themselves on the idea of a resource and fall back to updating the whole state, maybe there is some middle ground here.

createMutation vs createStoreMutation?

Or is there a good way to indicate what parts of the store need to be in place for your response to work?

I think this is too fuzzy for the time being, I'll come back to it later.

For now. I'll just name the mutation actions in a way that makes things clear.

```js
const toggleIsPublic = createMutation({
  mutate: () =>  (),
  updateStoreBeforeMutate: () =>  (),
})
```

Oh shit, I could almost treat these like lifecycle methods.

```jsx
const toggleIsPublic = createMutation({
  mutate: (args) => store=>  ({...store}),
  updateStoreBeforeMutate: (args) => store=> ({...store}),
})

class ToggleIsPublic extends Mutation {
  componentDidMount -> updateStoreBeforeMutate
  componentWillUnmount -> updateStoreAfterMutate
  render -> mutate
}

// eh, that's not so great.

```

And there is still a question about handling lists. As far as the user is concerned, lists should only exist at the hook level, and on a create action, there could be a case where a user would have to go through every goddamn list within the store and determine if it should be altered. At that point, this library is in no way better than redux.

Maybe a user should never be passed the whole store? If a mutation on one resource has a side-effect, they can handle that imperatively as well.

```js
const toggleIsPublic = createMutation({
  mutate: args => store =>
    sideEffect({ ...store }, RecipeList.updatePublicCount()),
  updateStoreBeforeMutate: args => store => ({ ...store }),
})
```

Now we're back to this topic of describing imperative processes over time in js.

Back to the list thing, maybe that should be a totally automated thing. All you do is say whether the list needs to be fetched again. Then the list can use the store to figure out if anything needs to change. React asks you to opt-in to a lot of updates, it seems like for this to be effective, you actually need to opt-out of a lot of them. That's not predictable.

I think the solution is to really break down how the store can be modified - we need pre-fab mutations, to a degree.

A resource can be fetched
A resource can have one of its properties changed
As a result of a property change, one resource can cause another resource's properties to change
A resource can be deleted directly
A resource can be deleted because its not being used
A resource can be created

(Don't thing about lists right now. It's just one resource for the time being.)

(Construct/Model) vs Resource vs View.

I want to abstract the fetching part. It's not a good practice to be hitting the server more often than you need to. That'll happen a lot if fetches are being re-triggered a bunch when they don't need to. I guess that's going to be more of a problem for searches.

read write
get set
see change
accept request

a resource is not a recipe, its a description of everything that a recipe can be and do.
Maybe it should be called a description. Or a construct. Eh, it's a description of how a recipe can be read and written, a model is a description of the qualities of a recipe.

Qualities/objects
potentiality/actuality

It's valuable to enumerate a recipe's qualities because we can evaluate whether the actuality of the object every violates its potentiality.

But this is redundant - if we can comprehensively describe its potentiality and use those descriptions to alter it - wait, that's the problem, sometimes _we_ alter it from our end, others _the object_ mutates by a cause separate from our control. What if we lock one of those down? In a declarative model, we're kind of relinquishing the idea that we can alter it from our end. It can have changed, and when it does we want to respond.

object => subject => object

That's a really tough transition to capture.

Can we call essential qualities objective and non-essential (i.e. state subjective)? I don't think that's quite right, that a recipe is in an updating state is subjective, but so are the qualities being reported by an optimistic update to the store.

It's so tempting to fall back to an imperative model - it's so much goddamn easier when you're describing something coming from the end user.

Actually - where does the end user fit into all of this?

In an input, based on their keystrokes, they are actually calling functions for us. Is it safe to think of them as the same as the client code?

What is rendered by the client is essentially a shell, what we think will be valuable and intelligible to the end user. We can describe that task as a collection of compartmentalized and specifically arranged functions, which are nearly agnostic to state. Nearly, because effects kind of confuse this. Now, each of these functions will behave differently based on how they have been in the past. I've always liked the idea that a component can "hook" into some kind of state shared by the whole app. I'm not sure how to think about a function having a local state based on where in the arrangement it's called.

So, being totally declarative would look like this:

objective => subjective

But if the user is interacting with functions which are based on subjective information, then there's going to be a problem allowing those interactions to modify objective values.

Unless we can safely convert between both with zero discrepancies. Actually, we only need to do this where modifications can occur. When we're delivering information, we only need to convert one way. Although, conceptually, it's really hard to track the cause of a user action - which can be caused by them reading something subjective.

I feel like there's a fractal model that works here. (agh, I want to use models, not graphs).

for any quality (an object can be a quality of another object), we have to describe a transformation to a subjective state and objective.

1558716889194 => May 24

Okay. There's a problem already. May 24 is not the same as 1558716889194.
It's the same as May 24 2019 9:54:00:00 AM PST. But there are cases where a user only needs to know that it's the 24th. And others where they want to know how many seconds ago something happened.

This is where it gets super fuzzy.

There's no way I'm going to ask people to enumerate all the reasons for applying some kind of filter to a piece of data to show it to a user.

But just for fun, what would that look like here?

Say this is a transaction in venmo. It'll kind of count back relative time until it reaches a certain point, then it'll show you day and month. I actually don't feel equipped to say why that is. I _feel_ like exposing finer detail when a transaction is more recent is kind of a design win - less actual text on the screen without saying May 24 2019 9:54:00 AM. And if you just show a count of seconds later on, it ends up being unintelligible. Plus you're showing a lot of characters. Is this an optimization or is this essential to the user experience? Hard to say.

But I'm thinking that there is a problem with saying this property in this recipe gets transformed to this, period. Because in different contexts, the same information could be transformed differently. You'd want to make that call at the component level.

But you would want to make sure it's the right "type" of information at the service level.

server -> app(service -> state -> component) -> user

user -> intent -> input -> (app -> server -> app) -> user

so - a "type" of information is valuable.

Timestamp => validate/transform (say, seconds to ms)

If the frontend is an island. Then it makes sense to affirm a match between what is expected and what is delivered. That means, past the point of delivery, we _know_ the shape everything is in.

The other big handoff is to the user. We maintain a sane relationship with them by doing a few things... usually just showing them the result of their action. With a date picker, we'll store the result as 1558716889194, but they may never be aware of this. Our whole job on the frontend is to show them the most appropriate encapsulation of the data they're interacting with. So there's another resolve/format moment here.

datum

fromServer <=> toServer

FE state

toUser <=> fromUser

Ideally, you don't have any rote formatting to do by the time a user is interacting with a button or input.

It should all be about making json visual, which is out of the scope of this project.

so it's back to

fromServer <=> toServer
FE state

which is certainly better.

But it is worth noting that there's a layer of "unknown" between what a user sees and does and the information coming into resourcery.

The path of a modification is - external trigger -> internal function -> store update -> request ... -> follow up store update

Now the store is in sync. Period.

That ... is exactly where the problem is.
