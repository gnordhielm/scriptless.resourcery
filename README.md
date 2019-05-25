# @scriptless/resourcery

<img src="https://siteless.co/assets/image/5710239819104256" width="600" />

[![npm](https://img.shields.io/npm/dt/@scriptless/resourcery.svg?style=flat-square)](https://www.npmjs.com/package/@scriptless/resourcery)
[![npm](https://img.shields.io/npm/v/@scriptless/resourcery.svg?style=flat-square)](https://www.npmjs.com/package/@scriptless/resourcery)

A React library for magical REST server integration.

## Getting Started

You'll need two things to get started: a React app and a REST server.

Install the library with `npm install @scriptless/resourcery`.

Then, give `resourcery` the ability to share information with components in your app.

```jsx
// index.js

import React from 'react'
import ReactDOM from 'react-dom'
import { ResourceProvider } from '@scriptless/resourcery'
import Router from 'components/Router'

const App = (
  <ResourceProvider>
    <Router />
  </ResourceProvider>
)

const MOUNT_NODE = document.getElementById('root')

ReactDOM.render(<App />, MOUNT_NODE)
```

### Inspect

To begin, we need to to describe a new resource and tell `resourcery` how to "inspect" it.

```js
// resources/Recipe.js

import axios from 'axios'
import { createResource } from '@scriptless/resourcery'

const RecipeResource = createResource('Recipe')(describe => {
  describe.inspect(recipeId =>
    axios.get(`https://myapi.co/v1/recipes/${recipeId}`),
  )
})

export default RecipeResource
```

> `resourcery` makes a distinction between operations which read one vs. read many - it calls them "inspect" and "index", respectively.

---

Now, we'll make use of `resourcery` in a component, we do this with the `useResource` hook.

```jsx
// components/RecipePage.js

import React from 'react'
import { useResource } from '@scriptless/resourcery'
import RecipeResource from 'resources/Recipe'

const RecipePage = ({ recipeId }) => {
  const { resource: recipe } = useResource(RecipeResource)(recipeId)

  if (recipe === null) return 'Loading...'

  return (
    <div className="RecipePage">
      <h1 className="__title">{recipe.title}</h1>
      <img className="__image" src={recipe.image} />
      <div className="__intro">{recipe.overlongIntroductoryEssay}</div>
      <div className="__body">{recipe.body}</div>
    </div>
  )
}

export default RecipePage
```

> Provided a resource with an "inspect" function and an ID, `useResource` will take care of getting all the information we need.

### Update

Let's tell `resourcery` how to update our resource.

```js
// resources/Recipe.js

import axios from 'axios'
import { createResource } from '@scriptless/resourcery'

const RecipeResource = createResource('Recipe')(describe => {
  describe.inspect(recipeId =>
    axios.get(`https://myapi.co/v1/recipes/${recipeId}`),
  )
  describe.update(({ recipeId, changes }) =>
    axios.put(`https://myapi.co/v1/recipes/${recipeId}`, changes),
  )
})

export default RecipeResource
```

---

We can make use of the new "update" function via the hook we already have set up.

```jsx
// components/RecipePage.js

import React, { useCallback } from 'react'
import { useResource } from '@scriptless/resourcery'
import RecipeResource from 'resources/Recipe'
import TextInput from 'components/TextInput'

const RecipePage = ({ recipeId }) => {
  const { resource: recipe, update } = useResource(RecipeResource)(recipeId)

  const handleUpdateBody = useCallback(
    newBody =>
      update(lastRecipe => ({
        ...lastRecipe,
        body: newBody,
      })),
    [update],
  )

  if (recipe === null) return 'Loading...'

  return (
    <div className="RecipePage">
      <h1 className="__title">{recipe.title}</h1>
      <img className="__image" src={recipe.image} />
      <div className="__intro">{recipe.overlongIntroductoryEssay}</div>
      <TextInput value={recipe.body} onSave={handleUpdateBody} />
    </div>
  )
}

export default RecipePage
```

> At this point we already have optimistic updates wired in, and a guarantee that every other component `useResource`-ing this resource instance will be provided the updated version.

---

It might be desirable to tell the user when when the page is in the process of updating the resource. Because our update function must return a promise, we can take advantage of it.

```jsx
// components/RecipePage.js

import React, { useCallback, useState } from 'react'
import { useResource } from '@scriptless/resourcery'
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
```

> Keep in mind, this can lead to React warnings if the update resolves when `RecipePage` is no longer mounted. You may want to add a check in your resolve handlers following [this pattern](https://itnext.io/introduction-to-abortable-async-functions-for-react-with-hooks-768bc72c0a2b).

## Reference

## Motivation

I'm really tired of writing and re-writing code that manages CRUD operations, optimistic updates, Socket integration, error reporting, and all the other common concerns that show up when you're trying to get your React app to talk to a REST server.

I've tried to identify and codify common elements between implementations, and write them one last time in an easy-to-use interface.

This system comes with one pitfall: you have to learn and buy into an opinionated, multifaceted API. But once you do, you'll find a lot of toil taken out of your development experience. If I've done my job correctly, you'll also benefit from the clear language resourcery uses to describe the concepts which underlie this topic.

This library will never get in your way. Whenever you want to configure more or exert more control, there's a way.

## The Future

In its ideal form, this library would totally abstract the task of managing data in a react app, provide a crazy simple API which delivers no surprises, and be a comprehensive model of all the concepts that compose this problem. There are a number of ways in which the library in its current state falls short of this (the API is the primary sticking point, in my opinion). My hope is to get a clearer/more opinionated grasp on what this library is meant to do as it's used in production. With that feedback, each version will move toward that ideal form.
