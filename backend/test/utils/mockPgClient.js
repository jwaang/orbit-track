// Mock PostgreSQL client for testing
class MockPgClient {
  constructor() {
    this.mockResponses = new Map();
    this.queryLog = [];
    this.shouldError = false;
    this.error = null;
  }

  // Store a mock response for a specific query
  setMockResponse(query, params, response) {
    const key = this._getKey(query, params);
    this.mockResponses.set(key, response);
  }

  // Set an error to be thrown on next query
  setError(error) {
    this.shouldError = true;
    this.error = error;
  }

  // Clear all mock responses and errors
  clearMocks() {
    this.mockResponses.clear();
    this.queryLog = [];
    this.shouldError = false;
    this.error = null;
  }

  // Get the query history
  getQueryLog() {
    return this.queryLog;
  }

  // Mock query method that matches pg.query signature
  async query(query, params = []) {
    if (this.shouldError) {
      this.shouldError = false;
      throw this.error || new Error('Mock database error');
    }

    this.queryLog.push({ query, params });
    const key = this._getKey(query, params);
    const mockResponse = this.mockResponses.get(key);

    if (mockResponse) {
      return {
        rows: Array.isArray(mockResponse) ? mockResponse : [mockResponse],
        rowCount: Array.isArray(mockResponse) ? mockResponse.length : 1
      };
    }

    return { rows: [], rowCount: 0 };
  }

  // Generate a unique key for storing mock responses
  _getKey(query, params) {
    return `${query}-${JSON.stringify(params)}`;
  }
}

// Create a mock client instance
const createMockPgClient = () => {
  return new MockPgClient();
};

// Create a mock database error
const createMockDbError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

export { MockPgClient, createMockPgClient, createMockDbError };