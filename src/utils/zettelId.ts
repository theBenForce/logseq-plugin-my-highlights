import { DateTime } from 'luxon';

export const createZettelId = (time: DateTime = DateTime.now()) => time.toFormat("yyyyLLddHHmmss");