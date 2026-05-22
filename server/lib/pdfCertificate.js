// ============================================================
//  server/lib/pdfCertificate.js — printable certificate PDF
//  Portrait A4 · rainbow gradient border · Great Vibes name
// ============================================================

import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.join(__dirname, '..', 'assets', 'fonts');

function fontFile(name) {
  const p = path.join(FONTS_DIR, name);
  return existsSync(p) ? p : null;
}

// ── Color helpers ─────────────────────────────────────────────
function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
function mixHex(c1, c2, t) {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ── Gradient border layer (green=left → violet=right) ─────────
function gradientBorderLayer(doc, W, H, inset, lw) {
  const N = 80;
  const GREEN = '#2ECC71', VIOLET = '#8E44AD';
  const x = inset, y = inset, w = W - inset * 2, h = H - inset * 2;
  // Top
  for (let i = 0; i < N; i++) {
    doc.lineWidth(lw).strokeColor(mixHex(GREEN, VIOLET, i / (N - 1)))
      .moveTo(x + i * (w / N), y).lineTo(x + (i + 1) * (w / N), y).stroke();
  }
  // Bottom
  for (let i = 0; i < N; i++) {
    doc.lineWidth(lw).strokeColor(mixHex(GREEN, VIOLET, i / (N - 1)))
      .moveTo(x + i * (w / N), y + h).lineTo(x + (i + 1) * (w / N), y + h).stroke();
  }
  // Left (solid green)
  doc.lineWidth(lw).strokeColor(GREEN).moveTo(x, y).lineTo(x, y + h).stroke();
  // Right (solid violet)
  doc.lineWidth(lw).strokeColor(VIOLET).moveTo(x + w, y).lineTo(x + w, y + h).stroke();
}

// ── Corner filigree ornament ──────────────────────────────────
function cornerOrnament(doc, cx, cy, sz, flipH, flipV) {
  doc.save();
  doc.translate(cx, cy).scale(flipH ? -1 : 1, flipV ? -1 : 1);
  doc.lineWidth(2).strokeColor('#D4AF37');
  doc.moveTo(0, 0).lineTo(sz, 0).lineTo(sz, sz * 0.38).stroke();
  doc.moveTo(0, 0).lineTo(0, sz).lineTo(sz * 0.38, sz).stroke();
  doc.lineWidth(0.8);
  doc.moveTo(7, 7).lineTo(sz * 0.65, 7).stroke();
  doc.moveTo(7, 7).lineTo(7, sz * 0.65).stroke();
  doc.fillColor('#D4AF37').circle(0, 0, 4).fill();
  doc.fillColor('#D4AF37').circle(sz * 0.38, sz * 0.38, 2).fill();
  doc.restore();
}

// ── D-DASH programmatic circle logo ───────────────────────────
function drawLogo(doc, cx, cy, r) {
  // Outer navy circle
  doc.circle(cx, cy, r).fill('#1E3A8A');
  // Decorative dot ring
  doc.fillColor('#4A90D9');
  for (let a = 0; a < 360; a += 18) {
    const rad = (a * Math.PI) / 180;
    doc.circle(cx + (r - 3) * Math.cos(rad), cy + (r - 3) * Math.sin(rad), 2).fill();
  }
  // Gold ring
  doc.lineWidth(2.5).strokeColor('#D4AF37').circle(cx, cy, r - 8).stroke();
  // Inner dark circle
  doc.circle(cx, cy, r - 11).fill('#0D2461');

  // Mini equation display at top
  const eqW = r * 0.7, eqH = r * 0.22;
  const eqX = cx - eqW / 2, eqY = cy - r * 0.46;
  doc.roundedRect(eqX, eqY, eqW, eqH, 3).fill('#1E4DB7');
  doc.fillColor('#FFD700').font('Helvetica-Bold').fontSize(Math.max(6, Math.round(r * 0.12)))
    .text('2x+3=11', eqX + 2, eqY + eqH * 0.2, { width: eqW - 4, align: 'center', lineBreak: false });

  // D-DASH label
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(Math.round(r * 0.26))
    .text('D-DASH', cx - r * 0.5, cy - r * 0.18, { width: r, align: 'center', lineBreak: false });

  // MrMustafa in gold
  doc.fillColor('#FFD700').font('Helvetica-BoldOblique').fontSize(Math.round(r * 0.175))
    .text('MrMustafa', cx - r * 0.52, cy + r * 0.13, { width: r * 1.04, align: 'center', lineBreak: false });

  // MATH TEACHER label
  doc.fillColor('#94A3B8').font('Helvetica').fontSize(Math.max(5, Math.round(r * 0.09)))
    .text('MATH TEACHER', cx - r * 0.55, cy + r * 0.35, { width: r * 1.1, align: 'center', lineBreak: false });

  // 5 gold dots (stars)
  const starY = cy + r * 0.62;
  for (let i = -2; i <= 2; i++) {
    doc.fillColor(Math.abs(i) === 2 ? '#8A6B00' : '#FFD700')
      .circle(cx + i * r * 0.22, starY, r * 0.055).fill();
  }
}

// ── Wax seal ──────────────────────────────────────────────────
function drawWaxSeal(doc, cx, cy) {
  const R = 32;
  // Radial spokes
  doc.lineWidth(1.5).strokeColor('#909090');
  for (let a = 0; a < 360; a += 20) {
    const rad = (a * Math.PI) / 180;
    doc.moveTo(cx + (R - 2) * Math.cos(rad), cy + (R - 2) * Math.sin(rad))
       .lineTo(cx + (R + 5) * Math.cos(rad), cy + (R + 5) * Math.sin(rad)).stroke();
  }
  // Concentric circles
  doc.circle(cx, cy, R).fill('#B8B8B8');
  doc.circle(cx, cy, R - 4).fill('#D0D0D0');
  doc.lineWidth(1.5).strokeColor('#D4AF37').circle(cx, cy, R - 8).stroke();
  doc.circle(cx, cy, R - 11).fill('#F5EDD8');
  // "D" letter
  doc.fillColor('#1a2a6c').font('Helvetica-Bold').fontSize(20)
    .text('D', cx - 7, cy - 12, { width: 14, align: 'center', lineBreak: false });
}

// ── Gold ornamental divider ────────────────────────────────────
function goldDivider(doc, y, W, thick = 1.5, thin = 0.5) {
  doc.lineWidth(thick).strokeColor('#D4AF37').moveTo(65, y + 3).lineTo(W - 65, y + 3).stroke();
  doc.lineWidth(thin).strokeColor('#D4AF37').moveTo(65, y - 2).lineTo(W - 65, y - 2).stroke();
  doc.fillColor('#D4AF37')
    .circle(W / 2, y + 0.5, 5).fill()
    .circle(W / 2 - 85, y + 0.5, 3).fill()
    .circle(W / 2 + 85, y + 0.5, 3).fill();
}

// ── Main export ───────────────────────────────────────────────
export function streamCertificatePdf(res, data) {
  const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margin: 0 });
  doc.pipe(res);

  const { studentName, className, teacherName, type, unitTitle, lessonTitle, score, issuedAt } = data;
  const W = doc.page.width;   // 595.28
  const H = doc.page.height;  // 841.89

  // ── Background ────────────────────────────────────────────────
  doc.rect(0, 0, W, H).fill('#FDFCF8');

  // ── Faint background math symbols ─────────────────────────────
  [
    { s: 'π',  x: 24,     y: 36,      sz: 80, c: '#C8DCF0' },
    { s: 'Σ',  x: W - 88, y: 26,      sz: 90, c: '#D8CAF8' },
    { s: '√',  x: 16,     y: 210,     sz: 68, c: '#C8DCF0' },
    { s: 'Δ',  x: W - 78, y: 196,     sz: 62, c: '#D8CAF8' },
    { s: '∫',  x: 20,     y: H - 215, sz: 75, c: '#C8DCF0' },
    { s: 'π',  x: W - 82, y: H - 232, sz: 72, c: '#D8CAF8' },
    { s: '÷',  x: 18,     y: H - 112, sz: 58, c: '#C8DCF0' },
    { s: '×',  x: W - 68, y: H - 110, sz: 58, c: '#D8CAF8' },
  ].forEach(({ s, x, y, sz, c }) => {
    doc.fillColor(c).font('Times-Italic').fontSize(sz).text(s, x, y, { lineBreak: false });
  });

  // ── Gradient border (3 layers + inner gold trim) ──────────────
  gradientBorderLayer(doc, W, H, 12, 7);
  gradientBorderLayer(doc, W, H, 18, 4);
  gradientBorderLayer(doc, W, H, 22, 2.5);
  gradientBorderLayer(doc, W, H, 24.5, 1);
  doc.lineWidth(1).strokeColor('#D4AF37').rect(27, 27, W - 54, H - 54).stroke();

  // ── Corner ornaments ──────────────────────────────────────────
  const osz = 44;
  cornerOrnament(doc, 30, 30, osz, false, false);
  cornerOrnament(doc, W - 30, 30, osz, true, false);
  cornerOrnament(doc, 30, H - 30, osz, false, true);
  cornerOrnament(doc, W - 30, H - 30, osz, true, true);

  // ── D-DASH logo ───────────────────────────────────────────────
  drawLogo(doc, W / 2, 100, 55);

  // ── D-DASH heading ────────────────────────────────────────────
  doc.fillColor('#1a2a6c').font('Helvetica-Bold').fontSize(30)
    .text('D-DASH', 0, 166, { align: 'center', width: W });

  doc.fillColor('#444444').font('Helvetica').fontSize(10)
    .text('M A T H E M A T I C S   L E A R N I N G   P L A T F O R M', 0, 201, { align: 'center', width: W });

  // ── Ornamental divider ────────────────────────────────────────
  goldDivider(doc, 224, W);

  // ── CERTIFICATE OF COMPLETION ─────────────────────────────────
  doc.fillColor('#059669').font('Helvetica-Bold').fontSize(25)
    .text('CERTIFICATE OF COMPLETION', 55, 244, { align: 'center', width: W - 110 });

  // ── Thin accent line ──────────────────────────────────────────
  doc.lineWidth(0.75).strokeColor('#D4AF37').moveTo(90, 284).lineTo(W - 90, 284).stroke();

  // ── This hereby certifies that ────────────────────────────────
  doc.fillColor('#555555').font('Times-Italic').fontSize(14)
    .text('This hereby certifies that', 0, 298, { align: 'center', width: W });

  // ── Student name ──────────────────────────────────────────────
  const gvPath = fontFile('GreatVibes-Regular.ttf');
  try {
    doc.font(gvPath || 'Times-Italic');
  } catch {
    doc.font('Times-Italic');
  }
  doc.fillColor('#B8860B').fontSize(gvPath ? 62 : 54)
    .text(studentName, 65, 318, { align: 'center', width: W - 130 });

  // Gold underline with dots
  const nlY = 410;
  doc.lineWidth(1.5).strokeColor('#D4AF37').moveTo(W * 0.17, nlY).lineTo(W * 0.83, nlY).stroke();
  doc.fillColor('#D4AF37')
    .circle(W * 0.17, nlY, 4).fill()
    .circle(W * 0.83, nlY, 4).fill()
    .circle(W / 2, nlY, 3).fill();

  // ── FOR SUCCESSFUL COMPLETION OF ─────────────────────────────
  doc.font('Helvetica').fillColor('#666666').fontSize(12)
    .text('FOR SUCCESSFUL COMPLETION OF:', 0, 424, { align: 'center', width: W });

  // ── Subject title ─────────────────────────────────────────────
  let subject = className || '';
  if (type === 'unit'   && unitTitle)   subject = unitTitle;
  if (type === 'lesson' && lessonTitle) subject = lessonTitle;

  doc.font('Helvetica-Bold').fillColor('#1a2a6c').fontSize(21)
    .text(subject.toUpperCase(), 65, 445, { align: 'center', width: W - 130 });

  // ── Context line (unit | topic | grade) ──────────────────────
  let context = '';
  if (type === 'unit'   && className)             context = `${unitTitle || ''} | ${className}`;
  if (type === 'lesson' && unitTitle && className) context = `${unitTitle} | Grade 5 Mathematics`;
  if (type === 'course' && className)              context = `${className} | Grade 5 Mathematics`;

  if (context) {
    doc.font('Helvetica').fillColor('#D97706').fontSize(13)
      .text(context, 0, 479, { align: 'center', width: W });
  }

  // ── Date issued ───────────────────────────────────────────────
  const date = issuedAt ? new Date(issuedAt) : new Date();
  const dateStr = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.font('Helvetica').fillColor('#555555').fontSize(13)
    .text(`Date Issued: ${dateStr}`, 0, context ? 500 : 482, { align: 'center', width: W });

  // ── Score badge ───────────────────────────────────────────────
  if (score != null) {
    const bY = context ? 526 : 508;
    const bW = 148, bH = 30, bX = (W - bW) / 2;
    doc.roundedRect(bX, bY, bW, bH, 15).fill('#059669');
    doc.font('Helvetica-Bold').fillColor('#fff').fontSize(13)
      .text(`Score: ${score}%`, bX, bY + 9, { width: bW, align: 'center' });
  }

  // ── Bottom ornamental divider ─────────────────────────────────
  goldDivider(doc, H - 146, W);

  // ── Footer ────────────────────────────────────────────────────
  const fY = H - 128;
  const sigY = fY + 28;

  // Left: teacher signature
  if (teacherName) {
    doc.font('Times-Italic').fillColor('#0F172A').fontSize(14)
      .text(teacherName, 62, fY, { width: 180 });
  }
  doc.lineWidth(1).strokeColor('#94A3B8').moveTo(62, sigY).lineTo(242, sigY).stroke();
  doc.font('Helvetica').fillColor('#888888').fontSize(9).text('Teacher Signature', 62, sigY + 6);

  // Center: wax seal
  drawWaxSeal(doc, W / 2, fY + 22);
  doc.font('Helvetica').fillColor('#555555').fontSize(8)
    .text('D-DASH OFFICIAL', W / 2 - 42, fY + 62, { width: 84, align: 'center' });

  // Right: official seal
  doc.font('Times-Italic').fillColor('#0F172A').fontSize(14)
    .text('D-DASH', W - 242, fY, { width: 180, align: 'right' });
  doc.lineWidth(1).strokeColor('#94A3B8').moveTo(W - 242, sigY).lineTo(W - 62, sigY).stroke();
  doc.font('Helvetica').fillColor('#888888').fontSize(9)
    .text('Official Seal', W - 242, sigY + 6, { width: 180, align: 'right' });

  doc.end();
}
