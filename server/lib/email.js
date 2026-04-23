// ============================================================
//  server/lib/email.js — nodemailer wrapper + weekly HTML tpl
// ============================================================

import nodemailer from 'nodemailer';

let _transport = null;

function getTransport() {
  if (_transport) return _transport;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // dev fallback: JSON transport — logs mail to console instead of sending
    _transport = nodemailer.createTransport({ jsonTransport: true });
    _transport._isFake = true;
    return _transport;
  }
  _transport = nodemailer.createTransport({
    host, port,
    secure: port === 465,
    auth: { user, pass },
  });
  return _transport;
}

export async function sendMail({ to, subject, html, attachments }) {
  const t = getTransport();
  const from = process.env.SMTP_FROM || 'D-DASH <no-reply@ddash.local>';
  const info = await t.sendMail({ from, to, subject, html, attachments });
  return { ...info, fake: !!t._isFake };
}

function pct(n) { return n == null ? '—' : `${Math.round(n)}%`; }

export function weeklyReportHtml({ student, parentName, summary, lessons, strongest, weakest, teacherNote, unsubscribeUrl, appUrl }) {
  const rows = (lessons || []).map(l => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eef3f9;">Unit ${l.unit} · L${l.lesson_num}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eef3f9;">${escapeHtml(l.title || '')}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eef3f9;">${pct(l.accuracy)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eef3f9;">${escapeHtml(l.status || '')}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eef3f9;color:#64748b;">${escapeHtml(l.date || '')}</td>
    </tr>`).join('');

  const delta = summary.accuracyDelta;
  const deltaStr = delta == null ? ''
    : delta > 0 ? `<span style="color:#059669">▲ ${Math.round(delta)}%</span>`
    : delta < 0 ? `<span style="color:#dc2626">▼ ${Math.abs(Math.round(delta))}%</span>`
    : `<span style="color:#64748b">no change</span>`;

  return `
  <div style="font-family:'Nunito',Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0b2b5e;">
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:18px 24px;border-radius:14px;color:white;">
      <div style="font-weight:800;font-size:20px;">D-DASH weekly update</div>
      <div style="opacity:.9;font-size:13px;margin-top:4px;">Hi ${escapeHtml(parentName || 'there')}, here's ${escapeHtml(student.name)}'s week.</div>
    </div>

    <div style="display:flex;gap:10px;margin:18px 0;flex-wrap:wrap;">
      ${summaryPill('Lessons done', summary.lessonsCompleted)}
      ${summaryPill('Sections', summary.sectionsCompleted)}
      ${summaryPill('Accuracy', pct(summary.accuracy))}
      ${summaryPill('Change vs last week', deltaStr || '—')}
    </div>

    ${strongest ? `<p style="margin:6px 0;"><strong>Strongest:</strong> ${escapeHtml(strongest)}</p>` : ''}
    ${weakest   ? `<p style="margin:6px 0;"><strong>Needs practice:</strong> ${escapeHtml(weakest)}</p>` : ''}

    ${teacherNote ? `
      <div style="background:#f8fafd;border-left:3px solid #2563eb;padding:12px 14px;border-radius:10px;margin:16px 0;">
        <div style="font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Teacher note</div>
        <div style="margin-top:6px;">${escapeHtml(teacherNote)}</div>
      </div>` : ''}

    <h3 style="margin:20px 0 8px;font-size:15px;color:#0b2b5e;">Lessons studied</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#f1f5f9;">
        <th style="text-align:left;padding:8px 10px;">Lesson</th>
        <th style="text-align:left;padding:8px 10px;">Title</th>
        <th style="text-align:left;padding:8px 10px;">Accuracy</th>
        <th style="text-align:left;padding:8px 10px;">Status</th>
        <th style="text-align:left;padding:8px 10px;">Date</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="5" style="padding:16px;color:#64748b;">No lessons this week.</td></tr>'}</tbody>
    </table>

    <div style="text-align:center;margin:24px 0;">
      <a href="${appUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 22px;border-radius:40px;text-decoration:none;font-weight:700;">Open D-DASH</a>
    </div>

    <p style="font-size:11px;color:#94a3b8;text-align:center;margin-top:22px;">
      You're receiving this because you're listed as the parent contact for ${escapeHtml(student.name)}.
      <br/><a href="${unsubscribeUrl}" style="color:#94a3b8;">Unsubscribe</a>
    </p>
  </div>`;
}

function summaryPill(label, value) {
  return `<div style="background:#f8fafd;border:1.5px solid #e2e8f0;border-radius:12px;padding:10px 14px;min-width:120px;">
    <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">${label}</div>
    <div style="font-size:17px;font-weight:800;color:#0b2b5e;margin-top:3px;">${value}</div>
  </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
