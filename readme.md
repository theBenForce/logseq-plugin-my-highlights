# Highlight Importer
[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="140">](https://www.buymeacoffee.com/theBenForce)

## Features

  - easliy import highlights and notes directly from your kindle

## Hiding Highlight IDs

To hide the highlight IDs, open settings and click "Edit config.edn". Towards
the bottom you'll see a comment about hiding specific properties, modify that
section to look like this:

```
 ;; hide specific properties for blocks
 ;; E.g. #{:created-at :updated-at}
 :block-hidden-properties #{:highlight-id}
```

### How Kindle Highlight Importer Works


## References
  1. https://github.com/believer/kindle-highlights/tree/main/packages/parser
  2. https://reactjsexample.com/logseq-plugin-boilerplate-w-react-vite/
  3. https://github.com/hadynz/obsidian-kindle-plugin
  4. https://www.npmjs.com/package/@hadynz/kindle-clippings

## Support

If you find this plugin useful, please consider [buying me a coffee](https://www.buymeacoffee.com/theBenForce).