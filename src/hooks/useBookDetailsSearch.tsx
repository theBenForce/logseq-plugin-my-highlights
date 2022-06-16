import React from 'react';

export interface DetailsSearchResult {
  asin: string;
  title: string;
  imageUrl: string;
  author?: string;
  published?: string;
  productPath: string;
}

export const useBookDetailsSearch = () => {
  const [results, setResults] = React.useState<Array<DetailsSearchResult>>([]);
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
