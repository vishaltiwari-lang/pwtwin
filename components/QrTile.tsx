"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { PageSummary } from "@/lib/types";

export default function QrTile({ page }: { page: PageSummary }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const origin = window.location.origin;
    const target = `${origin}/p/${page.id}`;
    setUrl(target);
    QRCode.toDataURL(target, {
      margin: 1,
      width: 344,
      errorCorrectionLevel: "M",
      color: { dark: "#141b2e", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [page.id]);

  return (
    <div className="qrtile" data-subject={page.subject}>
      <span className="qrtile__spine" aria-hidden />
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="qrtile__img" src={dataUrl} alt={`QR code for ${page.title}`} width={172} height={172} />
      ) : (
        <div className="qrtile__imgph">generating…</div>
      )}
      <span className="qrtile__subject">{page.subject}</span>
      <span className="qrtile__title">{page.title}</span>
      <span className="qrtile__cite">
        {page.book}
        <br />
        {page.chapter} · p.{page.pageNumber}
      </span>
      <span className="qrtile__url">{url}</span>
    </div>
  );
}
