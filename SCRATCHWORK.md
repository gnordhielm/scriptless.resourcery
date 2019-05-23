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
import properties from './properties'
import actions from './actions'

const Recipe = createResource('Recipe')({
  actions,
  properties,
})

export default Recipe
```
