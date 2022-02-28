
import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';
import { pause } from './pause';

export const goToPage = async (page: string, logseq: ILSPluginUser) => {
  logseq.App.pushState('page', { name: page });
  await pause(300);
  const currentPage = await logseq.Editor.getCurrentPage()
  if (currentPage?.originalName !== page) throw new Error(`Could not go to page ${page}`);
}