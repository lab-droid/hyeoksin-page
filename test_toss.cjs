const https = require('https');
const options = {
  hostname: 'api.tosspayments.com',
  path: '/v1/payments/orders/test_order_id',
  method: 'GET',
  headers: {
    'Authorization': 'Basic ' + Buffer.from('test_gsk_EXaAQZzavLMYyK1Gow61R40kP1wJ:').toString('base64'),
    'Content-Type': 'application/json'
  }
};
const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data));
});
req.end();
