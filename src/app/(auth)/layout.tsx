export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style href="sdb-auth-layout" precedence="component">{`
        @media (max-width: 767px) {
          .sdb-auth-brand { display: none !important; }
          .sdb-auth-right { padding: var(--sp-6) var(--sp-4) !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          fontFamily: 'var(--font-body)',
        }}
      >
        {/* ── Left: branding panel ── */}
        <div
          className="sdb-auth-brand"
          style={{
            flex: '0 0 45%',
            background: 'linear-gradient(150deg, #3451c7 0%, var(--accent) 55%, var(--accent-bright) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: 'var(--sp-10) var(--sp-12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative blobs */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '-60px',
              left: '-60px',
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '30%',
              right: '10%',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              pointerEvents: 'none',
            }}
          />

          {/* Logo */}
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'rgba(255,255,255,0.95)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            S<span style={{ color: 'rgba(255,255,255,0.65)' }}>D</span>B
          </span>

          {/* Main copy */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-4)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Design systems,
              <br />
              together.
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-md)',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.55,
                maxWidth: 300,
                margin: 0,
              }}
            >
              A collaborative canvas for software architects.
              Diagram, share, and iterate in real time.
            </p>
          </div>

          {/* Bottom badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'rgba(134,239,172,0.9)',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              Real-time collaboration
            </span>
          </div>
        </div>

        {/* ── Right: auth card ── */}
        <div
          className="sdb-auth-right"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-canvas)',
            padding: 'var(--sp-8) var(--sp-6)',
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
