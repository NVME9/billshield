import { useState, useRef, useEffect } from 'react'
import hospitalPriceData from '../data/hospital-prices.json'
import { listHospitals, getHospitalById, matchBillLines } from './lib/billMath.js'

const LAST_UPDATED = 'October 26, 2026'
const CONTACT_EMAIL = 'getvaluiq@gmail.com'

// ── Shield Score Ring ──────────────────────────────────────────────────────────
function ShieldRing({ score }) {
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#D97706' : '#DC2626'
  const label = score >= 70 ? 'Low Risk' : score >= 40 ? 'Moderate Risk' : 'High Risk'
  const circ = 2 * Math.PI * 44
  return (
    <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
      <svg viewBox="0 0 110 110" width="110" height="110">
        <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6" />
        <circle cx="55" cy="55" r="44" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 55 55)" style={{ transition: 'stroke-dasharray 1.2s ease' }} />
        <text x="55" y="51" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="Fraunces,serif">{score}</text>
        <text x="55" y="68" textAnchor="middle" fill={color} fontSize="9" fontWeight="600" fontFamily="DM Sans,sans-serif">{label}</text>
      </svg>
    </div>
  )
}

// ── Shared footer ──────────────────────────────────────────────────────────────
function SiteFooter({ onPrivacy, onTerms, onContact }) {
  return (
    <footer>
      <div className="fl">Bill<span>Shield</span></div>
      <div className="f-links">
        <button className="f-link" onClick={onPrivacy}>Privacy</button>
        <button className="f-link" onClick={onTerms}>Terms</button>
        <button className="f-link" onClick={onContact}>Contact</button>
      </div>
      <p className="disclaimer">BillShield is not a law firm and does not provide legal, medical, or financial advice. We do not guarantee any savings. We help you understand your bill and communicate with billing departments. Always consult a qualified attorney for legal matters.</p>
    </footer>
  )
}

