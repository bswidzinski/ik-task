import { INestApplication, Controller, Get, HttpException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { GlobalExceptionFilter } from './global-exception.filter';

@Controller('test-errors')
class TestErrorController {
  @Get('not-found')
  throwNotFound() {
    throw new NotFoundException('Resource not found');
  }

  @Get('bad-request')
  throwBadRequest() {
    throw new BadRequestException(['name must not be empty', 'price must be positive']);
  }

  @Get('http-error')
  throwHttp() {
    throw new HttpException('Forbidden', 403);
  }

  @Get('unexpected')
  throwUnexpected() {
    throw new Error('database connection failed');
  }

  @Get('non-error')
  throwNonError() {
    throw 'string thrown'; // eslint-disable-line no-throw-literal
  }
}

describe('GlobalExceptionFilter', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TestErrorController],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns standard NestJS error for HttpException', async () => {
    const res = await request(app.getHttpServer())
      .get('/test-errors/http-error')
      .expect(403);

    // HttpException with a string response passes it through res.json()
    expect(res.body).toBe('Forbidden');
  });

  it('returns 404 with message for NotFoundException', async () => {
    const res = await request(app.getHttpServer())
      .get('/test-errors/not-found')
      .expect(404);

    expect(res.body.statusCode).toBe(404);
    expect(res.body.message).toBe('Resource not found');
  });

  it('returns 400 with field-level validation errors for BadRequestException', async () => {
    const res = await request(app.getHttpServer())
      .get('/test-errors/bad-request')
      .expect(400);

    expect(res.body.statusCode).toBe(400);
    expect(res.body.message).toEqual([
      'name must not be empty',
      'price must be positive',
    ]);
  });

  it('returns generic 500 for unexpected errors with no leaked details', async () => {
    const res = await request(app.getHttpServer())
      .get('/test-errors/unexpected')
      .expect(500);

    expect(res.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
    // Must not leak internal error message or stack trace
    expect(JSON.stringify(res.body)).not.toContain('database connection failed');
    expect(JSON.stringify(res.body)).not.toContain('stack');
  });

  it('returns generic 500 for non-Error thrown values', async () => {
    const res = await request(app.getHttpServer())
      .get('/test-errors/non-error')
      .expect(500);

    expect(res.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
    expect(JSON.stringify(res.body)).not.toContain('string thrown');
  });
});
