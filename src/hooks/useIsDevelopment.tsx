import React, { useState } from "react";

export const useIsDevelopment = () => {
  const [isDevelopment] = useState(process.env.NODE_ENV === "development");

  return isDevelopment;
}