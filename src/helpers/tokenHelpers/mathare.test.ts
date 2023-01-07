import { Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../../db/connectionFactory';

describe('Mathare token funcs', () => {
  let conn: Connection | undefined;
  const context: Context = {
    log: { error: jest.fn(), info: jest.fn() },
  } as unknown as Context;

  beforeAll(async () => {
    conn = await connectionFactory(context);
  });

  afterAll(async () => {
    if (conn) await conn.close();
  });

  it('should create a db connection', async () => {
    expect(conn).toBeDefined();
  });
});
