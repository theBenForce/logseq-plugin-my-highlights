#!/usr/bin/env bash

export NEXT_VERSION=$1

echo "Build Plugin"
echo VERSION=$NEXT_VERSION > .env.production.local
pnpm build

echo "Create Sentry Release"
npx sentry-cli releases new $NEXT_VERSION --url "https://github.com/theBenForce/logseq-plugin-my-highlights/releases/tag/v$NEXT_VERSION"
npx sentry-cli releases set-commits --auto $NEXT_VERSION
npx sentry-cli releases finalize $NEXT_VERSION

echo "Create Build Artifact"
npx zip -qq -r logseq-plugin-my-highlights-$NEXT_VERSION.zip dist docs icon.svg readme.md LICENSE package.json