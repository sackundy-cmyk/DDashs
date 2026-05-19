// ============================================================
//  server/lib/pdfReport.js — weekly parent report (pdfkit)
// ============================================================

import PDFDocument from 'pdfkit';

const NAVY  = '#0F172A';
const BLUE  = '#1E40AF';
const GOLD  = '#D97706';
const MUTED = '#64748B';
const LIGHT = '#F8FAFC';
const PW    = 595 - 96; // usable width (A4 portrait, 48px margin each side)

function scoreColor(pct) {
  if (pct == null) return MUTED;
  if (pct >= 80) return '#16A34A';
  if (pct >= 60) return '#D97706';
  return '#DC2626';
}

export function streamWeeklyReportPdf(res, data) {
  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  doc.pipe(res);

  const { student, parentName, summary, lessons, strongest, weakest, teacherNote, period } = data;
  const W = doc.page.width;

  // ── Header band ───────────────────────────────────────────────
  doc.rect(0, 0, W, 108).fill(NAVY);

  // Gold accent strip
  doc.rect(0, 108, W, 5).fill(GOLD);

  // Brand
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(20)
    .text('D – D A S H', 48, 30);
  doc.fillColor('#94A3B8').font('Helvetica').fontSize(9)
    .text('M A T H E M A T I C S   L E A R N I N G   P L A T F O R M', 48, 54);

  // Report type + period
  doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(10)
    .text('WEEKLY PROGRESS REPORT', W - 260, 30, { width: 212, align: 'right' });
  doc.fillColor('#94A3B8').font('Helvetica').fontSize(9)
    .text(period || '', W - 260, 48, { width: 212, align: 'right' });

  // ── Student + recipient row ────────────────────────────────────
  let y = 130;
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(18)
    .text(student.name, 48, y);
  const recipientStr = `Report prepared for: ${parentName || 'Parent / Guardian'}`;
  doc.fillColor(MUTED).font('Helvetica').fontSize(10)
    .text(recipientStr, 48, y + 24);

  // ── Divider ───────────────────────────────────────────────────
  y += 52;
  doc.lineWidth(0.5).strokeColor('#E2E8F0')
    .moveTo(48, y).lineTo(W - 48, y).stroke();
  y += 16;

  // ── Summary stat cards (4 across) ────────────────────────────
  const cardW = (PW - 12 * 3) / 4;
  const acc = summary.accuracy == null ? '—' : `${Math.round(summary.accuracy)}%`;
  const delta = summary.accuracyDelta == null ? '—'
    : `${summary.accuracyDelta > 0 ? '+' : ''}${Math.round(summary.accuracyDelta)}%`;
  const deltaColor = summary.accuracyDelta == null ? MUTED
    : summary.accuracyDelta >= 0 ? '#16A34A' : '#DC2626';

  const cards = [
    { label: 'Lessons Completed', value: String(summary.lessonsCompleted || 0), valColor: BLUE },
    { label: 'Sections Done',     value: String(summary.sectionsCompleted || 0), valColor: BLUE },
    { label: 'Accuracy',          value: acc, valColor: scoreColor(summary.accuracy) },
    { label: 'vs Last Week',      value: delta, valColor: deltaColor },
  ];
  cards.forEach((c, i) => {
    const x = 48 + i * (cardW + 12);
    doc.roundedRect(x, y, cardW, 68, 10).fill(LIGHT);
    doc.lineWidth(0.5).strokeColor('#E2E8F0').roundedRect(x, y, cardW, 68, 10).stroke();
    doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8)
      .text(c.label.toUpperCase(), x + 12, y + 12, { width: cardW - 24 });
    doc.fillColor(c.valColor).font('Helvetica-Bold').fontSize(22)
      .text(c.value, x + 12, y + 28, { width: cardW - 24 });
  });
  y += 84;

  // ── Callouts: strongest / weakest ─────────────────────────────
  if (strongest || weakest) {
    const halfW = (PW - 12) / 2;
    if (strongest) {
      doc.roundedRect(48, y, halfW, 46, 8).fill('#F0FDF4');
      doc.lineWidth(0.5).strokeColor('#86EFAC').roundedRect(48, y, halfW, 46, 8).stroke();
      doc.fillColor('#16A34A').font('Helvetica-Bold').fontSize(8).text('STRONGEST TOPIC', 60, y + 10);
      doc.fillColor(NAVY).font('Helvetica').fontSize(10).text(strongest, 60, y + 24, { width: halfW - 24 });
    }
    if (weakest) {
      const x2 = 48 + halfW + 12;
      doc.roundedRect(x2, y, halfW, 46, 8).fill('#FFF7ED');
      doc.lineWidth(0.5).strokeColor('#FCD34D').roundedRect(x2, y, halfW, 46, 8).stroke();
      doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(8).text('NEEDS PRACTICE', x2 + 12, y + 10);
      doc.fillColor(NAVY).font('Helvetica').fontSize(10).text(weakest, x2 + 12, y + 24, { width: halfW - 24 });
    }
    y += 62;
  }

  // ── Teacher note ──────────────────────────────────────────────
  if (teacherNote) {
    doc.roundedRect(48, y, PW, 56, 8).fill('#F8FAFC');
    doc.lineWidth(1).strokeColor(GOLD).roundedRect(48, y, PW, 56, 8).stroke();
    doc.rect(48, y, 4, 56).fill(GOLD);
    doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(8).text('TEACHER NOTE', 62, y + 10);
    doc.fillColor(NAVY).font('Helvetica').fontSize(10)
      .text(teacherNote, 62, y + 24, { width: PW - 28, height: 26 });
    y += 72;
  }

  // ── Lessons table ─────────────────────────────────────────────
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(12).text('Lessons Studied This Week', 48, y);
  y += 18;

  const cols = [
    { label:'Lesson',   w: 74  },
    { label:'Title',    w: 190 },
    { label:'Accuracy', w: 60  },
    { label:'Status',   w: 78  },
    { label:'Date',     w: 75  },
  ];
  const colX = (i) => 48 + cols.slice(0, i).reduce((a, c) => a + c.w, 0);

  // Table header
  doc.rect(48, y, PW, 24).fill(NAVY);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
  cols.forEach((c, i) => doc.text(c.label, colX(i) + 8, y + 8, { width: c.w - 10 }));
  y += 24;

  doc.font('Helvetica').fontSize(9.5);
  const rows = lessons || [];
  rows.forEach((l, ri) => {
    if (y > doc.page.height - 80) { doc.addPage(); y = 48; }
    const rowBg = ri % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    doc.rect(48, y, PW, 22).fill(rowBg);

    const pct = l.accuracy == null ? null : Math.round(l.accuracy);
    const accStr = pct == null ? '—' : `${pct}%`;

    doc.fillColor(NAVY).text(`U${l.unit}·L${l.lesson_num}`, colX(0) + 8, y + 6, { width: cols[0].w - 10 });
    doc.text(l.title || '', colX(1) + 8, y + 6, { width: cols[1].w - 10 });
    doc.fillColor(scoreColor(pct)).font('Helvetica-Bold').text(accStr, colX(2) + 8, y + 6, { width: cols[2].w - 10 });
    doc.fillColor(NAVY).font('Helvetica').text(l.status || '', colX(3) + 8, y + 6, { width: cols[3].w - 10 });
    doc.fillColor(MUTED).text(l.date || '', colX(4) + 8, y + 6, { width: cols[4].w - 10 });
    y += 22;

    // Row border
    doc.lineWidth(0.5).strokeColor('#E2E8F0')
      .moveTo(48, y).lineTo(W - 48, y).stroke();
  });

  if (!rows.length) {
    doc.rect(48, y, PW, 36).fill(LIGHT);
    doc.fillColor(MUTED).font('Helvetica').fontSize(10)
      .text('No lessons completed this period.', 60, y + 12);
    y += 36;
  }

  // Table bottom border
  doc.lineWidth(1).strokeColor(NAVY)
    .moveTo(48, y).lineTo(W - 48, y).stroke();

  // ── Footer ─────────────────────────────────────────────────────
  const footerY = doc.page.height - 44;
  doc.rect(0, footerY - 8, W, 52).fill(NAVY);
  doc.rect(0, footerY - 8, W, 3).fill(GOLD);
  doc.fillColor('#94A3B8').font('Helvetica').fontSize(8)
    .text('Generated by D-DASH Mathematics Learning Platform  ·  Contact your child\'s teacher for further detail.',
      48, footerY + 4, { width: W - 96, align: 'center' });

  doc.end();
}
