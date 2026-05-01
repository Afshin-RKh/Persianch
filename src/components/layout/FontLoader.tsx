"use client";

export default function FontLoader() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&family=Estedad:wght@100..900&family=Lalezar&display=swap"
        rel="stylesheet"
        media="print"
        onLoad={(e) => { (e.currentTarget as HTMLLinkElement).media = "all"; }}
      />
      <noscript>
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&family=Estedad:wght@100..900&family=Lalezar&display=swap"
          rel="stylesheet"
        />
      </noscript>
    </>
  );
}
