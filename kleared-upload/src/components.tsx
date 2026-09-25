import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { PHOTO_MAX_PX, PHOTO_JPEG_QUALITY } from "./config";

/* ---------- Signature pad ---------- */
export function SignaturePad({
  onChange,
  clearLabel,
}: {
  onChange: (dataUrl: string | null) => void;
  clearLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);

  useEffect(() => {
    const c = canvasRef.current!;
    const scale = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * scale;
    c.height = rect.height * scale;
    const ctx = c.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#10151b";
  }, []);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    canvasRef.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    hasInk.current = true;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasInk.current) onChange(canvasRef.current!.toDataURL("image/png"));
  };
  const clear = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    hasInk.current = false;
    onChange(null);
  };

  return (
    <div className="sig-wrap">
      <canvas
        ref={canvasRef}
        className="sig-canvas"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
      <div className="sig-line" />
      <button type="button" className="btn btn-ghost" onClick={clear} style={{ marginTop: -20 }}>
        {clearLabel}
      </button>
    </div>
  );
}

/* ---------- Photo capture ---------- */
function downscaleToJpeg(
  source: CanvasImageSource,
  sw: number,
  sh: number
): string {
  const scale = Math.min(1, PHOTO_MAX_PX / Math.max(sw, sh || 1));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d")!.drawImage(source, 0, 0, w, h);
  return c.toDataURL("image/jpeg", PHOTO_JPEG_QUALITY);
}

export function PhotoCapture({
  value,
  onChange,
  labels,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  labels: { take: string; retake: string; start: string; upload: string; noCam: string };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camState, setCamState] = useState<"idle" | "on" | "error">("idle");

  const stop = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };
  useEffect(() => stop, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current!;
      v.srcObject = stream;
      v.muted = true;
      await v.play();
      setCamState("on");
    } catch {
      stop(); // release the track if we grabbed it before failing
      setCamState("error");
    }
  };

  const snap = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const url = downscaleToJpeg(v, v.videoWidth, v.videoHeight);
    stop();
    setCamState("idle");
    onChange(url);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      onChange(downscaleToJpeg(img, img.naturalWidth, img.naturalHeight));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
    e.target.value = "";
  };

  if (value)
    return (
      <div className="photo-wrap">
        <div className="photo-frame">
          <img className="photo-preview" src={value} alt="" />
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => onChange(null)}>
          ↺ {labels.retake}
        </button>
      </div>
    );

  return (
    <div className="photo-wrap">
      {/* The <video> stays mounted so videoRef.current exists when start() attaches
          the stream; we just hide it until the camera is actually on. */}
      <div className="photo-frame" style={{ display: camState === "on" ? "flex" : "none" }}>
        <video ref={videoRef} className="photo-video" playsInline muted />
      </div>
      {camState === "on" ? (
        <button type="button" className="btn btn-primary" onClick={snap}>
          ◉ {labels.take}
        </button>
      ) : (
        <>
          <button
            type="button"
            className="photo-frame photo-frame--empty"
            onClick={start}
            aria-label={labels.start}
          >
            <span aria-hidden>📷</span>
          </button>
          {camState === "error" && <p className="sub center photo-note">{labels.noCam}</p>}
          <button type="button" className="btn btn-primary" onClick={start}>
            📷 {labels.start}
          </button>
        </>
      )}
      <label className="btn btn-ghost photo-upload-btn">
        {labels.upload}
        <input type="file" accept="image/*" capture="user" onChange={onFile} hidden />
      </label>
    </div>
  );
}

/* ---------- QR code ---------- */
export function QR({ value, size = 116 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) {
      QRCode.toCanvas(ref.current, value, { width: size, margin: 1, color: { dark: "#10151b", light: "#ffffff" } });
    }
  }, [value, size]);
  return <canvas ref={ref} />;
}

/* ---------- certificate render + download ---------- */
export interface CertRenderData {
  name: string;
  company: string;
  trade: string;
  gc: string;
  site: string;
  certId: string;
  issued: string; // pre-formatted
  expires: string; // pre-formatted
  photo: string; // dataURL or ""
  verifyUrl: string;
  demo?: boolean; // demo run — stamp a "NOT VALID" watermark on the file
  demoLabel?: string; // localized watermark text
  labels: {
    docTitle: string;
    passed: string;
    gcSite: string;
    certId: string;
    issuedValid: string;
    verifyHint: string;
    org: string;
    tagline: string;
  };
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxW: number, weight: string, startPx: number, family: string) {
  let px = startPx;
  while (px > 12) {
    ctx.font = `${weight} ${px}px ${family}`;
    if (ctx.measureText(text).width <= maxW) break;
    px -= 2;
  }
  return px;
}

