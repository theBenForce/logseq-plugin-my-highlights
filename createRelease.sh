#!/usr/bin/env bash

export NEXT_VERSION=$1

echo "Build Plugin"
echo VERSION=$NEXT_VERSION >> .env
export SENTRY_RELEASE="$SENTRY_PROJECT@$NEXT_VERSION"
echo "VITE_SENTRY_RELEASE=$SENTRY_RELEASE" >> .env
echo "VITE_SENTRY_DSN=$SENTRY_DSN" >> .env
echo "Environment"
echo $(cat --show-ends ./.env)

echo "Building"
pnpm build

echo "Create Sentry Release"
npx sentry-cli releases new $SENTRY_RELEASE --url "https://github.com/theBenForce/logseq-plugin-my-highlights/releases/tag/v$NEXT_VERSION"
npx sentry-cli releases set-commits --auto $SENTRY_RELEASE
npx sentry-cli releases files $SENTRY_RELEASE upload-sourcemaps ./dist/assets/*.js.map
npx sentry-cli releases finalize $SENTRY_RELEASE
npx sentry-cli releases deploys $SENTRY_RELEASE new -e prod

echo "Remove source maps"
rm ./dist/assets/*.js.map

echo "Create Build Artifact"
zip -qq -r logseq-plugin-my-highlights-$NEXT_VERSION.zip dist docs icon.svg readme.md LICENSE package.json