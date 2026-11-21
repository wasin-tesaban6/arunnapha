'use client';
import { useState } from 'react';

export default function Gallery({ images, alt = '' }) {
  const [open, setOpen] = useState(null);
  if (!images?.length) return null;
  return (
    <>
      <div className="gallery">
        {images.map((u, i) => <img key={i} src={u} alt={alt} loading={i > 1 ? 'lazy' : 'eager'} decoding="async" onClick={() => setOpen(u)} />)}
      </div>
      {open ? <div className="lightbox" onClick={() => setOpen(null)}><img src={open} alt={alt} /></div> : null}
    </>
  );
}
