import http from 'k6/http';
import { sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 10,
  duration: '5m',
};

export default function () {
  const sleepTime = randomIntBetween(1, 4);
  const jwt = http
    .post(
      'http://users:3000/dev/token',
      JSON.stringify({ email: 'admin@library.local' }),
      { headers: { 'Content-Type': 'application/json' } },
    )
    .json('token');
  const headers = {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'application/json',
  };
  http.get('http://books:3000/books', { headers });
  const self = http.get('http://users:3000/users/self', { headers }).json();

  const scenario = randomIntBetween(1, 10);
  switch (scenario) {
    case 1:
      // Generate 500
      http.get('http://books:3000/books', {
        headers: { Authorization: 'Bearer invalid' },
      });
      break;
    case 2:
      // Generate 404
      http.get('http://books:3000/not-found');
      break;
    case 4:
      // Generate 403
      http.get('http://users:3000/users/self');
      break;
    case 5:
      http.post(
        'http://users:3000/users',
        JSON.stringify({
          userId: self.id,
          amount: 100,
        }),
        { headers },
      );
      http.post('http://books:3000/borrow', JSON.stringify({ bookId: 3 }), {
        headers,
      });
      http.post(
        'http://books:3000/borrow/return',
        JSON.stringify({ bookId: 3 }),
        { headers },
      );
      break;
    default:
      break;
  }
  sleep(sleepTime);
}
