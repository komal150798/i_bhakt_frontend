import React from 'react';

export const BRAND_NAME = 'iBhakt';

/** Wraps each occurrence of the product name for correct casing and .brand-mark typography inside headings and body copy. */
export function textWithBrandMark(text: string): React.ReactNode {
  if (!text.includes(BRAND_NAME)) return text;
  const parts = text.split(BRAND_NAME);
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 ? <span className="brand-mark">{BRAND_NAME}</span> : null}
    </React.Fragment>
  ));
}
