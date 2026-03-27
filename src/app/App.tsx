import { useState, useRef, useEffect } from 'react';
import { ProviderApp } from './components/provider/ProviderApp';
import { RequesterApp } from './components/requester/RequesterApp';
import {
  PROVIDER_DEALS_INIT, AVAILABLE_DEALS,
  INCOMING_REQUESTS_INIT, MY_REQUESTS_INIT,
  type Deal, type DealRequest,
} from './data/mockData';

const ALL_DEALS_INIT: Deal[] = [...PROVIDER_DEALS_INIT, ...AVAILABLE_DEALS];
const ALL_REQUESTS_INIT: DealRequest[] = [...INCOMING_REQUESTS_INIT, ...MY_REQUESTS_INIT];

// IDs that existed at startup — anything outside this set is "new" for provider
const SEED_PROVIDER_REQ_IDS = new Set(INCOMING_REQUESTS_INIT.map(r => r.id));

// ── Phone frame wrapper ────────────────────────────────────────
function PhoneFrame({
  label,
  accent,
  icon,
  children,
  syncPulse,
}: {
  label: string;
  accent: string;
  icon: string;
  children: React.ReactNode;
  syncPulse: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Label above phone */}
      <div
        className="flex items-center gap-2 px-4 py-1.5 rounded-full"
        style={{
          background: `${accent}22`,
          border: `1.5px solid ${accent}55`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>{label}</span>
        {syncPulse && (
          <span
            className="w-2 h-2 rounded-full animate-pulse ml-1"
            style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
          />
        )}
      </div>

      {/* Phone frame */}
      <div
        className="relative overflow-hidden shadow-2xl"
        style={{
          width: 370,
          height: 800,
          borderRadius: 44,
          background: '#f8fafc',
          border: `10px solid #1a1a1a`,
          boxShadow: `0 0 0 2px #333, 0 0 40px ${accent}33, 0 30px 80px rgba(0,0,0,0.5)`,
          transition: 'box-shadow 0.4s ease',
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-50"
          style={{ width: 120, height: 32, background: '#1a1a1a', borderRadius: '0 0 20px 20px' }}
        />

        <div className="w-full h-full overflow-hidden" style={{ borderRadius: 34 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Live sync indicator between phones ────────────────────────
function SyncBridge({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-2" style={{ minWidth: 80 }}>
      {/* Top decorative line */}
      <div
        className="w-px flex-1"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.15) 70%, transparent)' }}
      />

      {/* Central badge */}
      <div
        className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* LIVE dot */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${active ? 'animate-ping' : 'animate-pulse'}`}
            style={{ background: active ? '#34D399' : '#6EE7B7', display: 'inline-block' }}
          />
          <span style={{ color: active ? '#34D399' : 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>
            LIVE
          </span>
        </div>

        {/* Arrows */}
        <div className="flex flex-col items-center gap-1">
          <svg width="22" height="10" viewBox="0 0 22 10">
            <path d="M0 5 H18 M14 1 L18 5 L14 9" stroke={active ? '#60A5FA' : 'rgba(255,255,255,0.3)'} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg width="22" height="10" viewBox="0 0 22 10" style={{ transform: 'scaleX(-1)' }}>
            <path d="M0 5 H18 M14 1 L18 5 L14 9" stroke={active ? '#34D399' : 'rgba(255,255,255,0.3)'} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* SYNC label */}
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700, letterSpacing: 1.5 }}>
          SYNC
        </span>
      </div>

      {/* Bottom decorative line */}
      <div
        className="w-px flex-1"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.15) 70%, transparent)' }}
      />
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [sharedDeals, setSharedDeals] = useState<Deal[]>(ALL_DEALS_INIT);
  const [sharedRequests, setSharedRequests] = useState<DealRequest[]>(ALL_REQUESTS_INIT);
  const [syncFlash, setSyncFlash] = useState(false);
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flash the sync indicator whenever shared state changes
  const triggerSync = () => {
    setSyncFlash(true);
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => setSyncFlash(false), 1200);
  };

  // ── Derived slices ──────────────────────────────────────────
  const providerDeals    = sharedDeals.filter(d => d.providerId === 'self');
  const providerRequests = sharedRequests.filter(r => r.providerId === 'self');
  const availableDeals   = sharedDeals.filter(d => d.status === 'active');
  const myRequests       = sharedRequests.filter(r => r.requesterId === 'self');

  const newProviderRequestIds = providerRequests
    .filter(r => !SEED_PROVIDER_REQ_IDS.has(r.id))
    .map(r => r.id);

  // ── Handlers ────────────────────────────────────────────────
  const handleProviderDealsChange = (newDeals: Deal[]) => {
    setSharedDeals(prev => [
      ...prev.filter(d => d.providerId !== 'self'),
      ...newDeals,
    ]);
    triggerSync();
  };

  const handleProviderRequestsChange = (updated: DealRequest[]) => {
    setSharedRequests(prev => {
      const updatedIds = new Set(updated.map(r => r.id));
      return [...prev.filter(r => !updatedIds.has(r.id)), ...updated];
    });
    triggerSync();
  };

  const handleSubmitRequest = (req: DealRequest) => {
    setSharedRequests(prev => [req, ...prev]);
    triggerSync();
  };

  const handleCancelRequest = (id: string) => {
    setSharedRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
    );
    triggerSync();
  };

  const handleUpdateRequest = (id: string, partial: Partial<DealRequest>) => {
    setSharedRequests(prev =>
      prev.map(r => r.id === id ? { ...r, ...partial } : r)
    );
    triggerSync();
  };

  // Cleanup on unmount
  useEffect(() => () => { if (flashTimeout.current) clearTimeout(flashTimeout.current); }, []);

  return (
    <div
      className="w-full overflow-auto"
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #1e3a5f 60%, #0f172a 100%)',
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <span style={{ fontSize: 18 }}>⚡</span>
          </div>
          <div>
            <p style={{ color: 'white', fontSize: 15, fontWeight: 800, letterSpacing: 0.3 }}>P2P Remit</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Demo — Real-time shared state</p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: syncFlash ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${syncFlash ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.15)'}`,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
          }}
        >
          <span
            className={`w-2 h-2 rounded-full ${syncFlash ? 'animate-ping' : 'animate-pulse'}`}
            style={{ background: syncFlash ? '#34D399' : '#6EE7B7', display: 'inline-block' }}
          />
          <span style={{ color: syncFlash ? '#34D399' : 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, transition: 'color 0.3s' }}>
            {syncFlash ? 'SYNCING...' : 'LIVE SYNC'}
          </span>
        </div>
      </div>

      {/* Hint */}
      <p
        className="text-center pb-4"
        style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}
      >
        Thao tác ở một bên — bên kia cập nhật ngay lập tức
      </p>

      {/* Two-phone layout */}
      <div className="flex items-start justify-center gap-0 px-4 pb-8" style={{ minWidth: 860 }}>
        {/* Provider phone */}
        <PhoneFrame label="Nhà cung cấp (Provider)" accent="#3B82F6" icon="🏦" syncPulse={syncFlash}>
          <ProviderApp
            onRoleChange={() => {}}
            deals={providerDeals}
            requests={providerRequests}
            onDealsChange={handleProviderDealsChange}
            onRequestsChange={handleProviderRequestsChange}
            newRequestIds={newProviderRequestIds}
          />
        </PhoneFrame>

        {/* Sync bridge */}
        <SyncBridge active={syncFlash} />

        {/* Requester phone */}
        <PhoneFrame label="Người dùng (Requester)" accent="#10B981" icon="💸" syncPulse={syncFlash}>
          <RequesterApp
            onRoleChange={() => {}}
            availableDeals={availableDeals}
            myRequests={myRequests}
            onSubmitRequest={handleSubmitRequest}
            onCancelRequest={handleCancelRequest}
            onUpdateRequest={handleUpdateRequest}
          />
        </PhoneFrame>
      </div>

      {/* Footer stats */}
      <div
        className="flex items-center justify-center gap-6 pb-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {[
          { label: 'Deals đang hoạt động', value: availableDeals.length, color: '#60A5FA' },
          { label: 'Requests đang xử lý', value: sharedRequests.filter(r => ['pending','accepted','in_progress'].includes(r.status)).length, color: '#34D399' },
          { label: 'Hoàn thành', value: sharedRequests.filter(r => r.status === 'completed').length, color: '#FBBF24' },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col items-center gap-0.5 pt-4">
            <span style={{ color: stat.color, fontSize: 22, fontWeight: 800 }}>{stat.value}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
