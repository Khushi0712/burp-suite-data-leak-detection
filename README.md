# Burp Suite for Data Leak Detection

This project is a simplified web application simulating key features of Burp Suite for data leak detection and web security testing.

## Features

- **Proxy:** Capture and modify HTTP/S requests and responses.
- **Spider:** Crawl and map web applications by extracting links.
- **Scanner:** Detect simple security issues like potential SQL Injection and XSS.
- **Repeater:** Send custom HTTP requests manually.
- **Decoder:** Encode and decode data in Base64 and URL formats.

## Technology Stack

- Backend: Node.js with Express, Axios, http-proxy-middleware, Cheerio
- Frontend: React

## Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```
   cd burp-suite-data-leak-detection/backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the backend server:
   ```
   npm start
   ```
   The backend server will run on port 5000.

### Frontend

1. Navigate to the frontend directory:
   ```
   cd burp-suite-data-leak-detection/frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the React frontend:
   ```
   npm start
   ```
   The frontend will open in your default browser (usually at http://localhost:3000).

## Usage

Use the frontend UI to interact with the backend tools for proxying requests, spidering websites, scanning for vulnerabilities, sending custom requests, and encoding/decoding data.

## Notes

- This is a simplified educational project and not a full replacement for Burp Suite Professional.
- Use responsibly and only on websites you have permission to test.

## License

MIT License
