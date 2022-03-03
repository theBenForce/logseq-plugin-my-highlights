import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export const SettingsSchema: Array<SettingSchemaDesc> = [
  {
    title: 'Highlight Path',
    key: 'highlight_path',
    description: `Path where new highlights should be imported to.
Variables include:
{type} - book,web,etc...
{title} - title provided by article
{zettel} - a datetime string (20220101000000)`,
    default: "highlights/{type}/{title}",
    type: "string"
  }
];