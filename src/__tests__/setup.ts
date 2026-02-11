// Global test setup
beforeAll(() => {
  // Configure test environment
  process.env.NODE_ENV = 'test';

  // Increase timeout for all tests to accommodate simulated delays
  jest.setTimeout(10000);
});

// Global mocks setup
jest.mock('../config/database', () => {
  return {
    __esModule: true,
    default: {
      query: jest.fn()
    }
  };
});