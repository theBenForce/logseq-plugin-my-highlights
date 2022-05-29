
export const jsonToLogseq = (props: Record<string, string|undefined>): string => {
  const entries = [] as Array<string>;
  for (const key of Object.keys(props)) {
    const value = props[key];
    if (!value) continue;
    entries.push(`${key}:: ${value}`);
  }

  return entries.join('\n');
}