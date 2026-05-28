import axios, { type AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { config } from './config.js';
import { sleep } from './utils.js';

export class ApiClient {
  private http: AxiosInstance;
  private token: string = '';

  constructor() {
    this.http = axios.create({
      baseURL: config.api.baseUrl,
      timeout: 120000,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
  }

  async login(email: string, password: string): Promise<void> {
    const res = await this.http.post('/auth/login', { email, password });
    const token = res.data?.token || res.data?.data?.token;
    if (!token) throw new Error('Đăng nhập thất bại: không nhận được token');

    this.token = token;
    this.http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log(`[API] Đăng nhập thành công (${email})`);
  }

  async createComic(data: {
    title: string;
    author: string;
    artist?: string;
    status: string;
    description: string;
    genres: string[];
  }): Promise<{ _id: string; id: number }> {
    const res = await this.http.post('/comics', data);
    console.log(`[API] Đã tạo truyện: "${data.title}" (ID: ${res.data._id})`);
    return { _id: res.data._id, id: res.data.id };
  }

  async uploadCover(comicId: string, imagePath: string): Promise<void> {
    const form = new FormData();
    form.append('cover', fs.createReadStream(imagePath));

    await this.http.post(`/upload/cover/${comicId}`, form, {
      headers: form.getHeaders(),
      timeout: 60000,
    });
    console.log(`[API] Đã upload ảnh bìa cho comic ${comicId}`);
  }

  async createChapter(data: {
    comic_id: string;
    chapter_number: number;
    title: string;
  }): Promise<{ _id: string }> {
    const res = await this.http.post('/chapters', data);
    return { _id: res.data._id };
  }

  async uploadChapterPages(chapterId: string, imagePaths: string[]): Promise<void> {
    const BATCH_SIZE = 15;
    for (let i = 0; i < imagePaths.length; i += BATCH_SIZE) {
      const batch = imagePaths.slice(i, Math.min(i + BATCH_SIZE, imagePaths.length));
      const form = new FormData();
      for (const imgPath of batch) {
        form.append('pages', fs.createReadStream(imgPath));
      }

      await this.http.post(`/upload/chapter/${chapterId}`, form, {
        headers: { ...form.getHeaders(), 'X-Requested-With': 'XMLHttpRequest' },
        timeout: 300000,
      });
      process.stdout.write('.');
      await sleep(500);
    }
  }
}
