import React from 'react';

export const useLogseq = () => {
  const [result] = React.useState(window.logseq);

  return result;
};