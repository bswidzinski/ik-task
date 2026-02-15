export class HttpError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

export async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    if (res.status >= 500) {
      throw new HttpError(
        res.status,
        'Something went wrong. Please try again later.',
        body,
      );
    }
    const message = body?.message || body || `Error ${res.status}`;
    throw new HttpError(
      res.status,
      Array.isArray(message) ? message.join(', ') : message,
      body,
    );
  }

  return body as T;
}
