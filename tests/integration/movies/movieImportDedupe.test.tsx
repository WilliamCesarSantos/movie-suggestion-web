import { describe, expect, it } from 'vitest';
import { parseImportMovieNames } from '../../../src/features/movies/parseImportMovieNames';

describe('movie import dedupe', () => {
  it('deduplicates movie names', () => {
    expect(parseImportMovieNames('A\nB\nA')).toEqual(['A', 'B']);
  });
});
