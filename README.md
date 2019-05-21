# @scriptless/resourcery

<img src="https://siteless.co/assets/image/5710239819104256" width="600" />

[![npm](https://img.shields.io/npm/dt/@scriptless/resourcery.svg?style=flat-square)](https://www.npmjs.com/package/@scriptless/resourcery)
[![npm](https://img.shields.io/npm/v/@scriptless/resourcery.svg?style=flat-square)](https://www.npmjs.com/package/@scriptless/resourcery)

A React library for magical REST server integration.

## Motivation

I'm just really tired of writing and re-writing code that manages CRUD operations, optimistic updates, socket integration, error reporting, and all the other common concerns that show up when you're trying to get your React app to talk to a REST server.

I've tried to identify and codify common elements between implementations, and write them one last time in an easy-to-use interface.

This system comes with one pitfall: you have to learn and buy into an opinionated, multifaceted API. But once you do, you'll find a lot of toil taken out of your development experience. If I've done my job correctly, you'll also benefit from the clear language resourcery uses to describe the concepts which underlie this topic.

This library will never get in your way. Whenever you want to configure more or exert more control, there's a way.

## Getting Started

You'll need two things to get started: a React app and a REST server.

Install the library with `npm install @scriptless/resourcery`.

Let's say you're building an app that lets people manage recipes. We're going to start by building a page for interacting with a single recipe.

First, we're going to describe a recipe as a "resource".

```js
// resources/Recipe.js
import axios from 'axios'
import { createResource } from 'resourcery'

const RecipeResource = createResource('Recipe')(describe => {
  describe.inspect(recipeId =>
    axios.get(`https://myapi.co/v1/recipes/${recipeId}`)
  )

  describe.save(({ recipeId, changes }) =>
    axios.put(`https://myapi.co/v1/recipes/${recipeId}`, changes)
  )
})

export default RecipeResource
```

Now, resourcery knows how to inspect (read) and save changes to (update) a recipe.

> Check out the model reference section to see all the things you can tell resourcery about a recipe.

Next, we'll give resourcery the ability to share information with components in our app.

```jsx
// index.js
import React from 'react'
import ReactDOM from 'react-dom'
import { ResourceProvider } from 'resourcery'
// ...

const App = <ResourceProvider>// ...</ResourceProvider>
const MOUNT_NODE = document.getElementById('root')

ReactDOM.render(<App />, MOUNT_NODE)
```

Now, we'll use resourcery to get things done. Let's start by getting our recipe loaded up.

```jsx
// components/RecipePage.js
import React from 'react'
import { useResource } from 'resourcery'

import RecipeResource from 'resources/Recipe'
import RecipeResource from 'resources/Recipe'

const useRecipeResource = useResource(RecipeResource)

const RecipePage = ({ recipeId }) => {
  const { resource: recipe, isFetching } = useRecipeResource(recipeId)

  if (isFetching) return 'Loading...'

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

> Because of the configuration we did in our resource file, the `useResource` hook knows how to fetch all the information we need.

Now we'll wire in the update functionality. Let's say we want to be able to update the body (and we have a nice text input component that'll provide a save button).

```jsx
// components/RecipePage.js
import React, { useCallback } from 'react'
import { useResource } from 'resourcery'
import RecipeResource from 'resources/Recipe'
import TextInput from 'components/TextInput'

const useRecipeResource = useResource(RecipeResource)

const RecipePage = ({ recipeId }) => {
  const { resource: recipe, isFetching, save } = useRecipeResource(recipeId)

  const handleSaveBody = useCallback(
    newBody =>
      save(lastRecipe => ({
        ...lastRecipe,
        body: newBody
      })),
    [save]
  )

  if (isFetching) return 'Loading...'

  return (
    <div className="RecipePage">
      <h1 className="__title">{recipe.title}</h1>
      <img className="__image" src={recipe.image} />
      <div className="__intro">{recipe.overlongIntroductoryEssay}</div>
      <TextInput value={recipe.body} onSave={handleSaveBody} />
    </div>
  )
}

export default RecipePage
```

That's a good start isn't it? I should note that at this point we already have optimistic updates wired in, and a guarantee that any other component `useResource`-ing this resource will have the updated version.

## Reference
