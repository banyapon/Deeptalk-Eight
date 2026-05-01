/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('./contexts/LiveAPIContext', () => ({
  LiveAPIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="live-api-provider">{children}</div>
  ),
}));

jest.mock('./components/side-panel/SidePanel', () => () => (
  <div>Mock Side Panel</div>
));

jest.mock('./components/altair/Altair', () => ({
  Altair: () => <div>Mock Altair</div>,
}));

jest.mock('./components/control-tray/ControlTray', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => (
    <div>
      <div>Mock Control Tray</div>
      {children}
    </div>
  ),
}));

import App from './App';

test('renders the desktop app shell', () => {
  render(<App />);

  expect(screen.getByTestId('live-api-provider')).toBeInTheDocument();
  expect(screen.getByText('Mock Side Panel')).toBeInTheDocument();
  expect(screen.getByText('Mock Altair')).toBeInTheDocument();
  expect(screen.getByText('Mock Control Tray')).toBeInTheDocument();
});
