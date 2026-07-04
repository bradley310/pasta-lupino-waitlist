import { useState } from 'react';

export default function CancelPage({ token }) {
  const [status, setStatus] = useState('idle');
  const [guestName, setGuestName] = useState('');

  async function handleCancel() {
    setStatus('loading');
    try {
      const res = await fetch('/api/cancel-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const data = await res.json();
      if (res.ok) { setGuestName(data.name || ''); setStatus('done'); }
      else setStatus('error');
    } catch { setStatus('error'); }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5ede0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #c4a882', borderRadius: 16, padding: '36px 28px', maxWidth: 340, width: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(43,31,16,0.1)' }}>
        <img src="/logo.png" alt="Pasta Lupino" style={{ height: 80, width: 80, objectFit: 'contain', borderRadius: 8, marginBottom: 20 }} />
        {status === 'idle' && (<>
          <p style={{ color: '#7a5c3a', marginBottom: 28, lineHeight: 1.6, fontSize: 15 }}>Want to cancel your spot on the waitlist?</p>
          <button onClick={handleCancel} style={{ background: '#b85c2a', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 16, fontFamily: 'Georgia, serif', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginBottom: 12 }}>Yes, cancel my spot</button>
          <p style={{ color: '#a08060', fontSize: 12 }}>Changed your mind? Just close this page.</p>
        </>)}
        {status === 'loading' && <p style={{ color: '#a08060', fontSize: 15 }}>Just a moment...</p>}
        {status === 'done' && (<>
          <p style={{ color: '#15803d', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{guestName ? `Done, ${guestName}.` : "You're off the list."}</p>
          <p style={{ color: '#7a5c3a', lineHeight: 1.6, fontSize: 14 }}>No problem at all — hope to see you at Pasta Lupino another time!</p>
        </>)}
        {status === 'error' && <p style={{ color: '#dc2626', lineHeight: 1.6, fontSize: 14 }}>This link has already been used or expired. You may already be off the list!</p>}
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  return { props: { token: params.token } };
}
