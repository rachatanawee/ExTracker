import {getRequestConfig} from 'next-intl/server';

const en = require('../messages/en.json');
const th = require('../messages/th.json');

export default getRequestConfig(async ({locale}) => {
  const resolvedLocale = locale ?? 'en';
  return {
    locale: resolvedLocale,
    messages: resolvedLocale === 'en' ? en : th
  };
});
