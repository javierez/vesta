"use client";

import React from 'react';

interface Props {
  data: unknown;
}

export function NotaEncargoDocumentTest({ data: _data }: Props) {
  return (
    <div className="bg-white text-black font-sans">
      <p>Test component</p>
    </div>
  );
}