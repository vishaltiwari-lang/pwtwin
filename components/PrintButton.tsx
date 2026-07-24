"use client";

export default function PrintButton() {
  return (
    <button className="btn btn--solid" onClick={() => window.print()}>
      Print QR sheet
    </button>
  );
}
