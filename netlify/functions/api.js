import { createServer } from 'http';
import { parse } from 'url';
import { handler as expressHandler } from '../../server/index.js';

export const handler = async (event, context) => {
  const { httpMethod, path, headers, body, queryStringParameters } = event;
  
  // Convert Netlify event to Express-like request
  const req = {
    method: httpMethod,
    url: path,
    headers: headers || {},
    body: body ? JSON.parse(body) : {},
    query: queryStringParameters || {},
  };

  // Convert to Express response
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    status: (code) => {
      res.statusCode = code;
      return res;
    },
    json: (data) => {
      res.body = JSON.stringify(data);
      res.headers['Content-Type'] = 'application/json';
      return res;
    },
    send: (data) => {
      res.body = data;
      return res;
    },
    setHeader: (name, value) => {
      res.headers[name] = value;
    },
  };

  try {
    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
        body: '',
      };
    }

    // Process the request through Express
    await new Promise((resolve, reject) => {
      expressHandler(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return {
      statusCode: res.statusCode,
      headers: res.headers,
      body: res.body,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
