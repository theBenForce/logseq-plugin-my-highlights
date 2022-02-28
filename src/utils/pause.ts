
export const pause = (ms: number = 100) => new Promise((resolve) => setTimeout(() => resolve(null), ms));