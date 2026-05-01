// ============================================================
//  src/pages/admin/Dashboard.jsx — enhanced design
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon, Sparkline, Badge, Avatar, LiftButton } from '../../components/EnhancedUI.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

const CLASS_PALETTE = ['#1E6FD9', '#0891B2', '#16A34A', '#D97706', '#7C3AED', '#DB2777'];
const TEACHER_PALETTE = ['#7C3AED', '#0891B2', '#16A34A', '#D97706', '#DB2777', '#1E6FD9'];

const STAT_COLORS = {
  blue:   { bar: '#1E6FD9', tint: '#DBEAFE' },
  teal:   { bar: '#0891B2', tint: '#CFFAFE' },
  amber:  { bar: '#D97706', tint: '#FEF3C7' },
  purple: { bar: '#7C3AED', tint: '#EDE9FE' },
  green:  { bar: '#16A34A', tint: '#DCFCE7' },
};

function StatCard({ label, value, icon, color = 'blue', sparkData, trend }) {
  const c = STAT_COLORS[color] || STAT_COLORS.blue;
  const trendCls = trend > 0 ? s.trendUp : trend < 0 ? s.trendDown : s.trendFlat;
  return (
    <div className={s.statCard}>
      <div className={s.statTopBar} style={{ background: c.bar }} />
      <div className={s.statHead}>
        <div className={s.statIconBox} style={{ background: c.tint }}>
          <Icon name={icon} size={20} color={c.bar} />
        </div>
        {sparkData && <Sparkline data={sparkData} color={c.bar} />}
      </div>
      <div>
        <div className={s.statNumber}>{value}</div>
        <div className={s.statLabel}>{label}</div>
      </div>
      {trend !== undefined && (
        <div className={`${s.statTrend} ${trendCls}`}>
          <Icon name="trending_up" size={13} color="currentColor" />
          {trend > 0 ? '+' : ''}{trend}% this week
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { authFetch } = useAuth();
  const [data,    setData]    = useState({ teachers: [], students: [], classes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch(`${API}/users?role=teacher`).then(r => r.json()),
      authFetch(`${API}/students`).then(r => r.json()),
      authFetch(`${API}/classes`).then(r => r.json()),
    ]).then(([td, sd, cd]) => {
      setData({ teachers: td.users || [], students: sd.students || [], classes: cd.classes || [] });
    }).finally(() => setLoading(false));
  }, []);

  const avgAccuracy = data.students.length
    ? Math.round(data.students.reduce((a, st) => a + (st.avg_score || 0), 0) / data.students.length)
    : 0;

  const flagged = data.students
    .filter(st => (st.avg_score || 0) < 60)
    .slice(0, 8);

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* ── Stats ── */}
        <div className={s.statsGrid} style={{ marginBottom: 0 }}>
          <StatCard label="Total Teachers" value={data.teachers.length}      icon="teachers" color="blue" />
          <StatCard label="Total Students" value={data.students.length}      icon="students" color="teal" />
          <StatCard label="Total Classes"  value={data.classes.length}       icon="classes"  color="purple" />
          <StatCard label="Platform Avg"   value={`${avgAccuracy}%`}         icon="target"   color="amber" />
        </div>

        {/* ── Teachers + Classes overview ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'flex-start' }}>
          {/* Teachers */}
          <div className={s.card} style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div className={s.cardTitle} style={{ marginBottom: 0 }}>Teachers</div>
              <LiftButton variant="secondary" size="sm" icon="plus">Add</LiftButton>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.teachers.map((t, i) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 12,
                  background: '#F8FAFC', border: '1.5px solid #EEF2F7',
                }}>
                  <Avatar name={t.name} size={40} bg={TEACHER_PALETTE[i % TEACHER_PALETTE.length]} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{t.name}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>{t.email}</div>
                  </div>
                </div>
              ))}
              {data.teachers.length === 0 && (
                <div style={{ color: '#64748B', fontSize: 13 }}>No teachers yet.</div>
              )}
            </div>
          </div>

          {/* Classes overview */}
          <div className={s.card} style={{ marginBottom: 0 }}>
            <div className={s.cardTitle}>Classes Overview</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8,
                padding: '6px 10px', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase', color: '#64748B',
              }}>
                <span>Class</span><span>Teacher</span><span style={{ textAlign: 'right' }}>Students</span>
              </div>
              {data.classes.map((c, i) => (
                <div key={c.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8,
                  alignItems: 'center', padding: '10px',
                  borderRadius: 10, transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{
                      width: 9, height: 9, borderRadius: '50%',
                      background: c.color || CLASS_PALETTE[i % CLASS_PALETTE.length],
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.teacher_name}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', textAlign: 'right' }}>{c.student_count || 0}</span>
                </div>
              ))}
              {data.classes.length === 0 && (
                <div style={{ color: '#64748B', fontSize: 13, padding: '8px 10px' }}>No classes yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Students Needing Attention ── */}
        <div className={s.card} style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#FEE2E2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="bell" size={14} color="#B91C1C" />
            </div>
            <div className={s.cardTitle} style={{ marginBottom: 0 }}>Students Needing Attention</div>
            <span style={{
              marginLeft: 'auto', fontSize: 11.5, fontWeight: 700,
              padding: '3px 10px', borderRadius: 9999,
              background: '#FEE2E2', color: '#B91C1C',
            }}>{flagged.length} flagged</span>
          </div>
          {flagged.length === 0 ? (
            <div style={{ color: '#64748B', fontSize: 13.5 }}>No students currently flagged. 🎉</div>
          ) : (
            <>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: 8,
                padding: '0 12px 8px', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase', color: '#64748B',
                borderBottom: '1px solid #EEF2F7',
              }}>
                <span>Student</span><span>Email</span><span>Classes</span><span>Avg</span><span>Status</span>
              </div>
              {flagged.map((st, i) => {
                const variant = (st.avg_score || 0) < 40 ? 'needs-help' : 'fair';
                return (
                  <div key={st.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: 8,
                    alignItems: 'center', padding: '11px 12px',
                    borderRadius: 10, transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <Avatar name={st.name} size={32} bg={CLASS_PALETTE[i % CLASS_PALETTE.length]} />
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.name}</span>
                    </div>
                    <span style={{ fontSize: 12.5, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.email}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#334155', textAlign: 'center' }}>{st.class_count || 0}</span>
                    <span style={{ fontSize: 13, color: '#1E293B', textAlign: 'center', fontWeight: 700 }}>
                      {st.avg_score ? `${Math.round(st.avg_score)}%` : '—'}
                    </span>
                    <Badge variant={variant} />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
