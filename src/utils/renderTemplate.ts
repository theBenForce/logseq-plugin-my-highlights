


const dataRx = /{(\d+|[a-z$_][a-z\d$_]*?(?:\.[a-z\d$_]*?)*?)}/gi;

export const renderTemplate = <Data = Record<string, any>>(template: string, data: Record<string, string>) => template.replace(
  dataRx,
  (raw, key: string) => {
    // @ts-ignore
    if (!data[key]) return raw;

    let result = data;

    for (const property of key.split('.')) {
      // @ts-ignore
      result = result[property] ?? '';
    }

    return String(result);
  }
)
