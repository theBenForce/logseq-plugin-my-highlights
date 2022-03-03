#!/usr/bin/env bash

export NEXT_VERSION=$1

echo "Build Plugin"
echo VERSION=$NEXT_VERSION > .env.production.local
export SENTRY_RELEASE="$SENTRY_PROJECT@$NEXT_VERSION"
echo "\nSENTRY_RELEASE=$SENTRY_RELEASE" >> .env.production.local
echo "Environment"
echo $(cat ./.env.production.local)
echo $(cat ./.env)

echo "Building"
pnpm build

echo "Create Sentry Release"
npx sentry-cli releases new $SENTRY_RELEASE --url "https://github.com/theBenForce/logseq-plugin-my-highlights/releases/tag/v$NEXT_VERSION"
npx sentry-cli releases set-commits --auto $SENTRY_RELEASE
npx sentry-cli releases finalize $SENTRY_RELEASE

echo "Create Build Artifact"
zip -qq -r logseq-plugin-my-highlights-$NEXT_VERSION.zip dist docs icon.svg readme.md LICENSE package.json