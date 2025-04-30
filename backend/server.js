const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 5000;

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

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
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  try {
    const response = await axios.get(url);
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
