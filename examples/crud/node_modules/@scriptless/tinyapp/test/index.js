import './FakeStyles.scss';
import React from 'react';
import App from './FakeApp';
import makeTinyapp from '../lib';

export default makeTinyapp({
  title: 'Fake App',
  render: () => <App />
});
