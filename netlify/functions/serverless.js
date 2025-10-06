// Netlify serverless function for Early Alert Network API
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // For now, return a simple response
  // In production, you would connect to your Neon database here
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Early Alert Network API - Serverless Function',
      status: 'running',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path,
      environment: process.env.NODE_ENV || 'development',
    }),
  };
};
