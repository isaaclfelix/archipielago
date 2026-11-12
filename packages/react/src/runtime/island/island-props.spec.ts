import { decodeComponentProps } from './island-props';

describe('island props', () => {
  it('parses a JSON object from the Drih attribute', () => {
    const encoded = '{"start":0,"note":"<b>\\""}';

    expect(decodeComponentProps(encoded)).toEqual({ start: 0, note: '<b>"' });
  });

  it('parses hex-escaped quotes the way the Handlebars shell writes them', () => {
    const encoded = JSON.stringify({ isAuthenticated: true }).replaceAll(
      '"',
      '\\u0022',
    );

    expect(decodeComponentProps(encoded)).toEqual({ isAuthenticated: true });
  });

  it('treats an empty attribute as empty props', () => {
    expect(decodeComponentProps('')).toEqual({});
  });

  it('rejects JSON that is not an object', () => {
    expect(() => decodeComponentProps('null')).toThrow(
      'Island props must be a JSON object.',
    );
    expect(() => decodeComponentProps('[1]')).toThrow(
      'Island props must be a JSON object.',
    );
    expect(() => decodeComponentProps('"nope"')).toThrow(
      'Island props must be a JSON object.',
    );
  });
});