export async function renderCertToCanvas(d: CertRenderData): Promise<HTMLCanvasElement> {
  const W = 1000, H = 1400, PAD = 80;
  const INK = "#10151b", GRAY = "#5b6673", HIVIS = "#ffd60a";
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  try { await (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts?.ready; } catch { /* fonts optional */ }

  // background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // hi-vis stripe band across the top
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, 64); ctx.clip();
  ctx.fillStyle = "#0e1116"; ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = HIVIS;
  const sw = 30;
  for (let i = -64; i < W + 64; i += sw * 2) {
    ctx.beginPath();
    ctx.moveTo(i, 0); ctx.lineTo(i + sw, 0); ctx.lineTo(i + sw - 64, 64); ctx.lineTo(i - 64, 64);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // wordmark + PASSED badge
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = INK;
  ctx.font = "64px 'Anton', Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("KLEARED", PAD, 168);
  ctx.fillStyle = "#1a9e57";
  ctx.font = "800 26px 'Inter', Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("✓ " + d.labels.passed.toUpperCase(), W - PAD, 162);

  // doc title
  ctx.fillStyle = GRAY;
  ctx.font = "500 22px 'Inter', Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(d.labels.docTitle, PAD, 206);

  // divider
  ctx.strokeStyle = "#e6e9ee"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(PAD, 240); ctx.lineTo(W - PAD, 240); ctx.stroke();

  // photo
  const photoSize = 230, photoX = PAD, photoY = 288;
  if (d.photo) {
    try {
      const img = await loadImage(d.photo);
      ctx.save();
      roundRectPath(ctx, photoX, photoY, photoSize, photoSize, 18);
      ctx.clip();
      // cover-fit
      const scale = Math.max(photoSize / img.width, photoSize / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      ctx.drawImage(img, photoX + (photoSize - dw) / 2, photoY + (photoSize - dh) / 2, dw, dh);
      ctx.restore();
    } catch { /* skip photo */ }
    ctx.strokeStyle = HIVIS; ctx.lineWidth = 5;
    roundRectPath(ctx, photoX, photoY, photoSize, photoSize, 18); ctx.stroke();
  }

  // name + company/trade
  const textX = d.photo ? photoX + photoSize + 44 : PAD;
  const textMaxW = W - PAD - textX;
  const namePx = fitFont(ctx, d.name || "", textMaxW, "800", 48, "'Inter', Arial, sans-serif");
  ctx.fillStyle = INK; ctx.font = `800 ${namePx}px 'Inter', Arial, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(d.name || "", textX, photoY + 78);
  ctx.fillStyle = GRAY; ctx.font = "400 24px 'Inter', Arial, sans-serif";
  const co = [d.company, d.trade].filter(Boolean).join(" · ");
  ctx.fillText(co, textX, photoY + 118);

  // details block
  let dy = 620;
  const label = (txt: string) => {
    ctx.fillStyle = "#8792a0"; ctx.font = "700 15px 'Inter', Arial, sans-serif";
    ctx.fillText(txt.toUpperCase(), PAD, dy); dy += 30;
  };
  const value = (txt: string, mono = false, color = INK, size = 24) => {
    ctx.fillStyle = color;
    ctx.font = `${mono ? "700" : "600"} ${size}px ${mono ? "ui-monospace, Menlo, monospace" : "'Inter', Arial, sans-serif"}`;
    ctx.fillText(txt, PAD, dy); dy += size + 14;
  };
  label(d.labels.gcSite); value(d.gc); value(d.site, false, GRAY, 20); dy += 14;
  label(d.labels.certId); value(d.certId, true); dy += 14;
  label(d.labels.issuedValid); value(`${d.issued}  →  ${d.expires}`, false, INK, 22);

  // QR + hint (bottom right)
  const qrSize = 250, qrX = W - PAD - qrSize, qrY = H - 250 - qrSize;
  try {
    const qrDataUrl = await QRCode.toDataURL(d.verifyUrl, {
      width: qrSize, margin: 1, color: { dark: "#10151b", light: "#ffffff" },
    });
    const qrImg = await loadImage(qrDataUrl);
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = GRAY; ctx.font = "600 17px 'Inter', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(d.labels.verifyHint, qrX + qrSize / 2, qrY + qrSize + 30);
  } catch { /* skip QR */ }

  // footer
  ctx.strokeStyle = HIVIS; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(PAD, H - 120); ctx.lineTo(W - PAD, H - 120); ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = INK; ctx.font = "800 22px 'Inter', Arial, sans-serif";
  ctx.fillText("KLEARED", W / 2, H - 78);
  ctx.fillStyle = GRAY; ctx.font = "400 18px 'Inter', Arial, sans-serif";
  ctx.fillText(`${d.labels.tagline}  ·  ${d.labels.org}`, W / 2, H - 50);

  // Demo watermark — a big diagonal "NOT VALID" stamp so a demo download can
  // never be passed off as a real certificate.
  if (d.demo) {
    const mark = d.demoLabel || "DEMO — NOT VALID";
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#d11a2a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let px = 108;
    ctx.font = `900 ${px}px 'Anton', Arial, sans-serif`;
    while (ctx.measureText(mark).width > W * 1.08 && px > 40) {
      px -= 6;
      ctx.font = `900 ${px}px 'Anton', Arial, sans-serif`;
    }
    ctx.fillText(mark, 0, 0);
    ctx.restore();
  }

  return canvas;
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadCertImage(d: CertRenderData, filename: string) {
  const canvas = await renderCertToCanvas(d);
  triggerDownload(canvas.toDataURL("image/png"), filename + ".png");
}

export async function downloadCertPdf(d: CertRenderData, filename: string) {
  const canvas = await renderCertToCanvas(d);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const ratio = Math.min((pw - margin * 2) / canvas.width, (ph - margin * 2) / canvas.height);
  const w = canvas.width * ratio, h = canvas.height * ratio;
  // JPEG (not PNG) keeps the file in the hundreds-of-KB range instead of ~5 MB,
  // so a worker can actually text or email their certificate.
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
  pdf.save(filename + ".pdf");
}

/* ---------- tiny hash router ---------- */
export function useHashRoute(): string {
  const [hash, setHash] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const fn = () => setHash(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return hash;
}

export const go = (path: string) => {
  window.location.hash = path;
  window.scrollTo(0, 0);
};
