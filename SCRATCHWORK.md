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

And there is still a question about handling lists. As far as the user is concerned, lists should only exist at the hook level.
