import * as functions from "firebase-functions";
import Axios from "axios";
import * as cheerio from "cheerio";

interface DetailsSearchResult {
  asin: string;
  title: string;
  imageUrl: string;
  author?: string;
  published?: string;
  productPath: string;
}

function parseSearchResults(content: string): DetailsSearchResult[] {
  const results = [] as DetailsSearchResult[];
  const $ = cheerio.load(content);

  const resultContainer = $(".s-main-slot").first();

  resultContainer.children("div[data-component-type=s-search-result]").each((i, elem) => {
    const e = $(elem);
    const asin = e.attr("data-asin");

    const imageRecord = e.find("img[class=s-image]").first();
    const title = imageRecord.attr("alt");
    const imageUrl = imageRecord.attr("src");

    const imageContainer = e.find("span[data-component-type=s-product-image]").first();
    const productLink = imageContainer.find("a").first();
    let productPath = productLink.attr("href");
    productPath = productPath?.substring(0, productPath.lastIndexOf("/"));

    const headerElement = e.find(".s-title-instructions-style").first();
    const metaElements = $(headerElement[0].children[1]).find(".a-row").first();
    const author = $(metaElements).find(".s-link-style.a-size-base").first().text();
    const published = $(metaElements).find(".a-text-normal").last().text();

    if (asin && title && imageUrl && productPath && !title.startsWith("Sponsored Ad")) {
      results.push({asin, title, imageUrl, author, published, productPath});
    }
  });

  return results;
}

export const searchForKindleBook = functions.https.onCall(async (data) => {
  const {query} = data;

  if (typeof query !== "string" || !query?.trim()?.length) {
    throw new functions.https.HttpsError("invalid-argument", "You need to provide a valid query");
  }

  const SEARCH_URL = "https://www.amazon.com/s";
  let results = [] as Array<DetailsSearchResult>;
  const params = {
    i: "digital-text",
    k: query,
  };


  const response = await Axios.get(SEARCH_URL, {
    params,
    validateStatus: () => true,
  });

  if (response.status === 200) {
    results = parseSearchResults(response.data);
  }

  return results;
});
