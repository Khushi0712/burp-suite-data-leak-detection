
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const cheerio = require('cheerio');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 5000;

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use(morgan('combined'));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Proxy middleware to capture and modify HTTP requests and responses
app.use('/proxy', (req, res, next) => {
  const target = req.query.target;
  if (!target) {
    return res.status(400).json({ error: 'Target query parameter is required' });
  }
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      '^/proxy': '',
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying request to: ${proxyReq.path}`);
      // You can modify the request here if needed
    }
  })(req, res, next);
});

// Basic spider to crawl links from a given URL
app.post('/spider', 
  body('url').isURL().withMessage('Valid URL is required'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { url } = req.body;
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const links = [];
      $('a').each((i, elem) => {
        const link = $(elem).attr('href');
        if (link) {
          links.push(link);
        }
      });
      res.json({ links });
    } catch (error) {
      next(error);
    }
  }
);

// Enhanced scanner to detect simple vulnerabilities (e.g., presence of SQL keywords, XSS, etc.)
app.post('/scanner', 
  body('url').notEmpty().withMessage('URL is required'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    let { url } = req.body;
    console.log('Received URL for scanning:', url);
    try {
      // Normalize URL to include scheme if missing
      try {
        url = url.trim();
        if (!/^https?:\/\//i.test(url)) {
          url = 'http://' + url;
          console.log('Normalized URL with http:// scheme:', url);
        }
        // Validate URL by creating a new URL object
        new URL(url);
        console.log('URL validation passed:', url);
      } catch (urlError) {
        console.error('URL validation error:', urlError.message, 'URL:', url);
        return res.status(400).json({ error: 'Invalid URL format' });
      }
      console.log('Scanner requesting URL:', url);
      let response;
      try {
        console.log('Making axios.get request with URL:', url);
        response = await axios.get(url);
        console.log('Axios request successful for URL:', url);
      } catch (axiosError) {
        console.error('Axios request error:', axiosError.message, 'URL:', url);
        return res.status(400).json({ error: 'Failed to fetch URL. Please check the URL format and availability.' });
      }
      let bodyContent = '';
      if (typeof response.data === 'string') {
        bodyContent = response.data.toLowerCase();
      } else if (typeof response.data === 'object') {
        bodyContent = JSON.stringify(response.data).toLowerCase();
      }
      const vulnerabilities = [];
      // Enhanced detection rules
      if (bodyContent.includes('select ') || bodyContent.includes('insert ') || bodyContent.includes('update ') || bodyContent.includes('delete ')) {
        vulnerabilities.push('Potential SQL Injection vulnerability detected');
      }
      if (bodyContent.includes('<script>') || bodyContent.includes('javascript:')) {
        vulnerabilities.push('Potential XSS vulnerability detected');
      }
      if (bodyContent.includes('onerror=') || bodyContent.includes('onload=')) {
        vulnerabilities.push('Potential XSS event handler vulnerability detected');
      }
      if (bodyContent.includes('eval(')) {
        vulnerabilities.push('Potential use of eval() detected, which can be dangerous');
      }
      res.json({ vulnerabilities });
    } catch (error) {
      console.error('Unexpected error in scanner endpoint:', error);
      if (error instanceof TypeError && error.message.includes('Invalid URL')) {
        return res.status(400).json({ error: 'Invalid URL format detected in scanner endpoint' });
      }
      return res.status(500).json({ error: 'Internal Server Error in scanner endpoint' });
    }
  }
);

// Repeater endpoint to send custom HTTP requests
app.post('/repeater', 
  body('method').notEmpty().withMessage('Method is required'),
  body('url').notEmpty().withMessage('URL is required'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      // Temporarily return validation errors in response for debugging
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    let { method, url, headers, body: requestBody } = req.body;
    try {
      // Normalize method to lowercase for axios
      method = method.toLowerCase();
      // If body is null or empty string, set to undefined to avoid axios errors
      if (requestBody === null || requestBody === '') {
        requestBody = undefined;
      }
      const response = await axios({
        method,
        url,
        headers,
        data: requestBody
      });
      res.json({
        status: response.status,
        headers: response.headers,
        data: response.data
      });
    } catch (error) {
      next(error);
    }
  }
);

// Decoder endpoint for Base64 and URL encoding/decoding
app.post('/decoder', 
  body('action').isIn(['encode', 'decode']).withMessage('Action must be encode or decode'),
  body('encoding').isIn(['base64', 'url']).withMessage('Encoding must be base64 or url'),
  body('data').isString().withMessage('Data is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { action, encoding, data } = req.body;
    try {
      let result;
      if (encoding === 'base64') {
        if (action === 'encode') {
          result = Buffer.from(data).toString('base64');
        } else if (action === 'decode') {
          result = Buffer.from(data, 'base64').toString('utf-8');
        }
      } else if (encoding === 'url') {
        if (action === 'encode') {
          result = encodeURIComponent(data);
        } else if (action === 'decode') {
          result = decodeURIComponent(data);
        }
      }
      res.json({ result });
    } catch (error) {
      next(error);
    }
  }
);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Burp Suite Data Leak Detection backend running on port ${PORT}`);
});
