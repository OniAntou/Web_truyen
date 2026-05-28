import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API = 'https://web-truyen-backend.vercel.app/api';

async function main() {
  // Login
  const loginRes = await axios.post(`${API}/login`, {
    email: 'bot@truyen.com',
    password: 'Bot@123456',
  }, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
  const token = loginRes.data.token;
  const auth = { headers: { Authorization: `Bearer ${token}`, 'X-Requested-With': 'XMLHttpRequest' } };
  console.log('Login OK');

  // Create comic
  const comic = (await axios.post(`${API}/comics`, {
    title: 'Test Upload ' + Date.now(),
    author: 'Test',
    artist: 'Test',
    status: 'Ongoing',
    description: 'test',
    genres: ['Action'],
  }, auth)).data;
  console.log('Comic:', comic._id);

  // Create chapter
  const chapter = (await axios.post(`${API}/chapters`, {
    comic_id: comic._id,
    chapter_number: 1,
    title: 'Test Chapter',
  }, auth)).data;
  console.log('Chapter:', chapter._id);

  // Upload cover
  const coverForm = new FormData();
  coverForm.append('cover', fs.createReadStream('scripts/find-comic.mjs'));
  await axios.post(`${API}/upload/cover/${comic._id}`, coverForm, {
    headers: { ...auth.headers, ...coverForm.getHeaders() },
    timeout: 30000,
  });
  console.log('Cover upload OK');

  // Upload pages
  const pageForm = new FormData();
  pageForm.append('pages', fs.createReadStream('scripts/find-comic.mjs'));
  const pageRes = await axios.post(`${API}/upload/chapter/${chapter._id}`, pageForm, {
    headers: { ...auth.headers, ...pageForm.getHeaders() },
    timeout: 30000,
  });
  console.log('Page upload OK, pages:', pageRes.data?.pages?.length);

  // Clean up - delete test comic
  await axios.delete(`${API}/comics/${comic._id}`, auth);
  console.log('Cleanup OK');
}

main().catch(err => {
  console.error('ERROR:', err.response?.status, err.response?.data || err.message);
});
