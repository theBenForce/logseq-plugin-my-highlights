import React from 'react';
import { AmazonSearchResult, parseAmazonSearchResults } from '../utils/parseAmazonSearchResults';
import * as Sentry from '@sentry/react';
import fetch from 'cross-fetch';


const searchAmazonKindle = async (query: string): Promise<Array<AmazonSearchResult>> => {
  const SEARCH_URL = "https://www.amazon.com/s";
  let results = [] as Array<AmazonSearchResult>;

  const url = new URL(SEARCH_URL);
  url.searchParams.append('i', 'digital-text');
  url.searchParams.append('k', query);

  const response = await fetch(url.toString());

  if (response.status === 200) {
    const content = await response.text();
    results = parseAmazonSearchResults(content);
  } else {
    console.error(response.statusText);
    Sentry.captureException(response.statusText, {
      extra: {
        searchParams: url.searchParams.toString(),
      }
    });
  }

  return results;
};

interface UseBookDetailsSearchParams {
  query: string;
}

export const useBookDetailsSearch = () => {
  const [results, setResults] = React.useState<Array<AmazonSearchResult>>([]);
  const [isBusy, setBusy] = React.useState(false);

  const search = async (query?: string) => {
    if (!query) return;

    try {
      setBusy(true);
      setResults([]);
      const r = await searchAmazonKindle(query);
      setResults(r);
    } finally {
      setBusy(false);
    }
  }

  return { results, isBusy, search };
}



