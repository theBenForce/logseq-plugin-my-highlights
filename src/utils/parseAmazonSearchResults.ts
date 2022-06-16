
import * as cheerio from 'cheerio';


export interface AmazonSearchResult {
  asin: string;
  title: string;
  imageUrl: string;
  author?: string;
  published?: string;
  productPath: string;
}

export function parseAmazonSearchResults(content: string): AmazonSearchResult[] {
  const results = [] as AmazonSearchResult[];
  const $ = cheerio.load(content);

  const resultContainer = $('.s-main-slot').first();

  resultContainer.children('div[data-component-type=s-search-result]').each((i, elem) => {
    const e = $(elem);
    const asin = e.attr('data-asin');

    const imageRecord = e.find('img[class=s-image]').first();
    const title = imageRecord.attr('alt');
    const imageUrl = imageRecord.attr('src');

    const imageContainer = e.find('span[data-component-type=s-product-image]').first();
    const productLink = imageContainer.find('a').first();
    let productPath = productLink.attr('href');
    productPath = productPath?.substring(0, productPath.lastIndexOf('/'))

    const headerElement = e.find('.s-title-instructions-style').first();
    const metaElements = $(headerElement[0].children[1]).find('.a-row').first();
    const author = $(metaElements).find('.s-link-style.a-size-base').first().text();
    const published = $(metaElements).find('.a-text-normal').last().text();

    if (asin && title && imageUrl && productPath && !title.startsWith('Sponsored Ad')) {
      results.push({ asin, title, imageUrl, author, published, productPath });
    }
  });

  return results;
}