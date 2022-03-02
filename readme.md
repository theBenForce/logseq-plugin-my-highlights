# Highlight Importer


## Features

  - easliy import highlights and notes directly from your kindle

## Importing Highlights

To import highlights from your kindle's clipping file, click the highlighter icon in logseq.
A dialog will open, click the "Load Clippings File" button, this will open a file selection dialog.
Browse to your kindle and select the "My Clippings.txt" file.

After selecting the clippings file you will be presented with a list of books that you can
import highlights from. Select the checkbox next to each book that you would like to import and click
the "Import" button.

![Importing Highlights](./docs/sample_import.gif)

## Hiding Highlight ID Properties

To hide the highlight IDs, open settings and click "Edit config.edn". Towards
the bottom you'll see a comment about hiding specific properties, modify that
section to look like this:

```
 ;; hide specific properties for blocks
 ;; E.g. #{:created-at :updated-at}
 :block-hidden-properties #{:highlight-id}
```

## Manual Installation

You can manually install this plugin by downloading the [latest release](https://github.com/theBenForce/logseq-plugin-my-highlights/releases). Download the `logseq-plugin-my-highlights-*.zip` file and unzip its contents to `USER_DIR/.logseq/plugins/logseq-plugin-my-highlights`. Now just reload logseq and you should see the "My Highlights" icon in your toolbar.

## References
  1. https://github.com/believer/kindle-highlights/tree/main/packages/parser
  2. https://reactjsexample.com/logseq-plugin-boilerplate-w-react-vite/
  3. https://github.com/hadynz/obsidian-kindle-plugin
  4. https://www.npmjs.com/package/@hadynz/kindle-clippings

## Support

If you find this plugin useful, please consider [buying me a coffee](https://www.buymeacoffee.com/theBenForce).

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="140">](https://www.buymeacoffee.com/theBenForce)