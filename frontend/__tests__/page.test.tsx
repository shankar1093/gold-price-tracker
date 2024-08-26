import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import HomePage from '../src/app/page'; // Ensure the path is correct
import React from 'react'; // Add this import

describe('HomePage', () => {
  it('renders a heading', async () => {
    render(<HomePage />);

    const heading = await screen.findByRole('heading', { level: 1 });
    // ... additional assertions ...
  })
})