module.exports = {
  branches: ["master"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
      },
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    "@semantic-release/git",
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "./createRelease.sh ${nextRelease.version}",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: "logseq-plugin-my-highlights-*.zip",
      },
    ],
  ],
};
