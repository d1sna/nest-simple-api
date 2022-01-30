import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { disconnect, Types } from 'mongoose';
import {
  LARGE_RATING,
  LOW_RATING,
  REVIEW_NOT_FOUND,
} from '../src/review/review.constants';
import { response } from 'express';

describe('Review model tests (e2e)', () => {
  let app: INestApplication, createdId;

  const reviewDto = {
    name: 'TestName',
    title: 'TestTitle',
    description: 'TestDescription',
    rating: 5,
    productId: new Types.ObjectId().toHexString(),
  };

  const { productId } = reviewDto;
  const randomId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/review/create (POST) - success', async (done) => {
    return request(app.getHttpServer())
      .post('/review/create')
      .send(reviewDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        createdId = body._id;
        expect(createdId).toBeDefined();
        done();
      });
  });

  it('/review/create (POST) - fail (name is not string)', () => {
    const wrongReviewDto = {
      ...reviewDto,
      name: 1,
    };
    return request(app.getHttpServer())
      .post('/review/create')
      .send(wrongReviewDto)
      .expect(400);
  });

  it('/review/create (POST) - fail (title is not string)', () => {
    const wrongReviewDto = {
      ...reviewDto,
      title: {},
    };
    return request(app.getHttpServer())
      .post('/review/create')
      .send(wrongReviewDto)
      .expect(400);
  });

  it('/review/create (POST) - fail (description is not string)', () => {
    const wrongReviewDto = {
      ...reviewDto,
      description: [],
    };
    return request(app.getHttpServer())
      .post('/review/create')
      .send(wrongReviewDto)
      .expect(400);
  });

  it('/review/create (POST) - fail (rating is lower than 1)', async (done) => {
    const wrongReviewDto = {
      ...reviewDto,
      rating: 0,
    };
    return request(app.getHttpServer())
      .post('/review/create')
      .send(wrongReviewDto)
      .expect(400)
      .then(({ body }: request.Response) => {
        expect(body.message[0] === LOW_RATING);
        done();
      });
  });

  it('/review/create (POST) - fail (rating is larger than 5)', async (done) => {
    const wrongReviewDto = {
      ...reviewDto,
      rating: 7,
    };
    return request(app.getHttpServer())
      .post('/review/create')
      .send(wrongReviewDto)
      .expect(400)
      .then(({ body }: request.Response) => {
        expect(body.message[0] === LARGE_RATING);
        done();
      });
  });

  it('/review/create (POST) - fail (productId is not a string)', () => {
    const wrongReviewDto = {
      ...reviewDto,
      productId: [],
    };
    return request(app.getHttpServer())
      .post('/review/create')
      .send(wrongReviewDto)
      .expect(400);
  });

  it('/review/byProduct/:productId (GET) - success', async (done) => {
    return request(app.getHttpServer())
      .get(`/review/byProduct/${productId}`)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body.length).toBe(1);
        done();
      });
  });

  it('/review/byProduct/:productId (GET) - fail', async (done) => {
    return request(app.getHttpServer())
      .get(`/review/byProduct/${randomId}`)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body.length).toBe(0);
        done();
      });
  });

  it('/review/:id (DELETE) - success', async (done) => {
    return request(app.getHttpServer())
      .delete(`/review/${createdId}`)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body._id).toBe(createdId);
        done();
      });
  });

  it('/review/:id (DELETE) - fail', () => {
    return request(app.getHttpServer())
      .delete(`/review/${randomId}`)
      .expect(404, { statusCode: 404, message: REVIEW_NOT_FOUND });
  });

  afterAll(() => {
    disconnect();
  });
});
