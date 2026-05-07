// ============================================================
//  server/lib/pdfCertificate.js — printable certificate PDF
//  Modeled on pdfReport.js. Pipes to res.
// ============================================================

import PDFDocument from 'pdfkit';

const TYPE_HEADLINE = {
  lesson: 'Certificate of Lesson Completion',
  unit:   'Certificate of Unit Completion',
  course: 'Certificate of Course Completion',
};

export function streamCertificatePdf(res, data) {
  // Landscape A4 — feels more like a wall certificate
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36 });
  doc.pipe(res);

  const { studentName, className, teacherName, type, unitTitle, lessonTitle, score, issuedAt } = data;
  const W = doc.page.width;
  const H = doc.page.height;

  // ── Outer decorative border ─────────────────────────────────
  doc.lineWidth(8).strokeColor('#1E6FD9').rect(24, 24, W - 48, H - 48).stroke();
  doc.lineWidth(1).strokeColor('#1E6FD9').rect(40, 40, W - 80, H - 80).stroke();

  // ── Top brand strip ─────────────────────────────────────────
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(14)
    .text('D-DASH', 0, 64, { align: 'center', width: W });
  doc.fillColor('#64748B').font('Helvetica').fontSize(10)
    .text('Mathematics Learning Platform', 0, 82, { align: 'center', width: W });

  // ── Headline ────────────────────────────────────────────────
  doc.fillColor('#1E6FD9').font('Helvetica-Bold').fontSize(28)
    .text(TYPE_HEADLINE[type] || 'Certificate of Completion', 0, 130, { align: 'center', width: W });

  // ── Awarded to ──────────────────────────────────────────────
  doc.fillColor('#64748B').font('Helvetica').fontSize(13)
    .text('This certifies that', 0, 200, { align: 'center', width: W });

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(40)
    .text(studentName, 0, 226, { align: 'center', width: W });

  // Underline under the name
  const nameY = 286;
  doc.lineWidth(1.5).strokeColor('#CBD5E1')
    .moveTo(W * 0.25, nameY).lineTo(W * 0.75, nameY).stroke();

  doc.fillColor('#64748B').font('Helvetica').fontSize(13)
    .text('has successfully completed', 0, nameY + 18, { align: 'center', width: W });

  // ── Subject (course / unit / lesson) ────────────────────────
  let subject = className;
  if (type === 'unit'   && unitTitle)   subject = `${unitTitle} — ${className}`;
  if (type === 'lesson' && lessonTitle) subject = `${lessonTitle} — ${unitTitle ? unitTitle + ' · ' : ''}${className}`;

  doc.fillColor('#1E6FD9').font('Helvetica-Bold').fontSize(22)
    .text(subject, 0, nameY + 44, { align: 'center', width: W });

  // ── Score (if provided) ─────────────────────────────────────
  if (score != null) {
    doc.fillColor('#16A34A').font('Helvetica-Bold').fontSize(16)
      .text(`with an average score of ${score}%`, 0, nameY + 86, { align: 'center', width: W });
  }

  // ── Footer: date + signature ────────────────────────────────
  const footerY = H - 110;
  const date = issuedAt ? new Date(issuedAt) : new Date();
  const dateStr = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  // Date block (left)
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(12)
    .text(dateStr, 80, footerY);
  doc.lineWidth(1).strokeColor('#CBD5E1')
    .moveTo(80, footerY + 22).lineTo(280, footerY + 22).stroke();
  doc.fillColor('#64748B').font('Helvetica').fontSize(9)
    .text('Date issued', 80, footerY + 28);

  // Teacher signature (right)
  if (teacherName) {
    doc.fillColor('#0F172A').font('Helvetica-Oblique').fontSize(14)
      .text(teacherName, W - 280, footerY, { width: 200, align: 'left' });
  }
  doc.lineWidth(1).strokeColor('#CBD5E1')
    .moveTo(W - 280, footerY + 22).lineTo(W - 80, footerY + 22).stroke();
  doc.fillColor('#64748B').font('Helvetica').fontSize(9)
    .text('Teacher signature', W - 280, footerY + 28);

  doc.end();
}
