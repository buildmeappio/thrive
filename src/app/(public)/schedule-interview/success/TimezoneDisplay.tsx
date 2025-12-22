"use client";

import { useEffect, useState } from "react";

export const TimezoneDisplay = () => {
  const [timezone, setTimezone] = useState<string>("");

  // Set timezone client-side only to avoid SSR UTC issue
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  if (!timezone) {
    return <span>Loading...</span>;
  }

  return <span>{timezone}</span>;
};
