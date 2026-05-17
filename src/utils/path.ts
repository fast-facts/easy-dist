import * as nodeGlob from 'glob';

export function glob(
  pattern: string | string[],
  options: nodeGlob.GlobOptions = {}
): Promise<string[]> {
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  return Promise.all(
    patterns.map(
      pattern => nodeGlob.glob(pattern, options) as Promise<string[]>
    )
  ).then(matches => matches.reduce((carry, match) => carry.concat(match)));
}
