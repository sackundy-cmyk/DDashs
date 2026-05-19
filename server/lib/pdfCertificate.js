// ============================================================
//  server/lib/pdfCertificate.js — printable certificate PDF
// ============================================================

import PDFDocument from 'pdfkit';

const TYPE_HEADLINE = {
  lesson: 'Certificate of Lesson Completion',
  unit:   'Certificate of Unit Completion',
  course: 'Certificate of Course Completion',
};

// Draw corner ornament (rotated L-shape decoration)
function cornerOrnament(doc, cx, cy, size, flip) {
  const sx = flip ? -1 : 1;
  const sy = flip === 'v' || flip === 'both' ? -1 : 1;
  doc.save();
  doc.translate(cx, cy).scale(sx, sy);
  doc.lineWidth(1.5).strokeColor('#D97706');
  doc.moveTo(0, 0).lineTo(size, 0).lineTo(size, size * 0.35).stroke();
  doc.moveTo(0, 0).lineTo(0, size).lineTo(size * 0.35, size).stroke();
  doc.fillColor('#D97706').circle(0, 0, 4).fill();
  doc.restore();
}

export function streamCertificatePdf(res, data) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
  doc.pipe(res);

  const { studentName, className, teacherName, type, unitTitle, lessonTitle, score, issuedAt } = data;
  const W = doc.page.width;
  const H = doc.page.height;

  // ── Background ───────────────────────────────────────────────
  doc.rect(0, 0, W, H).fill('#FDFCF8');

  // ── Outer gold border ────────────────────────────────────────
  doc.lineWidth(10).strokeColor('#D97706').rect(16, 16, W - 32, H - 32).stroke();

  // ── Inner navy border ────────────────────────────────────────
  doc.lineWidth(2).strokeColor('#0F172A').rect(30, 30, W - 60, H - 60).stroke();

  // ── Corner ornaments ─────────────────────────────────────────
  const ornSize = 36;
  cornerOrnament(doc, 30, 30, ornSize, false);
  cornerOrnament(doc, W - 30, 30, ornSize, 'h');
  cornerOrnament(doc, 30, H - 30, ornSize, 'v');
  cornerOrnament(doc, W - 30, H - 30, ornSize, 'both');

  // ── Header band ──────────────────────────────────────────────
  doc.rect(30, 30, W - 60, 76).fill('#0F172A');

  // D-DASH brand in header
  doc.fillColor('#F8FAFC').font('Helvetica-Bold').fontSize(22)
    .text('D  –  D A S H', 0, 48, { align: 'center', width: W });
  doc.fillColor('#94A3B8').font('Helvetica').fontSize(9)
    .text('M A T H E M A T I C S   L E A R N I N G   P L A T F O R M', 0, 74, { align: 'center', width: W });

  // ── Ornamental divider below header ─────────────────────────
  const divY = 120;
  doc.lineWidth(0.75).strokeColor('#D97706')
    .moveTo(64, divY).lineTo(W - 64, divY).stroke();
  doc.fillColor('#D97706').circle(W / 2, divY, 5).fill();
  doc.fillColor('#D97706').circle(W / 2 - 60, divY, 3).fill();
  doc.fillColor('#D97706').circle(W / 2 + 60, divY, 3).fill();
  doc.lineWidth(0.5).strokeColor('#D97706')
    .moveTo(64, divY + 6).lineTo(W - 64, divY + 6).stroke();

  // ── Headline ─────────────────────────────────────────────────
  doc.fillColor('#1E40AF').font('Helvetica-Bold').fontSize(26)
    .text(TYPE_HEADLINE[type] || 'Certificate of Completion', 64, 136, { align: 'center', width: W - 128 });

  // ── Awarded to ───────────────────────────────────────────────
  doc.fillColor('#64748B').font('Helvetica-Oblique').fontSize(13)
    .text('This certifies that', 0, 178, { align: 'center', width: W });

  // Student name
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(42)
    .text(studentName, 64, 200, { align: 'center', width: W - 128 });

  // Name underline with gold dots
  const nameLineY = 260;
  doc.lineWidth(1.5).strokeColor('#D97706')
    .moveTo(W * 0.22, nameLineY).lineTo(W * 0.78, nameLineY).stroke();
  doc.fillColor('#D97706').circle(W * 0.22, nameLineY, 4).fill();
  doc.fillColor('#D97706').circle(W * 0.78, nameLineY, 4).fill();

  // ── "has successfully completed" ─────────────────────────────
  doc.fillColor('#64748B').font('Helvetica').fontSize(13)
    .text('has successfully completed', 0, nameLineY + 14, { align: 'center', width: W });

  // ── Subject ──────────────────────────────────────────────────
  let subject = className;
  if (type === 'unit'   && unitTitle)   subject = unitTitle;
  if (type === 'lesson' && lessonTitle) subject = lessonTitle;

  doc.fillColor('#1E40AF').font('Helvetica-Bold').fontSize(20)
    .text(subject, 80, nameLineY + 36, { align: 'center', width: W - 160 });

  // Course / unit context line
  let context = '';
  if (type === 'unit'   && className)   context = className;
  if (type === 'lesson' && unitTitle)   context = `${unitTitle}  ·  ${className}`;
  if (context) {
    doc.fillColor('#475569').font('Helvetica').fontSize(12)
      .text(context, 0, nameLineY + 64, { align: 'center', width: W });
  }

  // ── Score badge ───────────────────────────────────────────────
  if (score != null) {
    const badgeW = 160, badgeH = 32, badgeX = (W - badgeW) / 2;
    const badgeY = nameLineY + (context ? 90 : 74);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 16).fill('#16A34A');
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(13)
      .text(`Score: ${score}%`, badgeX, badgeY + 10, { width: badgeW, align: 'center' });
  }

  // ── Bottom ornamental divider ─────────────────────────────────
  const divB = H - 118;
  doc.lineWidth(0.5).strokeColor('#D97706')
    .moveTo(64, divB - 6).lineTo(W - 64, divB - 6).stroke();
  doc.lineWidth(0.75).strokeColor('#D97706')
    .moveTo(64, divB).lineTo(W - 64, divB).stroke();
  doc.fillColor('#D97706').circle(W / 2, divB, 5).fill();
  doc.fillColor('#D97706').circle(W / 2 - 60, divB, 3).fill();
  doc.fillColor('#D97706').circle(W / 2 + 60, divB, 3).fill();

  // ── Footer ────────────────────────────────────────────────────
  const footerY = divB + 18;
  const date = issuedAt ? new Date(issuedAt) : new Date();
  const dateStr = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  // Date (left)
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(12)
    .text(dateStr, 80, footerY);
  doc.lineWidth(1).strokeColor('#CBD5E1')
    .moveTo(80, footerY + 22).lineTo(290, footerY + 22).stroke();
  doc.fillColor('#94A3B8').font('Helvetica').fontSize(9)
    .text('Date issued', 80, footerY + 28);

  // Central seal
  const sealX = W / 2, sealY = footerY + 20;
  doc.circle(sealX, sealY, 32).fill('#0F172A');
  doc.lineWidth(1.5).strokeColor('#D97706').circle(sealX, sealY, 28).stroke();
  doc.fillColor('#D97706').circle(sealX, sealY, 24).stroke();
  doc.fillColor('#F8FAFC').font('Helvetica-Bold').fontSize(9)
    .text('D-DASH', sealX - 28, sealY - 7, { width: 56, align: 'center' });
  doc.fillColor('#94A3B8').font('Helvetica').fontSize(6)
    .text('OFFICIAL', sealX - 28, sealY + 5, { width: 56, align: 'center' });

  // Teacher signature (right)
  if (teacherName) {
    doc.fillColor('#0F172A').font('Helvetica-Oblique').fontSize(14)
      .text(teacherName, W - 310, footerY, { width: 230, align: 'right' });
  }
  doc.lineWidth(1).strokeColor('#CBD5E1')
    .moveTo(W - 310, footerY + 22).lineTo(W - 80, footerY + 22).stroke();
  doc.fillColor('#94A3B8').font('Helvetica').fontSize(9)
    .text('Teacher signature', W - 310, footerY + 28, { width: 230, align: 'right' });

  doc.end();
}
