import { useState } from 'react';

export default function CancelPage({ token }) {
  const [status, setStatus] = useState('idle');
  const [guestName, setGuestName] = useState('');

  async function handleCancel() {
    setStatus('loading');
    try {
      const res = await fetch('/api/cancel-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        setGuestName(data.name || '');
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1208',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      padding: 24,
    }}>
      <div style={{
        background: '#241609',
        border: '1px solid #3d2a14',
        borderRadius: 16,
        padding: '36px 28px',
        maxWidth: 340,
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🍝</div>
        <div style={{ fontSize: 22, fontWeight: 'bold', color: '#f0c060', marginBottom: 4 }}>
          Pasta Lupino
        </div>
        <div style={{ fontSize: 11, color: '#a0845a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 28 }}>
          Whistler Village
        </div>

        {status === 'idle' && (
          <>
            <p style={{ color: '#c0a070', marginBottom: 28, lineHeight: 1.6, fontSize: 15 }}>
              Want to cancel your spot on the waitlist?
            </p>
            <button
              onClick={handleCancel}
              style={{
                background: '#7f1d1d',
                color: '#fca5a5',
                border: '1px solid #dc2626',
                borderRadius: 10,
                padding: '14px 28px',
                fontSize: 16,
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                marginBottom: 12,
              }}
            >
              Yes, cancel my spot
            </button>
            <p style={{ color: '#4a3020', fontSize: 12 }}>
              Changed your mind? Just close this page.
            </p>
          </>
        )}

        {status === 'loading' && (
          <p style={{ color: '#a0845a', fontSize: 15 }}>Just a moment...</p>
        )}

        {status === 'done' && (
          <>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
            <p style={{ color: '#86efac', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              {guestName ? `Done, ${guestName}.` : 'You\'re off the list.'}
            </p>
            <p style={{ color: '#a0845a', lineHeight: 1.6, fontSize: 14 }}>
              No problem at all — hope to see you at Pasta Lupino another time! 🍷
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🤔</div>
            <p style={{ color: '#fca5a5', lineHeight: 1.6, fontSize: 14 }}>
              This link has already been used or has expired. You may already be off the list — no action needed!
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  return { props: { token: params.token } };
}
