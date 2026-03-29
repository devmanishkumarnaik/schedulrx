'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button onClick={handleCopy} className="btn-accent text-xs py-2 px-4 shrink-0 flex items-center gap-1.5">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
