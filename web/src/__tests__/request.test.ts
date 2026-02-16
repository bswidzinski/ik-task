import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request, HttpError } from '@/api/request';

function mockFetch(response: {
  status: number;
  body?: unknown;
  contentType?: string;
}) {
  const headers = new Headers();
  if (response.contentType) {
    headers.set('content-type', response.contentType);
  }

  return vi.fn().mockResolvedValue({
    status: response.status,
    ok: response.status >= 200 && response.status < 300,
    headers,
    json: () => Promise.resolve(response.body),
    text: () => Promise.resolve(typeof response.body === 'string' ? response.body : JSON.stringify(response.body)),
  } as unknown as Response);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('request', () => {
  it('returns parsed JSON data on success', async () => {
    const data = { id: '1', name: 'Test' };
    globalThis.fetch = mockFetch({
      status: 200,
      body: data,
      contentType: 'application/json',
    });

    const result = await request<typeof data>('/api/test');

    expect(result).toEqual(data);
  });

  it('returns undefined for 204 responses', async () => {
    globalThis.fetch = mockFetch({ status: 204 });

    const result = await request<void>('/api/test', { method: 'DELETE' });

    expect(result).toBeUndefined();
  });

  it('throws HttpError with status 400 and validation message', async () => {
    globalThis.fetch = mockFetch({
      status: 400,
      body: { statusCode: 400, message: ['name must not be empty'] },
      contentType: 'application/json',
    });

    await expect(request('/api/test')).rejects.toThrow(HttpError);

    try {
      await request('/api/test');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.status).toBe(400);
      expect(httpErr.message).toBe('name must not be empty');
    }
  });

  it('throws HttpError with status 500 and generic message', async () => {
    globalThis.fetch = mockFetch({
      status: 500,
      body: { statusCode: 500, message: 'database connection failed' },
      contentType: 'application/json',
    });

    try {
      await request('/api/test');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.status).toBe(500);
      expect(httpErr.message).toBe('Something went wrong. Please try again later.');
      // Internal message is stored in data but not in message
      expect(httpErr.message).not.toContain('database');
    }
  });

  it('handles non-JSON error responses gracefully', async () => {
    globalThis.fetch = mockFetch({
      status: 502,
      body: '<html>Bad Gateway</html>',
      contentType: 'text/html',
    });

    try {
      await request('/api/test');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.status).toBe(502);
      expect(httpErr.message).toBe('Something went wrong. Please try again later.');
    }
  });

  it('sets Content-Type to application/json by default', async () => {
    globalThis.fetch = mockFetch({
      status: 200,
      body: {},
      contentType: 'application/json',
    });

    await request('/api/test');

    const [, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = options.headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('does not overwrite custom headers', async () => {
    globalThis.fetch = mockFetch({
      status: 200,
      body: {},
      contentType: 'application/json',
    });

    await request('/api/test', {
      headers: { 'Content-Type': 'text/plain', 'X-Custom': 'value' },
    });

    const [, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = options.headers as Headers;
    expect(headers.get('Content-Type')).toBe('text/plain');
    expect(headers.get('X-Custom')).toBe('value');
  });

  it('joins array messages with commas for 4xx errors', async () => {
    globalThis.fetch = mockFetch({
      status: 422,
      body: { message: ['field a is required', 'field b is invalid'] },
      contentType: 'application/json',
    });

    try {
      await request('/api/test');
    } catch (err) {
      const httpErr = err as HttpError;
      expect(httpErr.message).toBe('field a is required, field b is invalid');
    }
  });
});
