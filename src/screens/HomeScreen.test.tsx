import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';

test('renders timer and start button', () => {
  const { getByText } = render(<HomeScreen />);
  expect(getByText('No timer running')).toBeTruthy();
  expect(getByText('Start')).toBeTruthy();
});

test('starts timer on button press', () => {
  const { getByText } = render(<HomeScreen />);
  const startButton = getByText('Start');
  fireEvent.press(startButton);
  expect(getByText(/\d+d \d+h \d+m \d+s/)).toBeTruthy();
});