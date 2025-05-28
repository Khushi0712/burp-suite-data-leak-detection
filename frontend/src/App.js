import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [proxyUrl, setProxyUrl] = useState('');
  const [proxyResponse, setProxyResponse] = useState('');

  const [spiderUrl, setSpiderUrl] = useState('');
  const [spiderLinks, setSpiderLinks] = useState([]);

  const [scannerUrl, setScannerUrl] = useState('');
  const [vulnerabilities, setVulnerabilities] = useState([]);

  const [repeaterRequest, setRepeaterRequest] = useState({
    method: 'GET',
    url: '',
    headers: '',
    body: ''
  });
  const [repeaterResponse, setRepeaterResponse] = useState(null);

  const [decoderInput, setDecoderInput] = useState({
    action: 'encode',
    encoding: 'base64',
    data: ''
  });
  const [decoderResult, setDecoderResult] = useState('');

  // Proxy request handler
  const handleProxy = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/proxy?target=${encodeURIComponent(proxyUrl)}`);
      setProxyResponse(response.data);
    } catch (error) {
      setProxyResponse(error.message);
    }
  };

  // Spider request handler
  const handleSpider = async () => {
    try {
      const response = await axios.post('http://localhost:5000/spider', { url: spiderUrl });
      setSpiderLinks(response.data.links);
    } catch (error) {
      setSpiderLinks([]);
      alert(error.message);
    }
  };

  // Scanner request handler
  const handleScanner = async () => {
    try {
      const response = await axios.post('http://localhost:5000/scanner', { url: scannerUrl });
      setVulnerabilities(response.data.vulnerabilities);
    } catch (error) {
      setVulnerabilities([]);
      alert(error.message);
    }
  };

  // Repeater request handler
  const handleRepeater = async () => {
    try {
      const headers = repeaterRequest.headers ? JSON.parse(repeaterRequest.headers) : {};
      let body = repeaterRequest.body;
      if (body === '' || body === 'null') {
        body = undefined;
      }
      const response = await axios.post('http://localhost:5000/repeater', {
        method: repeaterRequest.method,
        url: repeaterRequest.url,
        headers,
        body
      });
      setRepeaterResponse(response.data);
    } catch (error) {
      setRepeaterResponse({ error: error.message });
    }
  };

  // Decoder request handler
  const handleDecoder = async () => {
    try {
      const response = await axios.post('http://localhost:5000/decoder', decoderInput);
      setDecoderResult(response.data.result);
    } catch (error) {
      setDecoderResult(error.message);
    }
  };

  return (
    <div className="app-container">
      <h1>Burp Suite for Data Leak Detection</h1>

      <section className="tool-section">
        <h2>Proxy</h2>
        <input
          type="text"
          placeholder="Enter URL to proxy"
          value={proxyUrl}
          onChange={(e) => setProxyUrl(e.target.value)}
          className="input-field"
        />
        <button onClick={handleProxy} className="btn">Send Proxy Request</button>
        <pre className="output-box">{proxyResponse}</pre>
      </section>

      <section className="tool-section">
        <h2>Spider</h2>
        <input
          type="text"
          placeholder="Enter URL to spider"
          value={spiderUrl}
          onChange={(e) => setSpiderUrl(e.target.value)}
          className="input-field"
        />
        <button onClick={handleSpider} className="btn">Start Spider</button>
        <ul className="list-box">
          {spiderLinks.map((link, index) => (
            <li key={index}>{link}</li>
          ))}
        </ul>
      </section>

      <section className="tool-section">
        <h2>Scanner</h2>
        <input
          type="text"
          placeholder="Enter URL to scan"
          value={scannerUrl}
          onChange={(e) => setScannerUrl(e.target.value)}
          className="input-field"
        />
        <button onClick={handleScanner} className="btn">Start Scan</button>
        <ul className="list-box">
          {vulnerabilities.map((vuln, index) => (
            <li key={index}>{vuln}</li>
          ))}
        </ul>
      </section>

      <section className="tool-section">
        <h2>Repeater</h2>
        <select
          value={repeaterRequest.method}
          onChange={(e) => setRepeaterRequest({ ...repeaterRequest, method: e.target.value })}
          className="select-field"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
          <option>PATCH</option>
        </select>
        <input
          type="text"
          placeholder="Request URL"
          value={repeaterRequest.url}
          onChange={(e) => setRepeaterRequest({ ...repeaterRequest, url: e.target.value })}
          className="input-field"
        />
        <textarea
          placeholder="Headers (JSON format)"
          value={repeaterRequest.headers}
          onChange={(e) => setRepeaterRequest({ ...repeaterRequest, headers: e.target.value })}
          rows={3}
          className="textarea-field"
        />
        <textarea
          placeholder="Body"
          value={repeaterRequest.body}
          onChange={(e) => setRepeaterRequest({ ...repeaterRequest, body: e.target.value })}
          rows={3}
          className="textarea-field"
        />
        <button onClick={handleRepeater} className="btn">Send Request</button>
        <pre className="output-box">
          {repeaterResponse && JSON.stringify(repeaterResponse, null, 2)}
        </pre>
      </section>

      <section className="tool-section">
        <h2>Decoder</h2>
        <select
          value={decoderInput.action}
          onChange={(e) => setDecoderInput({ ...decoderInput, action: e.target.value })}
          className="select-field"
        >
          <option value="encode">Encode</option>
          <option value="decode">Decode</option>
        </select>
        <select
          value={decoderInput.encoding}
          onChange={(e) => setDecoderInput({ ...decoderInput, encoding: e.target.value })}
          className="select-field"
        >
          <option value="base64">Base64</option>
          <option value="url">URL</option>
        </select>
        <textarea
          placeholder="Data"
          value={decoderInput.data}
          onChange={(e) => setDecoderInput({ ...decoderInput, data: e.target.value })}
          rows={3}
          className="textarea-field"
        />
        <button onClick={handleDecoder} className="btn">Process</button>
        <pre className="output-box">{decoderResult}</pre>
      </section>
    </div>
  );
}

export default App;
