import { convertMsToSecs } from '../../utils';

describe('convertMsToSecs()', () => {
  let result: any;
  describe('when passed 12507', () => {
    beforeEach(() => {
      result = convertMsToSecs(12507);
    });

    test('it returns 12.5', () => {
      expect(result).toEqual(12.51);
    });
  });

  describe('when passed 200', () => {
    beforeEach(() => {
      result = convertMsToSecs(200);
    });

    test('it returns 0.2', () => {
      expect(result).toEqual(0.2);
    });
  });

  describe('when passed 10', () => {
    beforeEach(() => {
      result = convertMsToSecs(10);
    });

    test('it returns 0.01', () => {
      expect(result).toEqual(0.01);
    });
  });
});
