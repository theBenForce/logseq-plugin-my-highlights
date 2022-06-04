import React from 'react';
import Axios from 'axios';
import * as cheerio from 'cheerio';

export interface DetailsSearchResult {
  asin: string;
  title: string;
  imageUrl: string;
  author?: string;
  published?: string;
}

const searchAmazonKindle = async (title: string, author?: string): Promise<Array<DetailsSearchResult>> => {
  const SEARCH_URL = "https://www.amazon.com/s";
  let results = [] as Array<DetailsSearchResult>;
  const query = [title, author].filter(Boolean).join(' ');

  const response = await Axios.get(SEARCH_URL, {
    params: {
      i: 'digital-text',
      k: query,
    },
    validateStatus: () => true,
    headers: {'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-gpc': '1',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9'}
  });

  if (response.status === 200) {
    results = parseSearchResults(response.data);
  }

  return results;
};

interface UseBookDetailsSearchParams {
  title: string;
  author?: string;
}

export const useBookDetailsSearch = ({ title, author }: UseBookDetailsSearchParams) => {
  const [results, setResults] = React.useState<Array<DetailsSearchResult>>([]);

  React.useEffect(() => {
    searchAmazonKindle(title, author).then(setResults);
  }, [title]);

  return results;
}


export function parseSearchResults(content: string): DetailsSearchResult[] {
  const results = [] as DetailsSearchResult[];
  const $ = cheerio.load(content);

  $('div[data-component-type=s-search-result]').each((i, elem) => {
    const e = $(elem);
    const asin = e.attr('data-asin');
    const imageRecord = e.find('img[class=s-image]').first();
    const title = imageRecord.attr('alt');
    const imageUrl = imageRecord.attr('src');

    const headerElement = e.find('.s-title-instructions-style').first();
    const metaElements = $(headerElement[0].children[1]).find('.a-row').first();
    const author = $(metaElements).find('.s-link-style').first().text();
    const published = $(metaElements).find('.a-text-normal').last().text();

    if (asin && title && imageUrl) {
      results.push({ asin, title, imageUrl, author, published });
    }
  });

  return results;
}
