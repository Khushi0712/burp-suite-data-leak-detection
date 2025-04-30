const request = require('supertest');
const express = require('express');
const app = require('./server'); // Assuming server.js exports the app

describe('Backend API Endpoints', () => {
  it('should return 400 for /proxy without target query', async () => {
    const res = await request(app).get('/proxy');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return links array from /spider with valid URL', async () => {
    const res = await request(app)
      .post('/spider')
      .send({ url: 'https://example.com' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('links');
    expect(Array.isArray(res.body.links)).toBe(true);
  });

  it('should return vulnerabilities array from /scanner with valid URL', async () => {
    const res = await request(app)
      .post('/scanner')
      .send({ url: 'https://example.com' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('vulnerabilities');
    expect(Array.isArray(res.body.vulnerabilities)).toBe(true);
  });

  it('should return 400 for /repeater with missing method or url', async () => {
    const res = await request(app)
      .post('/repeater')
      .send({ method: 'GET' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('should return result from /decoder with valid input', async () => {
    const res = await request(app)
      .post('/decoder')
      .send({ action: 'encode', encoding: 'base64', data: 'test' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('result');
  });
});
