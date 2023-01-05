import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export const SettingsSchema: Array<SettingSchemaDesc> = [
  {
    title: 'Highlight Location',
    key: 'highlight_location',
    default: 'page',
    type: 'enum',
    enumChoices: ['page', 'journal'],
    description: 'Should highlights be imported into a page for the book or into the journal and linked to the book?'
  },
  {
    title: 'Highlight Path',
    key: 'highlight_path',
    description: `Path where new highlights should be imported to.
Variables include:
{type} - book,web,etc...
{title} - title provided by article
{author} - author provided by article
{zettel} - a datetime string (20220101000000)`,
    default: "{title}/highlights",
    type: "string"
  },
  {
    title: 'Fallback Author',
    key: 'default_author',
    description: 'Author value to use when actual author is unknown',
    default: 'Unknown Author',
    type: "string"
  },
  {
    title: 'Author First Name First',
    key: 'author_first_name_first',
    description: 'When adding author links, put their first name first',
    default: false,
    type: 'boolean'
  }
];