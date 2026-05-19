"use client";

import React, { useEffect } from "react";

interface CertificateCardProps {
  name: string;
  certDate: string;
  certNo: string;
}

const CertificateCard = React.forwardRef<HTMLDivElement, CertificateCardProps>(
  ({ name, certDate, certNo }, ref) => {
    // Load Google Fonts dynamically
    useEffect(() => {
      const id = "cert-fonts";
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.crossOrigin = "anonymous";
        link.href =
          "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap";
        document.head.appendChild(link);
      }
    }, []);

    const s = {
      // Wrapper
      container: {
        width: "1123px",
        height: "794px",
        background: "#fbfbfa",
        padding: "36px",
        position: "relative" as const,
        overflow: "hidden" as const,
        flexShrink: 0,
        fontFamily: "'Montserrat', sans-serif",
        boxSizing: "border-box" as const,
      } as React.CSSProperties,

      outerBorder: {
        border: "4px double #1e463a",
        height: "100%",
        width: "100%",
        padding: "28px 40px",
        position: "relative" as const,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: "center" as const,
        color: "#2c3e50",
        boxSizing: "border-box" as const,
      } as React.CSSProperties,

      // Corner ornaments
      cornerTL: {
        position: "absolute" as const,
        width: 30,
        height: 30,
        top: 8,
        left: 8,
        borderTop: "2px solid #caa464",
        borderLeft: "2px solid #caa464",
      } as React.CSSProperties,
      cornerBR: {
        position: "absolute" as const,
        width: 30,
        height: 30,
        bottom: 8,
        right: 8,
        borderBottom: "2px solid #caa464",
        borderRight: "2px solid #caa464",
      } as React.CSSProperties,
      cornerTR: {
        position: "absolute" as const,
        width: 30,
        height: 30,
        top: 8,
        right: 8,
        borderTop: "2px solid #caa464",
        borderRight: "2px solid #caa464",
      } as React.CSSProperties,
      cornerBL: {
        position: "absolute" as const,
        width: 30,
        height: 30,
        bottom: 8,
        left: 8,
        borderBottom: "2px solid #caa464",
        borderLeft: "2px solid #caa464",
      } as React.CSSProperties,

      // Logo
      logoArea: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 700,
        fontSize: 22,
        color: "#1e463a",
      } as React.CSSProperties,

      // Titles
      certTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: 38,
        fontWeight: 600,
        letterSpacing: 3,
        margin: "4px 0 0 0",
        color: "#1e463a",
      } as React.CSSProperties,

      certSubtitle: {
        fontSize: 13,
        fontStyle: "italic",
        letterSpacing: 1,
        margin: "2px 0 0 0",
        color: "#7f8c8d",
      } as React.CSSProperties,

      divider: {
        width: "55%",
        height: 1,
        backgroundColor: "#caa464",
        margin: "0 auto",
      } as React.CSSProperties,

      // Award title
      awardTitle: {
        fontFamily: "'Great Vibes', cursive",
        fontSize: 52,
        color: "#caa464",
        margin: 0,
        lineHeight: 1.1,
      } as React.CSSProperties,

      recipientText: {
        fontSize: 12,
        textTransform: "uppercase" as const,
        letterSpacing: 2,
        margin: "0 0 4px 0",
        color: "#666",
      } as React.CSSProperties,

      recipientName: {
        fontFamily: "'Playfair Display', serif",
        fontSize: 36,
        fontWeight: 600,
        borderBottom: "2px solid #1e463a",
        paddingBottom: 4,
        margin: "0 auto",
        color: "#1a3c30",
        minWidth: 360,
        display: "inline-block",
      } as React.CSSProperties,

      description: {
        fontSize: 13,
        lineHeight: 1.7,
        maxWidth: 780,
        margin: "0 auto",
        color: "#444",
      } as React.CSSProperties,

      thankYou: {
        fontSize: 12,
        fontStyle: "italic",
        marginTop: 6,
        color: "#666",
      } as React.CSSProperties,

      // Footer
      footer: {
        width: "100%",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 8,
      } as React.CSSProperties,

      dateText: {
        fontSize: 13,
        color: "#333",
        margin: 0,
      } as React.CSSProperties,

      medal: {
        width: 62,
        height: 62,
        borderRadius: "50%",
        background: "radial-gradient(circle, #ffe082 0%, #caa464 100%)",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #fff",
        fontSize: 26,
      } as React.CSSProperties,

      certNumber: {
        fontSize: 10,
        letterSpacing: 1,
        color: "#95a5a6",
        margin: 0,
      } as React.CSSProperties,
    };

    return (
      <div ref={ref} style={s.container}>
        <div style={s.outerBorder}>
          {/* Corner ornaments */}
          <div style={s.cornerTL} />
          <div style={s.cornerTR} />
          <div style={s.cornerBL} />
          <div style={s.cornerBR} />

          {/* Logo */}
          <div style={s.logoArea}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo/Logo.svg" alt="ReuseID" width={200} height={200} style={{ objectFit: "contain", marginBottom: -20 }} />
          </div>

          {/* Heading */}
          <div>
            <h1 style={s.certTitle}>SERTIFIKAT PENGHARGAAN</h1>
            <p style={s.certSubtitle}>Certificate of Appreciation</p>
          </div>

          <div style={s.divider} />

          {/* Award title */}
          <h2 style={s.awardTitle}>Pahlawan Hijau</h2>

          {/* Recipient */}
          <div>
            <p style={s.recipientText}>Diberikan kepada:</p>
            <h3 style={s.recipientName}>{name}</h3>
          </div>

          {/* Body */}
          <div>
            <p style={s.description}>
              Sebagai bentuk apresiasi yang mendalam atas kepedulian dan kontribusi nyata Anda dalam
              mendukung program keberlanjutan lingkungan melalui donasi barang, serta secara signifikan
              telah mencapai <strong>1.000 Poin </strong>, serta memberikan dampak positif bagi
              masyarakat yang membutuhkan.
            </p>
            <p style={s.thankYou}>
              Terima kasih atas dedikasi Anda dalam mewujudkan masa depan yang lebih berkelanjutan.
            </p>
          </div>

          {/* Footer */}
          <div style={s.footer}>
            <p style={s.dateText}>{certDate}</p>

            {/* Signature block */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: 36,
                color: "#1e463a",
                lineHeight: 1,
              }}>
                Sendy Dwi Wijaya
              </span>
              <div style={{ width: 180, height: 1, backgroundColor: "#555", margin: "4px 0" }} />
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, color: "#333" }}>
                Sendy Dwi Wijaya
              </span>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: "#666" }}>
                Direktur Eksekutif, PT Pusat Gravitasi
              </span>
            </div>

            <p style={s.certNumber}>No. Sertifikat: {certNo}</p>
          </div>
        </div>
      </div>
    );
  }
);

CertificateCard.displayName = "CertificateCard";
export default CertificateCard;