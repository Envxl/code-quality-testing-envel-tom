import React from 'react';

import TailwindTest from './TailwindTest';
import { render } from '../testUtils';

test('renders a heading with Tailwind utility classes', () => {
    const view = render(<TailwindTest />);
    const heading = view.container.querySelector('h1');

    expect(heading.textContent).toBe('Tailwind OK');
    expect(heading.className).toBe('text-3xl font-bold text-blue-600');
    view.unmount();
});
