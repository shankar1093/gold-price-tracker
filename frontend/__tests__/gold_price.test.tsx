import request from 'supertest';
import { createMocks } from 'node-mocks-http'; // Add this import
import handler from '../src/pages/api/gold_price';
import { NextApiRequest, NextApiResponse } from 'next'; // Add this import

describe('Gold Price API', () => {
  it('should return adjusted gold prices', async () => {
    const { req, res } = createMocks<NextApiRequest>(); // Specify the type for createMocks
    await handler(req, res as unknown as NextApiResponse); // Cast to unknown first
    expect(res._getStatusCode()).toBe(200); // Check status code
    expect(res._getData()).toHaveProperty('gold22kt');
    expect(res._getData()).toHaveProperty('gold24kt');
    expect(res._getData()).toHaveProperty('gold22kt_raw');
    expect(res._getData()).toHaveProperty('gold24kt_raw');
    expect(res._getData()).toHaveProperty('date');
  });

  it('should handle errors gracefully', async () => {
    // Mock fetch to simulate an error
    global.fetch = jest.fn(() => Promise.reject('API is down'));

    const { req, res } = createMocks<NextApiRequest>(); // Specify the type for createMocks
    await handler(req, res); // Call the handler with mocks
    expect(res._getStatusCode()).toBe(500); // Check status code
    expect(res._getData()).toHaveProperty('error', 'Error fetching gold price data');
  });
});