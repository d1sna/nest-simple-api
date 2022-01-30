import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { disconnect, Types } from 'mongoose';
import { REVIEW_NOT_FOUND } from '../src/review/review.constants';

const reviewDto = {
  name: 'TestName',
  title: 'TestTitle',
  description: 'TestDescription',
  rating: 5,
  productId: new Types.ObjectId().toHexString(),
};

const { productId } = reviewDto;
const randomId = new Types.ObjectId().toHexString();

describe('Review model tests (e2e)', () => {
  let app: INestApplication, createdId;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/review/create (POST) ', async (done) => {
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
