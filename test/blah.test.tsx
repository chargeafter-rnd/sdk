import React from 'react';
import * as ReactDOM from 'react-dom';
import { Primary as Launcher } from '../stories/Button.stories';

describe('Thing', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Launcher apiKey="b5bbae03345db7e01f5462ea5ab978e33c4ae92c" />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
