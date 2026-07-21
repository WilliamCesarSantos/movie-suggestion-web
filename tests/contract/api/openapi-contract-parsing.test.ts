import { describe, expect, it } from 'vitest';
import { recommendationPageSchema } from '../../../src/api/schemas/movieSchemas';

describe('openapi contract parsing', () => {
  it('parses recommendation page payload', () => {
    const payload = {
      data: [{ id: '1', title: 'Movie', year: '1999', poster: null, imdbRating: 8.5 }],
      nextCursor: null,
      prevCursor: null,
      hasNext: false,
      hasPrev: false,
      limit: 10,
      count: 1,
      total: 1
    };

    expect(recommendationPageSchema.parse(payload).items).toHaveLength(1);
  });
});
