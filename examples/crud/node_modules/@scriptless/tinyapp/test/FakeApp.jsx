import React from 'react';
import FakeDependency from './FakeDependency.jsx';

const text = 'H   I   I';

class FakeApp extends React.Component {
  render() {
    return (
      <div>
        <h3 id="title">FakeApp {text}</h3>
        <FakeDependency text="look at this text" />
      </div>
    );
  }
}

export default FakeApp;
