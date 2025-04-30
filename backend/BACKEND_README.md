# Burp Suite Data Leak Detection - Backend Documentation

## Backend API Documentation

The backend server provides the following API endpoints:

### Proxy
- **Endpoint:** `/proxy`
- **Method:** GET
- **Query Parameters:**
  - `target` (required): The target URL to proxy requests to.
- **Description:** Proxies HTTP requests to the specified target URL.

### Spider
- **Endpoint:** `/spider`
- **Method:** POST
- **Body Parameters:**
  - `url` (string, required): The URL to crawl for links.
- **Description:** Crawls the given URL and returns all links found on the page.

### Scanner
- **Endpoint:** `/scanner`
- **Method:** POST
- **Body Parameters:**
  - `url` (string, required): The URL to scan for vulnerabilities.
- **Description:** Scans the page content for potential vulnerabilities like SQL Injection and XSS.

### Repeater
- **Endpoint:** `/repeater`
- **Method:** POST
- **Body Parameters:**
  - `method` (string, required): HTTP method to use.
  - `url` (string, required): The URL to send the request to.
  - `headers` (object, optional): HTTP headers to include.
  - `body` (any, optional): Request body data.
- **Description:** Sends custom HTTP requests and returns the response.

### Decoder
- **Endpoint:** `/decoder`
- **Method:** POST
- **Body Parameters:**
  - `action` (string, required): `encode` or `decode`.
  - `encoding` (string, required): `base64` or `url`.
  - `data` (string, required): The data to encode or decode.
- **Description:** Encodes or decodes data using Base64 or URL encoding.

## Running the Backend Server

1. Install dependencies:

```bash
cd backend
npm install
```

2. Start the server:

```bash
npm start
```

The server will run on port 5000.

## Running Tests

1. Install dev dependencies (if not already installed):

```bash
npm install
```

2. Run tests:

```bash
npm test
```

This will run the Jest test suite located in `backend/server.test.js`.
