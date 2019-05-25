import React from 'react';
import ReactDom from 'react-dom';

export default config => {
  let render;
  let title;

  if (typeof config.render !== 'function')
    throw new Error('tinyapp: config.render must be a function.');

  render = config.render;

  if (!['undefined', 'string'].includes(typeof config.title))
    throw new Error('tinyapp: config.title must be a string or undefined.');

  title = config.title === undefined ? 'Tiny App' : config.title;

  document.title = title;
  const MOUNT_NODE = document.getElementById('mount-node');
  ReactDom.render(render(), MOUNT_NODE);

  // TODO
  //   if (module.hot) {
  //   }
};
