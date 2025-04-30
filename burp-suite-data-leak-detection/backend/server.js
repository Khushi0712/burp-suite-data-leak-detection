const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Proxy middleware to capture and modify HTTP requests and responses dynamically
const url = require('url');

const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = 5000;

app.use(express.json());

// Improved proxy middleware to handle dynamic target URLs with proper path handling
app.use('/proxy', (req, res, next) => {
  console.log('Proxy request received:', req.method, req.originalUrl);
  let targetUrl = req.query.target;
  console.log('Target URL:', targetUrl);
  if (!targetUrl) {
    return res.status(400).json({ error: 'Target URL is required' });
  }
  // Ensure the targetUrl has a protocol, default to http if missing
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'http://' + targetUrl;
  }
  try {
    const parsedUrl = new URL(targetUrl);
    const proxy = createProxyMiddleware({
      target: parsedUrl.origin,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        // Rewrite path to the pathname and search of the target URL
        return parsedUrl.pathname + parsedUrl.search;
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${proxyReq.path}`);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error', details: err.message });
      }
    });
    proxy(req, res, next);
  } catch (error) {
    console.error('Invalid target URL:', targetUrl);
    res.status(400).json({ error: 'Invalid target URL' });
  }
});

// Other endpoints remain unchanged...

// Basic spider to crawl links from a given URL
app.post('/spider', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
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
    res.status(500).json({ error: error.message });
  }
});

// Basic scanner to detect simple vulnerabilities (e.g., presence of SQL keywords)
app.post('/scanner', async (req, res) => {
  const { url } = req.body;
  console.log('Scanner request URL:', url);
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  try {
    const response = await axios.get(url);
    if (typeof response.data !== 'string') {
      console.error('Scanner: Response data is not a string');
      return res.status(500).json({ error: 'Response data is not a string' });
    }
    const body = response.data.toLowerCase();
    const vulnerabilities = [];
    if (body.includes('sql')) {
      vulnerabilities.push('Potential SQL Injection vulnerability detected');
    }
    if (body.includes('<script>')) {
      vulnerabilities.push('Potential XSS vulnerability detected');
    }
    res.json({ vulnerabilities });
  } catch (error) {
    console.error('Scanner error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Repeater endpoint to send custom HTTP requests
app.post('/repeater', async (req, res) => {
  const { method, url, headers, body } = req.body;
  if (!method || !url) {
    return res.status(400).json({ error: 'Method and URL are required' });
  }
  try {
    const response = await axios({
      method,
      url,
      headers,
      data: body
    });
    res.json({
      status: response.status,
      headers: response.headers,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decoder endpoint for Base64 and URL encoding/decoding
app.post('/decoder', (req, res) => {
  const { action, encoding, data } = req.body;
  if (!action || !encoding || !data) {
    return res.status(400).json({ error: 'Action, encoding, and data are required' });
  }
  try {
    let result;
    if (encoding === 'base64') {
      if (action === 'encode') {
        result = Buffer.from(data).toString('base64');
      } else if (action === 'decode') {
        result = Buffer.from(data, 'base64').toString('utf-8');
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    } else if (encoding === 'url') {
      if (action === 'encode') {
        result = encodeURIComponent(data);
      } else if (action === 'decode') {
        result = decodeURIComponent(data);
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    } else {
      return res.status(400).json({ error: 'Unsupported encoding' });
    }
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Burp Suite Data Leak Detection backend running on port ${PORT}`);
});

// Basic spider to crawl links from a given URL
app.post('/spider', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
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
    res.status(500).json({ error: error.message });
  }
});

// Basic scanner to detect simple vulnerabilities (e.g., presence of SQL keywords)
app.post('/scanner', async (req, res) => {
  const { url } = req.body;
  console.log('Scanner request URL:', url);
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  try {
    const response = await axios.get(url);
    if (typeof response.data !== 'string') {
      console.error('Scanner: Response data is not a string');
      return res.status(500).json({ error: 'Response data is not a string' });
    }
    const body = response.data.toLowerCase();
    const vulnerabilities = [];
    if (body.includes('sql')) {
      vulnerabilities.push('Potential SQL Injection vulnerability detected');
    }
    if (body.includes('<script>')) {
      vulnerabilities.push('Potential XSS vulnerability detected');
    }
    res.json({ vulnerabilities });
  } catch (error) {
    console.error('Scanner error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Repeater endpoint to send custom HTTP requests
app.post('/repeater', async (req, res) => {
  const { method, url, headers, body } = req.body;
  if (!method || !url) {
    return res.status(400).json({ error: 'Method and URL are required' });
  }
  try {
    const response = await axios({
      method,
      url,
      headers,
      data: body
    });
    res.json({
      status: response.status,
      headers: response.headers,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decoder endpoint for Base64 and URL encoding/decoding
app.post('/decoder', (req, res) => {
  const { action, encoding, data } = req.body;
  if (!action || !encoding || !data) {
    return res.status(400).json({ error: 'Action, encoding, and data are required' });
  }
  try {
    let result;
    if (encoding === 'base64') {
      if (action === 'encode') {
        result = Buffer.from(data).toString('base64');
      } else if (action === 'decode') {
        result = Buffer.from(data, 'base64').toString('utf-8');
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    } else if (encoding === 'url') {
      if (action === 'encode') {
        result = encodeURIComponent(data);
      } else if (action === 'decode') {
        result = decodeURIComponent(data);
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    } else {
      return res.status(400).json({ error: 'Unsupported encoding' });
    }
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Burp Suite Data Leak Detection backend running on port ${PORT}`);
});