// ── Landing Page ───────────────────────────────────────────────────────────────
function Landing({ onStart, onPricing, onB2B, onCheckBill, onPrivacy, onTerms, onContact }) {
  const [b2bSent, setB2bSent] = useState(false)
  const [b2b, setB2b] = useState({ name: '', org: '', email: '', size: '' })

  const plans = [
    { name: 'Free', price: '$0', sub: '', desc: 'Get a basic bill explanation and Shield Score overview.', features: ['Bill explanation in plain English', 'Shield Score overview', 'General negotiation tips'], hot: false, badge: null, cta: 'Get Started', onClick: onStart },
    { name: 'Basic', price: '$19', sub: 'one-time (beta: access code instead)', desc: 'Everything you need to dispute a single bill.', features: ['Full red flag scan', 'Personalized dispute letter', 'Phone call script', 'State-specific rights', 'Action plan'], hot: true, badge: 'Most Popular', cta: 'Get Started', onClick: onStart },
    { name: 'Unlimited', price: '$49', sub: '/mo (beta: access code instead)', desc: 'For ongoing medical situations or managing bills for your family.', features: ['Unlimited bill analyses', 'Everything in Basic', 'Priority AI analysis', 'Progress tracking'], hot: false, badge: null, cta: 'Subscribe', onClick: onStart },
    { name: 'Enterprise', price: 'Custom', sub: '', desc: 'For patient advocacy orgs, HR departments, and elder care facilities.', features: ['White-label option', 'Bulk bill analysis', 'API access', 'Dedicated account manager', 'Custom integrations'], hot: false, badge: null, cta: 'Contact Us', onClick: onB2B },
  ]

  const features = [
    ['🔍', 'Red Flag Scanner', "Identifies duplicate charges, upcoded procedures, unbundled services, and charges that don't match your treatment."],
    ['📄', 'Dispute Letter Generator', 'A professional, legally-worded letter tailored to your situation — ready to mail or email today.'],
    ['📞', 'Phone Script', 'Exactly what to say when you call billing, including how to handle common pushback.'],
    ['🧾', 'Bill Explainer', 'Plain-English breakdown of every line item and medical code — no decoder ring needed.'],
    ['📊', 'Shield Score', 'A 0–100 legitimacy rating so you instantly know how hard to push.'],
    ['🏥', 'Check My Bill', "Compare your charges directly against a hospital's own published cash prices — no AI, no cost, just their own numbers."],
  ]

  return (
    <div>
      {/* NAV */}
      <nav className="nav">
        <button className="logo">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M13 2L2 7v8c0 5.8 4.5 11.2 11 12.5C20.5 26.2 25 20.8 25 15V7L13 2z" fill="#059669" opacity=".25"/>
            <path d="M13 2L2 7v8c0 5.8 4.5 11.2 11 12.5C20.5 26.2 25 20.8 25 15V7L13 2z" fill="none" stroke="#10B981" strokeWidth="1.5"/>
            <path d="M8 13l4 4 7-7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Bill<span>Shield</span>
        </button>
        <div className="nav-links">
          <button className="nav-link" onClick={onCheckBill}>Check My Bill</button>
          <button className="nav-link" onClick={onPricing}>Pricing</button>
          <button className="nav-link" onClick={onB2B}>For Organizations</button>
        </div>
        <button className="nav-cta" onClick={onStart}>Analyze My Bill</button>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="eyebrow">⚡ Federal law requires hospitals to publish their own prices</div>
        <h1>Understand your medical bill. <em>Compare it to the hospital's own numbers.</em></h1>
        <p className="hero-sub">Upload your bill, get an AI-powered red flag scan, a ready-to-send dispute letter, and a phone script — or compare your charges directly against a hospital's federally-required price file, free.</p>
        <div className="hero-btns">
          <button className="btn-p" onClick={onStart}>Analyze My Bill Free →</button>
          <button className="btn-s" onClick={onCheckBill}>Check My Bill Against Hospital Prices</button>
        </div>
        <div className="hero-stats">
          {[['45 CFR §180.50', 'Federal rule requires hospitals to post prices'], ['Plain English', 'Every charge explained'], ['$0', 'To see your Shield Score']].map(([n, l]) => (
            <div className="stat" key={l}><div className="num">{n}</div><div className="lbl">{l}</div></div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="section">
        <div className="s-label">How it works</div>
        <h2 className="s-title fraunces">Three steps to fighting back</h2>
        <p className="s-sub">No legal knowledge required. BillShield does the heavy lifting.</p>
        <div className="steps">
          {[
            ['1','Upload or describe your bill','Upload your medical bill PDF or paste the key charges. We accept EOBs, itemized bills, and summary statements.'],
            ['2','AI finds the problems','Our AI scans for duplicate charges, upcoded procedures, incorrect billing codes, and unauthorized charges.'],
            ['3','Dispute with confidence','Get a personalized dispute letter, phone script, and step-by-step action plan — ready to use immediately.'],
          ].map(([n, t, d]) => (
            <div className="step-card" key={n}>
              <div className="step-n">{n}</div>
              <h3 className="fraunces">{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: '#fff', padding: '.5rem 0' }}>
        <div className="section">
          <div className="s-label">What you get</div>
          <h2 className="s-title fraunces">Everything you need to win</h2>
          <p className="s-sub">Tools billing specialists use — without taking a cut of your savings.</p>
          <div className="feat-grid">
            {features.map(([icon, t, d]) => (
              <div className="feat-card" key={t}>
                <div className="feat-icon">{icon}</div>
                <h4>{t}</h4>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="price-wrap" id="pricing">
        <div className="price-inner">
          <div className="s-label" style={{ color: 'rgba(255,255,255,.5)', textAlign: 'center' }}>Pricing</div>
          <h2 className="fraunces" style={{ color: '#fff', fontSize: 'clamp(1.8rem,3vw,2.4rem)', textAlign: 'center' }}>Simple, transparent pricing</h2>
          <p style={{ color: 'rgba(255,255,255,.5)', textAlign: 'center', marginTop: '.5rem' }}>BillShield is in a free beta. Paid tiers aren't charging yet — they currently unlock with a beta access code instead.</p>
          <div className="price-grid">
            {plans.map(p => (
              <div className={`plan${p.hot ? ' hot' : ''}`} key={p.name}>
                {p.badge && <div className="plan-badge">{p.badge}</div>}
                <h3 className="fraunces">{p.name}</h3>
                <div className="price">{p.price}<span className="price-sub">{p.sub}</span></div>
                <p className="desc">{p.desc}</p>
                <ul>{p.features.map(f => <li key={f}>{f}</li>)}</ul>
                <button className="plan-btn" onClick={p.onClick}>{p.cta} →</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* B2B */}
      <div className="b2b-wrap" id="b2b">
        <div className="b2b-inner">
          <div className="s-label" style={{ color: 'rgba(255,255,255,.5)' }}>For Organizations</div>
          <h2 className="fraunces" style={{ color: '#fff', fontSize: 'clamp(1.8rem,3vw,2.4rem)' }}>Built for organizations who serve patients</h2>
          <p style={{ color: 'rgba(255,255,255,.5)', marginTop: '.5rem', lineHeight: 1.75 }}>Patient advocacy groups, elder care facilities, HR departments, and credit unions use BillShield to help the people they serve understand and question their medical bills.</p>
          <div className="b2b-form">
            {b2bSent
              ? <div className="b2b-sent">✅ Thanks! We&apos;ll be in touch within one business day.</div>
              : <>
                  <div className="b2b-row">
                    <input className="b2b-input" placeholder="Your name" value={b2b.name} onChange={e => setB2b(f => ({ ...f, name: e.target.value }))} />
                    <input className="b2b-input" placeholder="Organization" value={b2b.org} onChange={e => setB2b(f => ({ ...f, org: e.target.value }))} />
                  </div>
                  <input className="b2b-input" placeholder="Work email" value={b2b.email} onChange={e => setB2b(f => ({ ...f, email: e.target.value }))} />
                  <input className="b2b-input" placeholder="How many people do you serve?" value={b2b.size} onChange={e => setB2b(f => ({ ...f, size: e.target.value }))} />
                  <button className="b2b-submit" onClick={() => setB2bSent(true)}>Request a Demo →</button>
                </>
            }
          </div>
        </div>
      </div>

      <SiteFooter onPrivacy={onPrivacy} onTerms={onTerms} onContact={onContact} />
    </div>
  )
}

// ── Beta access code field (shared) ─────────────────────────────────────────
function BetaCodeField({ value, onChange, helperText }) {
  return (
    <div className="fg">
      <label>Beta access code</label>
      <input
        className="fi"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. BETA-1234"
        maxLength={100}
      />
      <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.4rem', lineHeight: 1.5 }}>
        {helperText || <>BillShield is in a free beta behind an access code while real payments are built. Don&apos;t have one? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</>}
      </p>
    </div>
  )
}

// ── Analyze Flow ───────────────────────────────────────────────────────────────
const MAX_BILL_TEXT = 12000

function Analyze({ onBack, onComplete, betaCode, onBetaCodeChange }) {
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState('text')
  const [billText, setBillText] = useState('')
  const [pdfText, setPdfText] = useState('')
  const [pdfName, setPdfName] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [providerType, setProviderType] = useState('')
  const [insuranceStatus, setInsuranceStatus] = useState('')
  const [billAmount, setBillAmount] = useState('')
  const [context, setContext] = useState('')
  const [tier, setTier] = useState('free')
  const fileRef = useRef(null)

  const extractPDF = async (file) => {
    setPdfLoading(true)
    setPdfName(file.name)
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
      GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).href
      const ab = await file.arrayBuffer()
      const pdf = await getDocument({ data: ab }).promise
      let txt = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const pg = await pdf.getPage(i)
        const c = await pg.getTextContent()
        txt += c.items.map(x => x.str).join(' ') + '\n'
      }
      setPdfText((txt || `[PDF: ${file.name} — no text extracted. Describe charges below.]`).slice(0, MAX_BILL_TEXT))
    } catch {
      setPdfText(`[Could not read PDF. Please describe your bill manually.]`)
    } finally {
      setPdfLoading(false)
    }
  }

  const ok1 = method === 'text' ? billText.trim().length > 15 : (pdfText.length > 0 && !pdfLoading)
  const ok2 = providerType && insuranceStatus && billAmount
  const ok3 = tier === 'free' || betaCode.trim().length > 0
  const go = () => onComplete({ rawText: (method === 'text' ? billText : pdfText).slice(0, MAX_BILL_TEXT), providerType, insuranceStatus, billAmount, context, tier, code: betaCode.trim() })

  const providers = [['hospital','Hospital (inpatient)'],['er','Emergency Room'],['specialist','Specialist / Outpatient'],['lab','Lab / Diagnostic'],['urgent_care','Urgent Care'],['surgery_center','Surgery Center'],['dental','Dental'],['other','Other']]
  const insurance = [['insured','Fully insured'],['underinsured','Underinsured / High deductible'],['uninsured','Uninsured / Self-pay'],['medicare','Medicare / Medicaid']]
  const tiers = [
    { id: 'free', name: 'Free Analysis', price: '$0', desc: 'Basic bill explanation + Shield Score overview' },
    { id: 'basic', name: 'Full Dispute Kit', price: 'Beta — access code', desc: 'Red flag scan + dispute letter + phone script', badge: 'Most Popular' },
    { id: 'unlimited', name: 'Unlimited', price: 'Beta — access code', desc: 'For ongoing or family bills, during the beta' },
  ]

  return (
    <div className="az-root">
      <div className="az-head">
        <button className="back-btn" onClick={step === 1 ? onBack : () => setStep(s => s - 1)}>← {step === 1 ? 'Home' : 'Back'}</button>
        <span className="az-head-title">BillShield Analysis</span>
      </div>
      <div className="prog"><div className="prog-fill" style={{ width: `${(step / 3) * 100}%` }} /></div>

      <div className="az-body">
        {step === 1 && (
          <>
            <div className="az-label">Step 1 of 3</div>
            <h2 className="az-title fraunces">Upload or describe your bill</h2>
            <p className="az-sub">Choose how you&apos;d like to share your bill. Both options give equally thorough results.</p>
            <div className="m-cards">
              {[['upload','📄','Upload PDF','Auto text extraction'],['text','✏️','Type / Paste Details','Describe charges & amounts']].map(([id, icon, title, sub]) => (
                <div key={id} className={`m-card${method === id ? ' sel' : ''}`} onClick={() => setMethod(id)}>
                  <div className="m-card-icon">{icon}</div>
                  <div className="m-card-title">{title}</div>
                  <div className="m-card-sub">{sub}</div>
                </div>
              ))}
            </div>
            {method === 'upload' && (
              <>
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files[0] && extractPDF(e.target.files[0])} />
                <div className={`upload-z${pdfText ? ' has' : ''}`} onClick={() => fileRef.current?.click()}>
                  <div className="u-icon">{pdfLoading ? '⏳' : pdfText ? '✅' : '☁️'}</div>
                  <p>{pdfLoading ? 'Extracting text…' : pdfText ? <><strong>{pdfName}</strong> — extracted. Click to replace.</> : <><strong>Click to upload</strong> your bill PDF</>}</p>
                </div>
              </>
            )}
            {method === 'text' && (
              <div className="fg">
                <label>Paste your bill details or describe the charges</label>
                <textarea className="ft" value={billText} maxLength={MAX_BILL_TEXT} onChange={e => setBillText(e.target.value)}
                  placeholder="e.g. Emergency room visit March 12. Charged: ER facility fee $2,800, Physician $450, CT scan $1,200, Lab work $380, IV administration $290 listed twice..." />
                <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '.3rem', textAlign: 'right' }}>{billText.length.toLocaleString()} / {MAX_BILL_TEXT.toLocaleString()}</p>
              </div>
            )}
            <button className="btn-next" disabled={!ok1} onClick={() => setStep(2)}>Continue →</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="az-label">Step 2 of 3</div>
            <h2 className="az-title fraunces">Tell us about your situation</h2>
            <p className="az-sub">This helps us tailor the analysis and find the right negotiation angles.</p>
            <div className="fg">
              <label>Provider type</label>
              <select className="fs" value={providerType} onChange={e => setProviderType(e.target.value)}>
                <option value="">Select provider…</option>
                {providers.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Insurance status</label>
              <select className="fs" value={insuranceStatus} onChange={e => setInsuranceStatus(e.target.value)}>
                <option value="">Select status…</option>
                {insurance.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Total amount billed</label>
              <input className="fi" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="e.g. $3,450" maxLength={100} />
            </div>
            <div className="fg">
              <label>Anything else we should know? (optional)</label>
              <textarea className="ft" style={{ minHeight: 90 }} value={context} maxLength={2000} onChange={e => setContext(e.target.value)}
                placeholder="e.g. Never signed a financial agreement, was unconscious when admitted, procedure was labeled elective but was urgent..." />
            </div>
            <button className="btn-next" disabled={!ok2} onClick={() => setStep(3)}>Continue →</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="az-label">Step 3 of 3</div>
            <h2 className="az-title fraunces">Choose your plan</h2>
            <p className="az-sub">Start free to see your Shield Score, or unlock the full dispute toolkit with a beta access code.</p>
            <div className="tier-list">
              {tiers.map(t => (
                <div key={t.id} className={`tier-item${tier === t.id ? ' sel' : ''}`} onClick={() => setTier(t.id)}>
                  <div className="tier-left">
                    <div className="tier-name">{t.name}{t.badge && <span className="t-badge">{t.badge}</span>}</div>
                    <div className="tier-desc">{t.desc}</div>
                  </div>
                  <div className="tier-price">{t.price}</div>
                </div>
              ))}
            </div>
            {tier !== 'free' && (
              <>
                <div className="stripe-note">
                  🔑 <strong>Beta:</strong> BillShield isn&apos;t charging for paid tiers yet. Enter a beta access code below to run the full AI analysis. No payment is collected.
                </div>
                <BetaCodeField value={betaCode} onChange={onBetaCodeChange} />
              </>
            )}
            <button className="btn-next" disabled={!ok3} onClick={go}>
              {tier === 'free' ? 'Analyze My Bill Free →' : 'Run Full Analysis →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Processing ─────────────────────────────────────────────────────────────────
const PROCESSING_STEPS = ['Parsing your bill…', 'Scanning for red flags…', 'Drafting dispute letter…', 'Building your action plan…']

function Processing() {
  const [active, setActive] = useState(0)
  const steps = PROCESSING_STEPS
  useEffect(() => {
    const t = setInterval(() => setActive(s => Math.min(s + 1, PROCESSING_STEPS.length - 1)), 2400)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="proc-root">
      <div className="shield-anim">
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
          <path d="M45 5L5 20v25c0 20 15 38 40 45 25-7 40-25 40-45V20L45 5z" fill="#059669" opacity=".2"/>
          <path d="M45 5L5 20v25c0 20 15 38 40 45 25-7 40-25 40-45V20L45 5z" fill="none" stroke="#10B981" strokeWidth="2"/>
          <path d="M30 45l11 11 20-20" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="proc-title fraunces">Analyzing your bill</div>
      <div className="proc-sub">Our AI is reviewing every charge…</div>
      <div className="proc-steps">
        {steps.map((s, i) => (
          <div key={s} className={`proc-step${i === active ? ' active' : i < active ? ' done' : ''}`}>
            {i < active ? <div className="proc-dot" /> : i === active ? <div className="spinner" /> : <div className="proc-dot" style={{ opacity: .25 }} />}
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Error view (replaces the old silent canned-fallback behavior) ─────────────
function AnalysisError({ message, onRetry, onHome }) {
  return (
    <div className="proc-root">
      <div style={{ fontSize: '2.5rem' }}>⚠️</div>
      <div className="proc-title fraunces">We couldn&apos;t complete that analysis</div>
      <div className="proc-sub" style={{ maxWidth: 420 }}>{message}</div>
      <div className="hero-btns">
        <button className="btn-p" onClick={onRetry}>Try Again</button>
        <button className="btn-s" onClick={onHome}>Back to Home</button>
      </div>
    </div>
  )
}

// ── Results ────────────────────────────────────────────────────────────────────
function Results({ results, tier, onNew, onUpgrade }) {
  const [tab, setTab] = useState('flags')
  const [copied, setCopied] = useState('')
  const paid = tier !== 'free'

  const copy = (txt, k) => {
    navigator.clipboard.writeText(txt).then(() => { setCopied(k); setTimeout(() => setCopied(''), 2000) })
  }

  const sevLabel = { high: 'High Priority', medium: 'Medium', low: 'Low' }

  return (
    <div className="res-root">
      <div className="res-head">
        <div className="res-head-in">
          <ShieldRing score={results.shieldScore} />
          <div className="res-head-text">
            <h2 className="fraunces">Your BillShield Report</h2>
            <p>{results.summary}</p>
          </div>
        </div>
      </div>

      <div className="res-body">
        <div className="tabs">
          <button className={`tab${tab === 'flags' ? ' active' : ''}`} onClick={() => setTab('flags')}>🚩 Red Flags</button>
          {paid && <button className={`tab${tab === 'letter' ? ' active' : ''}`} onClick={() => setTab('letter')}>📄 Dispute Letter</button>}
          {paid && <button className={`tab${tab === 'script' ? ' active' : ''}`} onClick={() => setTab('script')}>📞 Phone Script</button>}
          <button className={`tab${tab === 'steps' ? ' active' : ''}`} onClick={() => setTab('steps')}>✅ Next Steps</button>
        </div>

        {tab === 'flags' && (
          <div className="flags">
            {results.redFlags?.length ? results.redFlags.map((f, i) => (
              <div key={i} className={`flag ${f.severity}`}>
                <div className="flag-h">
                  <div className="flag-title">{f.issue}</div>
                  <span className={`sev ${f.severity}`}>{sevLabel[f.severity]}</span>
                </div>
                <p>{f.description}</p>
              </div>
            )) : (
              <div className="flag" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>✅</div>
                <div style={{ fontWeight: 600 }}>No major red flags found</div>
                <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginTop: '.4rem' }}>Your bill appears reasonable. Still request an itemized bill to verify every line item.</p>
              </div>
            )}
            {!paid && (
              <div className="lock-box">
                <div className="lock-icon">🔒</div>
                <h3 className="lock-title fraunces">Unlock your full dispute toolkit</h3>
                <p className="lock-desc">Get your personalized dispute letter, phone script, and action plan with a beta access code.</p>
                <button className="unlock-btn" onClick={onUpgrade}>Unlock Full Analysis →</button>
              </div>
            )}
          </div>
        )}

        {tab === 'letter' && paid && (
          <div>
            <button className="copy-btn" onClick={() => copy(results.negotiationLetter, 'letter')}>
              {copied === 'letter' ? '✓ Copied!' : '📋 Copy Letter'}
            </button>
            <div className="letter-box">{results.negotiationLetter}</div>
          </div>
        )}

        {tab === 'script' && paid && (
          <div>
            <button className="copy-btn" onClick={() => copy(results.phoneScript, 'script')}>
              {copied === 'script' ? '✓ Copied!' : '📋 Copy Script'}
            </button>
            <div className="letter-box">{results.phoneScript}</div>
          </div>
        )}

        {tab === 'steps' && (
          <div className="ns-box">
            <h3 className="fraunces">Your Action Plan</h3>
            {results.nextSteps?.map((s, i) => (
              <div key={i} className="ns-item">
                <div className="ns-num">{i + 1}</div>
                <p>{s}</p>
              </div>
            ))}
          </div>
        )}

        <button className="new-btn" onClick={onNew}>← Analyze Another Bill</button>
      </div>
    </div>
  )
}

// ── Static Free Tier Results (no API call, zero cost) ─────────────────────────
// No dollar figures here — we don't have hospital-specific data for this flow,
// so we describe issue patterns qualitatively instead of inventing savings
// estimates. For real dollar comparisons, see the "Check My Bill" flow, which
// uses each hospital's own published cash price.
const FREE_RESULTS = {
  hospital: {
    shieldScore: 51,
    summary: 'Hospital bills commonly contain certain patterns worth double-checking before you pay — including a few charge types that are frequently worth questioning.',
    redFlags: [
      { issue: 'Duplicate room & board charge', description: 'Hospital stays are frequently billed with overlapping room charges, especially around admission and discharge dates. Request an itemized bill to check for this.', severity: 'high' },
      { issue: 'Itemized supply charges not justified', description: 'Hospitals sometimes charge separately for individual items like gloves, gowns, or saline that are typically bundled into the facility fee. Ask for justification or removal.', severity: 'medium' },
      { issue: 'Physician fee billed separately without notice', description: 'Doctors who treated you in the hospital may bill separately from the hospital itself, sometimes out-of-network even when the hospital is in-network.', severity: 'medium' },
    ],
  },
  er: {
    shieldScore: 47,
    summary: 'Emergency room bills involve multiple providers and facility fees, which makes careful review worthwhile.',
    redFlags: [
      { issue: 'Facility fee on top of physician fee', description: 'ER visits commonly generate two separate bills — one from the hospital and one from the ER physician group. Ask for an itemized breakdown of each.', severity: 'high' },
      { issue: 'Level of care may be overcoded', description: 'ER visits are billed on a scale from Level 1–5. Ask your provider to explain why a given level was chosen and request the supporting documentation.', severity: 'high' },
      { issue: 'Medications billed at retail markup', description: 'Hospital-administered medication charges can be marked up well above the drug\'s actual cost. Request an itemized breakdown of every drug charge.', severity: 'medium' },
    ],
  },
  specialist: {
    shieldScore: 58,
    summary: 'Specialist bills can contain coding or bundling issues worth a closer look before paying.',
    redFlags: [
      { issue: 'Upcoded office visit level', description: 'Ask what visit complexity level was billed (e.g. 99214 vs 99215) and request the documentation that justifies that level.', severity: 'medium' },
      { issue: 'Separate charge for results review', description: 'Reviewing test results is sometimes bundled into the office visit fee but occasionally billed as a separate service — ask which applies here.', severity: 'low' },
      { issue: 'Out-of-network assistant surgeon', description: 'If your visit involved any procedure, check whether an assistant surgeon or anesthesiologist was in-network before assuming the whole visit was covered.', severity: 'medium' },
    ],
  },
  lab: {
    shieldScore: 62,
    summary: 'Lab bills can involve panel unbundling or duplicate charges — both are usually easy to ask about directly.',
    redFlags: [
      { issue: 'Panel tests billed individually', description: 'Check whether a standard panel (like a comprehensive metabolic panel) was billed as its component tests instead of as the panel.', severity: 'high' },
      { issue: 'Same test billed twice', description: 'Ask whether any test was run more than once during the same visit and, if so, why it was billed twice.', severity: 'medium' },
      { issue: 'Out-of-network lab used without notice', description: 'Your doctor may have sent your samples to an out-of-network lab without informing you. Ask which lab processed each test.', severity: 'medium' },
    ],
  },
  urgent_care: {
    shieldScore: 64,
    summary: 'Urgent care bills are generally simpler than hospital bills but still worth a quick review before paying.',
    redFlags: [
      { issue: 'Facility fee added to visit', description: 'Some urgent care centers charge a facility fee on top of the physician visit fee — ask whether you were told about this when you checked in.', severity: 'medium' },
      { issue: 'Supplies billed at excessive markup', description: 'Ask for an itemized list of any supply charges and question anything that seems high relative to a retail price.', severity: 'low' },
      { issue: 'Billed as ER rather than urgent care', description: 'Confirm your visit was billed under an urgent care code rather than an ER code, which typically costs more.', severity: 'high' },
    ],
  },
  surgery_center: {
    shieldScore: 49,
    summary: 'Surgery center bills are complex and often worth a line-by-line review, especially implant and anesthesia charges.',
    redFlags: [
      { issue: 'Implant or device marked up significantly', description: 'You have the right to request the invoice price of any implant, hardware, or device used during your procedure.', severity: 'high' },
      { issue: 'Anesthesia time billed incorrectly', description: 'Anesthesia is billed in time units. Request the start and end times documented in your surgical record to verify the units billed.', severity: 'high' },
      { issue: 'Pre-op and post-op billed separately', description: 'Pre- and post-operative care is typically bundled into the surgical fee — billing it separately is worth questioning.', severity: 'medium' },
    ],
  },
  dental: {
    shieldScore: 60,
    summary: 'Dental bills commonly contain coding or bundling questions worth asking about directly.',
    redFlags: [
      { issue: 'Procedure bundling error', description: 'Some dental procedures are required to be billed together under one code — ask whether that applies to your treatment.', severity: 'medium' },
      { issue: 'X-rays billed at non-standard rate', description: 'Dental X-ray charges vary; ask your office how their rate compares to what they typically charge for the same films.', severity: 'low' },
      { issue: 'Insurance coordination error', description: 'If you have both primary and secondary dental insurance, ask whether coordination of benefits was applied correctly before paying.', severity: 'medium' },
    ],
  },
  other: {
    shieldScore: 55,
    summary: 'Medical bills across provider types share some common review points. We\'ve flagged the most relevant ones based on what you told us.',
    redFlags: [
      { issue: 'No itemized bill provided', description: 'You have the legal right to a complete itemized bill. Without one, it\'s hard to verify every charge. Always request this before paying.', severity: 'high' },
      { issue: 'Potential duplicate charges', description: 'Duplicate line items are a common medical billing issue. An itemized bill will reveal whether any service was charged more than once.', severity: 'medium' },
      { issue: 'Financial assistance may be available', description: 'Many hospitals offer charity care or financial hardship programs that are rarely advertised. Ask the billing department directly.', severity: 'low' },
    ],
  },
}

// ── Legal pages ────────────────────────────────────────────────────────────────
function LegalPage({ title, onBack, onPrivacy, onTerms, onContact, children }) {
  return (
    <div className="az-root">
      <div className="az-head">
        <button className="back-btn" onClick={onBack}>← Home</button>
        <span className="az-head-title">{title}</span>
      </div>
      <div className="az-body" style={{ maxWidth: 720 }}>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '1.8rem' }}>Last updated: {LAST_UPDATED}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', lineHeight: 1.75, fontSize: '.95rem' }}>
          {children}
        </div>
      </div>
      <SiteFooter onPrivacy={onPrivacy} onTerms={onTerms} onContact={onContact} />
    </div>
  )
}

function PrivacyPage(props) {
  return (
    <LegalPage title="Privacy Policy" {...props}>
      <p><strong>What happens to your bill text.</strong> When you type or upload a bill, the text is extracted and held in your browser. Nothing is sent anywhere unless you click a button that runs an analysis.</p>
      <p><strong>When you run an analysis.</strong> The bill text and the details you entered (provider type, insurance status, amount, optional context) are sent to BillShield's server, which forwards them to Anthropic (the maker of the Claude AI model) to generate your report. BillShield does not store a copy of your bill, your results, or your beta access code after the response is returned to your browser.</p>
      <p><strong>"Check My Bill."</strong> The hospital-price lookup and comparison math run entirely in your browser using a public dataset we publish — nothing about your bill lines leaves your device for that comparison. Generating a dispute letter from that comparison does send the matched line items (code, hospital, billed amount) to our server and on to Anthropic, the same as above.</p>
      <p><strong>What we don't do.</strong> BillShield does not sell your data, does not use your bill content to train any model, and does not claim HIPAA compliance — we are not a covered entity or business associate under HIPAA, and this product is not a substitute for discussing your medical records with a covered provider.</p>
      <p><strong>Analytics.</strong> We use Vercel Analytics to see aggregate, anonymized traffic patterns (e.g. which pages are visited). It does not use cookies and does not track you across other sites.</p>
      <p><strong>Contact.</strong> Questions about this policy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </LegalPage>
  )
}

function TermsPage(props) {
  return (
    <LegalPage title="Terms of Service" {...props}>
      <p><strong>Not legal, medical, or financial advice.</strong> BillShield is not a law firm, does not practice medicine, and does not provide legal, medical, or financial advice. The red-flag scan, dispute letters, phone scripts, and bill comparisons are informational starting points for your own conversation with a billing department, insurer, or qualified professional — not a substitute for one.</p>
      <p><strong>No savings guarantee.</strong> We do not guarantee that any amount of your bill will be reduced, waived, or refunded. Outcomes depend on your specific provider, insurer, and circumstances, all of which are outside our control.</p>
      <p><strong>AI-generated content.</strong> Analyses, letters, and scripts generated through the AI-powered flow are produced by a third-party AI model (Anthropic's Claude) based on what you provide. Review everything before sending it — verify names, dates, account numbers, and any factual claim before you rely on it.</p>
      <p><strong>Hospital price data.</strong> The "Check My Bill" feature compares your entered amounts against prices hospitals themselves publish in federally-required machine-readable files. We show the file's source URL and the date we retrieved it. These files can change; we make no claim that the number shown is still current as of today, only that it was published by the hospital as of the stated date.</p>
      <p><strong>Beta access codes.</strong> During the beta, AI-powered features require an access code instead of payment. We may change, revoke, or rate-limit codes at any time without notice.</p>
      <p><strong>Contact.</strong> Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </LegalPage>
  )
}

function ContactPage(props) {
  return (
    <LegalPage title="Contact" {...props}>
      <p>For support, beta access codes, press, or anything else: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      <p>We read every message but, as a small beta project, may take a few business days to respond.</p>
    </LegalPage>
  )
}

// ── Check My Bill (Part B) ──────────────────────────────────────────────────────
function money(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function CheckBill({ onBack, betaCode, onBetaCodeChange, onPrivacy, onTerms, onContact }) {
  const hospitals = listHospitals(hospitalPriceData)
  const [hospitalId, setHospitalId] = useState('')
  const [lines, setLines] = useState([{ code: '', billedAmount: '' }])
  const [result, setResult] = useState(null)
  const [unlocked, setUnlocked] = useState(false)
  const [letter, setLetter] = useState({ loading: false, text: '', error: '', matched: null })

  const hospital = hospitalId ? getHospitalById(hospitalPriceData, hospitalId) : null

  const updateLine = (i, field, value) => {
    setLines(ls => ls.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))
  }
  const addLine = () => setLines(ls => [...ls, { code: '', billedAmount: '' }])
  const removeLine = (i) => setLines(ls => ls.filter((_, idx) => idx !== i))

  const canCompare = hospital && hospital.status === 'available' && lines.some(l => l.code.trim() && l.billedAmount.trim())

  const compare = () => {
    const cleanLines = lines.filter(l => l.code.trim() && l.billedAmount.trim())
    setResult(matchBillLines(hospital, cleanLines))
    setUnlocked(false)
    setLetter({ loading: false, text: '', error: '', matched: null })
  }

  const generateLetter = async () => {
    if (!betaCode.trim()) return
    setLetter({ loading: true, text: '', error: '', matched: null })
    try {
      const cleanLines = lines.filter(l => l.code.trim() && l.billedAmount.trim())
      const res = await fetch('/api/bill-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: betaCode.trim(), hospitalId, lines: cleanLines }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLetter({ loading: false, text: '', error: data.error || 'Letter generation failed.', matched: null })
        return
      }
      setLetter({ loading: false, text: data.letter, error: '', matched: data.matched })
    } catch {
      setLetter({ loading: false, text: '', error: 'Letter generation failed. Please try again.', matched: null })
    }
  }

  const visibleMatched = result ? (unlocked ? result.matched : result.matched.slice(0, 2)) : []
  const lockedCount = result ? Math.max(0, result.matched.length - visibleMatched.length) : 0

  return (
    <div className="az-root">
      <div className="az-head">
        <button className="back-btn" onClick={onBack}>← Home</button>
        <span className="az-head-title">Check My Bill</span>
      </div>
      <div className="az-body">
        <div className="az-label">Free — no AI, no cost</div>
        <h2 className="az-title fraunces">Compare your bill to the hospital's own prices</h2>
        <p className="az-sub">Pick your hospital and enter a billing code and the amount you were charged. We'll compare it against that hospital's own federally-required price disclosure — not an estimate, not AI, just their own published numbers.</p>

        <div className="fg">
          <label>Hospital</label>
          <select className="fs" value={hospitalId} onChange={e => { setHospitalId(e.target.value); setResult(null) }}>
            <option value="">Select a hospital…</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id} disabled={h.status !== 'available'}>
                {h.name}{h.status !== 'available' ? ' — not available yet' : ''}
              </option>
            ))}
          </select>
        </div>

        {lines.map((line, i) => (
          <div key={i} className="b2b-row" style={{ gridTemplateColumns: '1fr 1fr auto', marginBottom: '.6rem' }}>
            <input className="fi" placeholder="Billing code (e.g. 99284)" value={line.code} maxLength={12}
              onChange={e => updateLine(i, 'code', e.target.value)} />
            <input className="fi" placeholder="Amount billed (e.g. $4,850)" value={line.billedAmount} maxLength={20}
              onChange={e => updateLine(i, 'billedAmount', e.target.value)} />
            {lines.length > 1 && <button className="new-btn" style={{ marginTop: 0 }} onClick={() => removeLine(i)}>✕</button>}
          </div>
        ))}
        <button className="new-btn" style={{ marginTop: 0, marginBottom: '1.4rem' }} onClick={addLine}>+ Add another line</button>

        <button className="btn-next" disabled={!canCompare} onClick={compare}>Compare My Bill →</button>

        {hospital && hospital.status !== 'available' && (
          <div className="stripe-note" style={{ marginTop: '1rem' }}>This hospital's price file isn't available yet: {hospital.unavailable_reason}</div>
        )}

        {result && (
          <div style={{ marginTop: '2rem' }}>
            {visibleMatched.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table className="cmp-table">
                  <thead>
                    <tr><th>Code</th><th>Description</th><th>Billed</th><th>Hospital's cash price</th><th>Difference</th></tr>
                  </thead>
                  <tbody>
                    {visibleMatched.map((m, i) => (
                      <tr key={i}>
                        <td>{m.code}</td>
                        <td>{m.description}</td>
                        <td>{money(m.billedAmount)}</td>
                        <td>{money(m.cashPrice)}</td>
                        <td className={m.difference > 0 ? 'cmp-over' : 'cmp-under'}>
                          {m.difference > 0 ? `+${money(m.difference)} more` : m.difference < 0 ? `${money(Math.abs(m.difference))} less` : 'Matches'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.8rem', lineHeight: 1.6 }}>
                  Source: hospital's own machine-readable price file, retrieved {hospital.retrieval_date}. Cash prices apply to self-pay patients — if you're insured, compare your bill against your insurer's Explanation of Benefits (EOB) instead of this cash price.
                </p>
              </div>
            )}

            {lockedCount > 0 && !unlocked && (
              <div className="lock-box">
                <div className="lock-icon">🔒</div>
                <h3 className="lock-title fraunces">{lockedCount} more matched line{lockedCount > 1 ? 's' : ''}</h3>
                <p className="lock-desc">Enter a beta access code to see every matched line and generate a dispute letter.</p>
                <BetaCodeField value={betaCode} onChange={onBetaCodeChange} />
                <button className="unlock-btn" disabled={!betaCode.trim()} onClick={() => setUnlocked(true)}>Unlock Full Comparison →</button>
              </div>
            )}

            {result.unmatched.length > 0 && (
              <div className="flags" style={{ marginTop: '1.4rem' }}>
                {result.unmatched.map((u, i) => (
                  <div key={i} className="flag medium">
                    <div className="flag-h"><div className="flag-title">Code {u.code || '(blank)'}</div></div>
                    <p>
                      {u.reason === 'no_price_on_file' && "This hospital's own file doesn't list a price for this code yet — we only show real published numbers, never a guess."}
                      {u.reason === 'invalid_input' && 'Could not read this line — double check the code and the billed amount.'}
                      {u.reason === 'hospital_not_available' && "Price data for this hospital isn't available yet."}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {result.matched.length > 0 && (unlocked || betaCode.trim()) && (
              <div style={{ marginTop: '2rem' }}>
                <h3 className="fraunces" style={{ marginBottom: '.8rem' }}>Generate a dispute letter</h3>
                {!betaCode.trim() && <BetaCodeField value={betaCode} onChange={onBetaCodeChange} />}
                <button className="btn-next" disabled={!betaCode.trim() || letter.loading} onClick={generateLetter}>
                  {letter.loading ? 'Generating…' : 'Generate Dispute Letter →'}
                </button>
                {letter.error && <p style={{ color: 'var(--red)', fontSize: '.88rem', marginTop: '.6rem' }}>{letter.error}</p>}
                {letter.text && (
                  <div className="letter-box" style={{ marginTop: '1rem' }}>{letter.text}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <SiteFooter onPrivacy={onPrivacy} onTerms={onTerms} onContact={onContact} />
    </div>
  )
}

// ── Admin Stats (owner-only, not linked from the public site) ──────────────────
function AdminStatCard({ title, metric }) {
  return (
    <div className="admin-card">
      <div className="admin-card-head">
        <h3>{title}</h3>
        {metric.tracked
          ? metric.total !== null && <span className="admin-num">{metric.total}</span>
          : <span className="admin-badge">Not tracked yet</span>}
      </div>
      <p className="admin-def">{metric.definition}</p>
      {!metric.tracked && <p className="admin-note">{metric.note}</p>}
    </div>
  )
}

function AdminStats() {
  const [secret, setSecret] = useState(() => {
    try { return sessionStorage.getItem('bs_admin_secret') || '' } catch { return '' }
  })
  const [inputSecret, setInputSecret] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const load = async (secretToUse) => {
    if (!secretToUse) return
    setLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/admin-stats', { headers: { 'x-admin-secret': secretToUse } })
      if (!res.ok) {
        setAuthError(
          res.status === 401
            ? 'Incorrect admin secret, or ADMIN_STATS_SECRET is not set on this deployment.'
            : 'Could not load stats. Please try again.'
        )
        setData(null)
        try { sessionStorage.removeItem('bs_admin_secret') } catch { /* ignore */ }
        return
      }
      const json = await res.json()
      setData(json)
      try { sessionStorage.setItem('bs_admin_secret', secretToUse) } catch { /* ignore */ }
    } catch {
      setAuthError('Could not reach the stats service.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (secret) load(secret)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!data) {
    return (
      <div className="admin-gate">
        <form
          className="admin-gate-card"
          onSubmit={(e) => {
            e.preventDefault()
            setSecret(inputSecret)
            load(inputSecret)
          }}
        >
          <h2 className="fraunces">BillShield Admin</h2>
          <p className="admin-def">Enter the admin stats secret to continue.</p>
          <input
            type="password"
            className="admin-input"
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            placeholder="Admin secret"
            autoFocus
          />
          <button type="submit" className="btn-p" disabled={loading || !inputSecret}>
            {loading ? 'Checking…' : 'View Stats'}
          </button>
          {authError && <p className="admin-error">{authError}</p>}
        </form>
      </div>
    )
  }

  const { metrics, generatedAt } = data

  return (
    <div className="admin-root">
      <div className="admin-head">
        <h1 className="fraunces">BillShield Admin — Stats</h1>
        <div className="admin-head-actions">
          <span className="admin-refreshed">Last refreshed: {new Date(generatedAt).toLocaleString()}</span>
          <button className="btn-s admin-refresh-btn" onClick={() => load(secret)} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {metrics.lastActivity.tracked && metrics.lastActivity.staleWarning && (
        <div className="admin-alert">No recorded activity in the last 72 hours.</div>
      )}

      <div className="admin-grid">
        <AdminStatCard title="Signups" metric={metrics.signups} />
        <AdminStatCard title="Analyses & letters run" metric={metrics.analyses} />
        <AdminStatCard title="Error rate" metric={metrics.errorRate} />
        <AdminStatCard title="Paid vs. free" metric={metrics.paidVsFree} />
        <AdminStatCard title="Revenue events" metric={metrics.revenue} />
        <AdminStatCard
          title="Last activity"
          metric={{
            tracked: metrics.lastActivity.tracked,
            total: metrics.lastActivity.timestamp,
            definition: metrics.lastActivity.definition,
            note: metrics.lastActivity.note,
          }}
        />
      </div>
    </div>
  )
}

// ── App Router ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(() => (window.location.pathname === '/admin' ? 'admin' : 'landing'))
  const [results, setResults] = useState(null)
  const [tier, setTier] = useState('free')
  const [error, setError] = useState('')
  const [betaCode, setBetaCode] = useState('')

  const scrollTo = (id) => {
    setView('landing')
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const analyze = async (billData) => {
    setTier(billData.tier)
    setView('processing')

    // ── FREE TIER: static results, zero API cost ───────────────────────────────
    if (billData.tier === 'free') {
      const staticBase = FREE_RESULTS[billData.providerType] || FREE_RESULTS.other
      setTimeout(() => {
        setResults(staticBase)
        setView('results')
      }, 6000) // let the processing animation play for realism
      return
    }

    // ── PAID TIERS: real Claude AI analysis, gated by beta access code ────────
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: billData.code,
          billData: {
            providerType: billData.providerType,
            insuranceStatus: billData.insuranceStatus,
            billAmount: billData.billAmount,
            rawText: billData.rawText,
            context: billData.context,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Analysis failed. Please try again.')
        setView('error')
        return
      }
      setResults(data)
      setView('results')
    } catch {
      setError('We could not reach the analysis service. Please check your connection and try again.')
      setView('error')
    }
  }

  const goPrivacy = () => setView('privacy')
  const goTerms = () => setView('terms')
  const goContact = () => setView('contact')

  if (view === 'admin') return <AdminStats />
  if (view === 'landing') return <Landing onStart={() => setView('analyze')} onPricing={() => scrollTo('pricing')} onB2B={() => scrollTo('b2b')} onCheckBill={() => setView('checkBill')} onPrivacy={goPrivacy} onTerms={goTerms} onContact={goContact} />
  if (view === 'analyze') return <Analyze onBack={() => setView('landing')} onComplete={analyze} betaCode={betaCode} onBetaCodeChange={setBetaCode} />
  if (view === 'processing') return <Processing />
  if (view === 'error') return <AnalysisError message={error} onRetry={() => setView('analyze')} onHome={() => setView('landing')} />
  if (view === 'results') return <Results results={results} tier={tier} onNew={() => setView('landing')} onUpgrade={() => setView('analyze')} />
  if (view === 'checkBill') return <CheckBill onBack={() => setView('landing')} betaCode={betaCode} onBetaCodeChange={setBetaCode} onPrivacy={goPrivacy} onTerms={goTerms} onContact={goContact} />
  if (view === 'privacy') return <PrivacyPage onBack={() => setView('landing')} onPrivacy={goPrivacy} onTerms={goTerms} onContact={goContact} />
  if (view === 'terms') return <TermsPage onBack={() => setView('landing')} onPrivacy={goPrivacy} onTerms={goTerms} onContact={goContact} />
  if (view === 'contact') return <ContactPage onBack={() => setView('landing')} onPrivacy={goPrivacy} onTerms={goTerms} onContact={goContact} />
}
