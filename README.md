# URL Shortener Service

A RESTful API service built with Node.js, TypeScript, Express, and PostgreSQL that allows users to create short, trackable URLs.

## Features

- **URL Shortening**: Create short, clean URLs for sharing
- **URL Redirection**: Redirect users to original URLs when short links are accessed
- **Fraud Validation**: Built-in click validation to distinguish between genuine and suspicious clicks
- **Analytics**: Track and analyze click statistics with monthly breakdowns
- **Pagination**: Efficient data retrieval with pagination support

## Architecture

This application follows a clean architecture pattern with separation of concerns:

1. **MVC Pattern**:
   - **Models** (`src/models/`): Database operations and data access logic
   - **Views**: Represented by JSON responses from the API
   - **Controllers** (`src/controllers/`): Request handling and business logic

2. **Route Layer** (`src/routes/`): URL routing and endpoint definitions

3. **Utility Functions** (`src/utils/`): Helper functions for various operations

4. **Config Layer** (`src/config/`): Configuration for database connections

5. **Type Definitions** (`src/types/`): TypeScript interfaces for type safety

## Tech Stack

- **Backend**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Testing**: Jest and SuperTest

## Project Structure

```
.
├── src/
│   ├── config/         # Configuration files (database connection)
│   ├── controllers/    # Request handlers
│   ├── models/         # Database operations
│   ├── routes/         # API routes
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Utility functions
│   ├── __tests__/      # Test files
│   │   ├── unit/       # Unit tests
│   │   └── integration/# Integration tests
│   └── index.ts        # Application entry point
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
├── jest.config.js      # Testing configuration
└── README.md           # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd fiverr-ai-coding-test
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root with the following variables:
```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=interview
POSTGRES_PASSWORD=interview
POSTGRES_DB=interview_db
```

4. Initialize the database:
```bash
npm run db:init
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The server will be available at: `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Testing

The application includes comprehensive test coverage for both unit and integration tests. All tests are written using Jest and SuperTest.

### Running Tests

```bash
npm test
```

This will run all tests and generate a coverage report. The current test coverage is over 94% across the entire application.

### Test Structure

- **Unit Tests**: Test individual functions and components in isolation
  - `src/__tests__/unit/urlGenerator.test.ts`: Tests for URL generation and validation
  - `src/__tests__/unit/linkModel.test.ts`: Tests for database operations

- **Integration Tests**: Test API endpoints and their interactions
  - `src/__tests__/integration/linkController.test.ts`: Tests for API endpoints

## API Endpoints

### Create a Short Link

```
POST /links
```

Request body:
```json
{
  "url": "https://example.com"
}
```

Response:
```json
{
  "originalUrl": "https://example.com",
  "shortUrl": "http://localhost:3000/ABC123",
  "shortCode": "ABC123",
  "createdAt": "2023-05-23T14:56:32.123Z"
}
```

### Redirect to Original URL

```
GET /:shortCode
```

This endpoint redirects the user to the original URL and records the click with fraud validation.

### Get Analytics

```
GET /stats
```

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Number of results per page (default: 10, max: 100)

Response:
```json
{
  "data": [
    {
      "originalUrl": "https://example.com",
      "shortCode": "ABC123",
      "totalValidClicks": 10,
      "clicksByMonth": {
        "2023-01": 5,
        "2023-02": 5
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## Project Manifest

### What Works
- ✅ URL shortening with duplicate URL detection
- ✅ Short link redirection with fraud validation
- ✅ Click tracking and analytics
- ✅ Pagination for analytics endpoint
- ✅ Error handling and validation
- ✅ Unit and integration tests with high coverage (94%+)
- ✅ TypeScript type safety throughout the application

### What Could Be Improved
- ❌ No user authentication/authorization system
- ❌ No rate limiting for API requests
- ❌ No custom short code selection
- ❌ No click analytics beyond monthly aggregations (e.g., by device, location)
- ❌ No caching mechanism for frequently accessed links

### Database Justifications
- **PostgreSQL**: Chosen for its reliability, feature richness, and ability to handle complex queries needed for analytics
- **Schema Design**:
  - `links` table: Stores URL mapping with unique constraint on short codes
  - `clicks` table: Records all click events with validity flag for fraud detection
- **Connection Pooling**: Used for improved performance and connection management

### Design Trade-offs

1. **Short Code Generation**:
   - **Pro**: Simple and fast random generation
   - **Con**: No ability for users to choose custom codes
   - **Justification**: Simplicity and performance over customization

2. **Fraud Validation**:
   - **Pro**: Simple simulation with configurable threshold
   - **Con**: Not based on real traffic patterns or ML-based detection
   - **Justification**: Meets requirements with minimal complexity

3. **Click Storage**:
   - **Pro**: Records all clicks for comprehensive analytics
   - **Con**: May lead to large table size with high traffic
   - **Justification**: Analytics value outweighs storage concerns

4. **Synchronous Processing**:
   - **Pro**: Simple implementation and immediate consistency
   - **Con**: Higher latency for users during click tracking
   - **Justification**: Simplicity over performance optimization

### AI Prompts Used in Development
- Initial project setup and structure
- Implementation of URL shortening logic
- Design of database schema and query optimization
- Test planning and implementation
- Documentation generation

This approach allowed for rapid development while maintaining high quality standards and best practices in the code.