
import * as hash from 'hash.js';

export const hashValues = (values: Array<string> | string): string => {
  let value = '';

  if (typeof values === 'string') {
    value = values;
  } else {
    value = values.filter(Boolean).join(':');
  }


  return hash
    .sha224()
    .update(value)
    .digest('hex');
}