import { Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../../db/connectionFactory';
import { processMathareMint } from './mathareHelpers';

describe('Mathare token funcs', () => {
  let conn: Connection;
  const context: Context = {
    log: { error: jest.fn(), info: jest.fn() },
  } as unknown as Context;

  beforeAll(async () => {
    conn = await connectionFactory(context);
  });

  afterAll(async () => {
    await conn.close();
  });

  it('should create a db connection', async () => {
    expect(conn).toBeDefined();
  });
});
