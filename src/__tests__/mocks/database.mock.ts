// Mock for the database pool
export const mockPool = {
  query: jest.fn(),
};

// Reset all mocks before each test
export const resetMocks = () => {
  mockPool.query.mockReset();
};

// Helper to mock query responses
export const mockQueryResult = (data: any) => {
  return {
    rows: Array.isArray(data) ? data : [data],
    rowCount: Array.isArray(data) ? data.length : 1
  };
};