"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Extract a page id from a scanned QR value (full URL or bare code). */
export function parsePageId(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  const marker = text.lastIndexOf("/p/");
  if (marker !== -1) {
    const rest = text.slice(marker + 3);
    const id = rest.split(/[/?#]/)[0];
    return id || null;
  }
  // Bare code: allow letters, digits and hyphens only.
  if (/^[a-z0-9-]+$/i.test(text)) return text;
  return null;
}

export default function Scanner() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);

  const goTo = (id: string) => {
    void stop();
    router.push(`/p/${id}`);
  };

  const stop = async () => {
    const s = scannerRef.current;
    scannerRef.current = null;
    if (s) {
      try {
        await s.stop();
        await s.clear();
      } catch {
        /* already stopped */
      }
    }
  };

  const startScan = async () => {
    setError(null);
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader", { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded: string) => {
          const id = parsePageId(decoded);
          if (id) goTo(id);
        },
        () => {
          /* per-frame decode misses are normal; ignore */
        },
      );
    } catch {
      setScanning(false);
      setError("Couldn't open the camera. Enter a page code below, or pick a sample page.");
      await stop();
    }
  };

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parsePageId(manual);
    if (id) goTo(id);
    else setError("That doesn't look like a page code. Try a sample page below.");
  };

  useEffect(() => {
    return () => {
      void stop();
    };
  }, []);

  return (
    <div className="scanner">
      <div className="scanner__stage">
        {/* html5-qrcode mounts the camera stream here */}
        <div id="qr-reader" style={{ width: "100%", height: "100%" }} />

        {!scanning && (
          <div className="scanner__idle">
            <svg className="scanner__glyph" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <rect x="8" y="8" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <p>Point at the QR code printed on your module page.</p>
          </div>
        )}

        <div className="finder" aria-hidden>
          <span className="finder__corner finder__corner--tl" />
          <span className="finder__corner finder__corner--tr" />
          <span className="finder__corner finder__corner--bl" />
          <span className="finder__corner finder__corner--br" />
          <span className="finder__line" />
        </div>
      </div>

      <div className="scanner__actions">
        {!scanning ? (
          <button className="btn btn--solid" onClick={startScan}>
            Scan a QR code
          </button>
        ) : (
          <button className="btn btn--ghost" onClick={() => void stop().then(() => setScanning(false))}>
            Stop camera
          </button>
        )}
      </div>

      <form className="manual" onSubmit={submitManual}>
        <input
          className="manual__input"
          placeholder="…or paste a page code / link"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          aria-label="Page code"
        />
        <button className="btn btn--ghost" type="submit">
          Open
        </button>
      </form>

      {error ? (
        <p className="scanner__error">{error}</p>
      ) : (
        <p className="scanner__hint">Camera stays on your device — nothing is uploaded.</p>
      )}
    </div>
  );
}
