# E2E Tests for TaskMaster UI

This directory contains end-to-end tests for the TaskMaster UI application using Playwright.

## Overview

The E2E tests simulate real user interactions with the TaskMaster UI application, testing the complete project creation flow from the user interface through to the backend API and file system changes.

## Test Scenarios

### Project Creation Flow (`project-creation.spec.ts`)

1. **Full Project Creation Flow**
   - Creates a temporary test repository
   - Navigates to the TaskMaster UI
   - Adds the test repository to the application
   - Creates a new project using the UI
   - Verifies the project appears in the project list
   - Verifies the `.taskmaster` directory structure is created
   - Verifies the `tasks.json` file is created with correct structure

2. **Error Handling**
   - Tests validation errors for empty project names
   - Tests validation errors for invalid project name characters
   - Verifies error messages are displayed correctly

3. **Loading States**
   - Tests that loading spinners are shown during project creation
   - Tests that submit buttons are disabled during loading
   - Verifies proper UI feedback during async operations

## File Structure

```
e2e/
├── README.md                 # This file
├── project-creation.spec.ts  # Main E2E test file
└── helpers/
    └── test-utils.ts        # Helper utilities for tests
```

## Running the Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Running Tests

- **Run all E2E tests:**
  ```bash
  npm run test:e2e
  ```

- **Run tests with UI mode (interactive):**
  ```bash
  npm run test:e2e:ui
  ```

- **Run tests in headed mode (see browser):**
  ```bash
  npm run test:e2e:headed
  ```

- **Debug tests:**
  ```bash
  npm run test:e2e:debug
  ```

- **Run specific test file:**
  ```bash
  npx playwright test project-creation.spec.ts
  ```

### Test Configuration

The tests are configured in `playwright.config.ts` with:

- **Base URL:** `http://localhost:3000` (frontend)
- **Backend URL:** `http://localhost:3001` (backend)
- **Browsers:** Chromium, Firefox, WebKit
- **Automatic server startup:** Both frontend and backend are started automatically
- **Screenshots:** Captured on failure
- **Video:** Recorded on failure
- **Traces:** Collected on retry

## Test Data

The tests use temporary directories and mock data:

- **Test repositories:** Created in `os.tmpdir()` with unique names
- **Project names:** Generated with timestamps for uniqueness
- **Cleanup:** Automatic cleanup after each test

## Verification Points

The E2E tests verify the following:

### UI Interactions
- ✅ Repository connection form works
- ✅ Project creation modal opens
- ✅ Form validation works correctly
- ✅ Success/error messages are displayed
- ✅ Loading states are shown

### Backend Integration
- ✅ API calls are made correctly
- ✅ Response data is handled properly
- ✅ Error responses are handled gracefully

### File System Changes
- ✅ `.taskmaster` directory is created
- ✅ `tasks.json` file is created
- ✅ File structure is correct
- ✅ JSON content is valid

## Test Data Isolation

Each test run uses:
- Unique temporary directories
- Isolated Git repositories
- Separate test project names
- Automatic cleanup after completion

## Troubleshooting

### Common Issues

1. **Servers not starting:**
   - Ensure ports 3000 and 3001 are available
   - Check if backend compiles correctly
   - Verify npm scripts are working

2. **Test timeouts:**
   - Increase timeout values in test configuration
   - Check if backend is responding to API calls
   - Verify database initialization

3. **File system permissions:**
   - Ensure test has write permissions to temp directories
   - Check if Git operations work in test environment

### Debug Tips

1. **Use headed mode** to see browser interactions:
   ```bash
   npm run test:e2e:headed
   ```

2. **Use debug mode** to step through tests:
   ```bash
   npm run test:e2e:debug
   ```

3. **Check test reports** in `playwright-report/` directory

4. **Enable verbose logging** by setting `DEBUG=pw:*` environment variable

## Test Environment Requirements

- **Node.js:** v18 or higher
- **npm:** v8 or higher
- **Git:** Installed and available in PATH
- **TaskMaster CLI:** Available for backend initialization
- **File system:** Write permissions for temp directories

## Future Enhancements

Potential improvements for the E2E test suite:

1. **Additional test scenarios:**
   - Project deletion
   - Multiple repository management
   - Task board interactions
   - User authentication flows

2. **Test data management:**
   - Fixtures for common test scenarios
   - Database seeding for consistent test data
   - Mock API responses for edge cases

3. **Performance testing:**
   - Load testing for multiple projects
   - Stress testing for large task files
   - Memory usage validation

4. **Cross-browser testing:**
   - Mobile device testing
   - Different screen resolutions
   - Accessibility testing