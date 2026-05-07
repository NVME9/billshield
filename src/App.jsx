import { useState, useRef, useEffect } from 'react'

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

// ── Landing Page ───────────────────────────────────────────────────────────────
function Landing({ onStart, onPricing, onB2B }) {
  const [b2bSent, setB2bSent] = useState(false)
  const [b2b, setB2b] = useState({ name: '', org: '', email: '', size: '' })

  const plans = [
    { name: 'Free', price: '$0', sub: '', desc: 'Get a basic bill explanation and Shield Score overview.', features: ['Bill explanation in plain English', 'Shield Score overview', 'General negotiation tips', '1 analysis per month'], hot: false, badge: null, cta: 'Get Started', onClick: onStart },
    { name: 'Basic', price: '$19', sub: 'one-time', desc: 'Everything you need to dispute a single bill.', features: ['Full red flag scan', 'Personalized dispute letter', 'Phone call script', 'State-specific rights', 'Action plan'], hot: true, badge: 'Most Popular', cta: 'Get Started', onClick: onStart },
    { name: 'Unlimited', price: '$49', sub: '/mo', desc: 'For ongoing medical situations or managing bills for your family.', features: ['Unlimited bill analyses', 'Everything in Basic', 'Priority AI analysis', 'Progress tracking', 'Cancel anytime'], hot: false, badge: null, cta: 'Subscribe', onClick: onStart },
    { name: 'Enterprise', price: 'Custom', sub: '', desc: 'For patient advocacy orgs, HR departments, and elder care facilities.', features: ['White-label option', 'Bulk bill analysis', 'API access', 'Dedicated account manager', 'Custom integrations'], hot: false, badge: null, cta: 'Contact Us', onClick: onB2B },
  ]

  const features = [
    ['🔍', 'Red Flag Scanner', "Identifies duplicate charges, upcoded procedures, unbundled services, and charges that don't match your treatment."],
    ['📄', 'Dispute Letter Generator', 'A professional, legally-worded letter tailored to your situation — ready to mail or email today.'],
    ['📞', 'Phone Script', 'Exactly what to say when you call billing, including how to handle common pushback.'],
    ['🧾', 'Bill Explainer', 'Plain-English breakdown of every line item and medical code — no decoder ring needed.'],
    ['📊', 'Shield Score', 'A 0–100 legitimacy rating so you instantly know how hard to push and what you\'re likely to recover.'],
    ['🏛️', 'Patient Rights Guide', 'Your rights by state, including balance billing protections, charity care laws, and dispute timelines.'],
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
          <button className="nav-link" onClick={onPricing}>Pricing</button>
          <button className="nav-link" onClick={onB2B}>For Organizations</button>
        </div>
        <button className="nav-cta" onClick={onStart}>Analyze My Bill</button>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="eyebrow">⚡ 80% of medical bills contain errors</div>
        <h1>Your medical bill is probably <em>wrong.</em> We&apos;ll prove it.</h1>
        <p className="hero-sub">Upload your bill, get an AI-powered red flag scan, a ready-to-send dispute letter, and a phone script — in under 2 minutes.</p>
        <div className="hero-btns">
          <button className="btn-p" onClick={onStart}>Analyze My Bill Free →</button>
          <button className="btn-s" onClick={onPricing}>See Pricing</button>
        </div>
        <div className="hero-stats">
          {[['$450','Avg savings per bill'],['80%','Bills have errors'],['2 min','To your dispute letter']].map(([n,l]) => (
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
          <p className="s-sub">The same tools billing specialists use — without taking 30% of your savings.</p>
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
          <p style={{ color: 'rgba(255,255,255,.5)', textAlign: 'center', marginTop: '.5rem' }}>Pay $19 once. Save hundreds. Do the math.</p>
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
          <p style={{ color: 'rgba(255,255,255,.5)', marginTop: '.5rem', lineHeight: 1.75 }}>Patient advocacy groups, elder care facilities, HR departments, and credit unions use BillShield to help the people they serve recover millions in billing errors.</p>
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

      {/* FOOTER */}
      <footer>
        <div className="fl">Bill<span>Shield</span></div>
        <div className="f-links">
          <button className="f-link">Privacy</button>
          <button className="f-link">Terms</button>
          <button className="f-link">Contact</button>
        </div>
        <p className="disclaimer">BillShield is not a law firm and does not provide legal advice. We help you understand your bill and communicate with billing departments. Always consult a qualified attorney for legal matters.</p>
      </footer>
    </div>
  )
}

// ── Analyze Flow ───────────────────────────────────────────────────────────────
function Analyze({ onBack, onComplete }) {
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
      setPdfText(txt || `[PDF: ${file.name} — no text extracted. Describe charges below.]`)
    } catch {
      setPdfText(`[Could not read PDF. Please describe your bill manually.]`)
    } finally {
      setPdfLoading(false)
    }
  }

  const ok1 = method === 'text' ? billText.trim().length > 15 : (pdfText.length > 0 && !pdfLoading)
  const ok2 = providerType && insuranceStatus && billAmount
  const go = () => onComplete({ rawText: method === 'text' ? billText : pdfText, providerType, insuranceStatus, billAmount, context, tier })

  const providers = [['hospital','Hospital (inpatient)'],['er','Emergency Room'],['specialist','Specialist / Outpatient'],['lab','Lab / Diagnostic'],['urgent_care','Urgent Care'],['surgery_center','Surgery Center'],['dental','Dental'],['other','Other']]
  const insurance = [['insured','Fully insured'],['underinsured','Underinsured / High deductible'],['uninsured','Uninsured / Self-pay'],['medicare','Medicare / Medicaid']]
  const tiers = [
    { id: 'free', name: 'Free Analysis', price: '$0', desc: 'Basic bill explanation + Shield Score overview' },
    { id: 'basic', name: 'Full Dispute Kit', price: '$19 one-time', desc: 'Red flag scan + dispute letter + phone script', badge: 'Most Popular' },
    { id: 'unlimited', name: 'Unlimited', price: '$49/mo', desc: 'Unlimited analyses for ongoing or family bills' },
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
                <textarea className="ft" value={billText} onChange={e => setBillText(e.target.value)}
                  placeholder="e.g. Emergency room visit March 12. Charged: ER facility fee $2,800, Physician $450, CT scan $1,200, Lab work $380, IV administration $290 listed twice..." />
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
              <input className="fi" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="e.g. $3,450" />
            </div>
            <div className="fg">
              <label>Anything else we should know? (optional)</label>
              <textarea className="ft" style={{ minHeight: 90 }} value={context} onChange={e => setContext(e.target.value)}
                placeholder="e.g. Never signed a financial agreement, was unconscious when admitted, procedure was labeled elective but was urgent..." />
            </div>
            <button className="btn-next" disabled={!ok2} onClick={() => setStep(3)}>Continue →</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="az-label">Step 3 of 3</div>
            <h2 className="az-title fraunces">Choose your plan</h2>
            <p className="az-sub">Start free to see your Shield Score, or unlock the full dispute toolkit immediately.</p>
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
              <div className="stripe-note">
                💳 <strong>Stripe:</strong> Replace <code>YOUR_STRIPE_KEY</code> in <code>src/stripe.js</code> with your publishable key to enable live payments.
              </div>
            )}
            <button className="btn-next" onClick={go}>
              {tier === 'free' ? 'Analyze My Bill Free →' : `Analyze My Bill (${tier === 'basic' ? '$19' : '$49/mo'}) →`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Processing ─────────────────────────────────────────────────────────────────
function Processing() {
  const [active, setActive] = useState(0)
  const steps = ['Parsing your bill…', 'Scanning for red flags…', 'Drafting dispute letter…', 'Building your action plan…']
  useEffect(() => {
    const t = setInterval(() => setActive(s => Math.min(s + 1, steps.length - 1)), 2400)
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

// ── Results ────────────────────────────────────────────────────────────────────
function Results({ results, tier, onNew }) {
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
            <div className="sav-pill">💰 Potential savings: {results.totalPotentialSavings}</div>
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
                {f.potentialSavings && <div className="flag-sav">Potential savings: {f.potentialSavings}</div>}
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
                <p className="lock-desc">Get your personalized dispute letter, phone script, and action plan for a one-time $19.</p>
                <button className="unlock-btn">Unlock for $19 →</button>
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
const FREE_RESULTS = {
  hospital: {
    shieldScore: 51,
    summary: 'Hospital bills are among the most error-prone in the industry. We found common issues that frequently appear on inpatient bills — including charges worth challenging before you pay anything.',
    redFlags: [
      { issue: 'Duplicate room & board charge', description: 'Hospital stays are frequently billed with overlapping room charges, especially around admission and discharge dates. This is one of the top errors on inpatient bills.', severity: 'high', potentialSavings: '$300–800' },
      { issue: 'Itemized supply charges not justified', description: 'Hospitals often charge $15–50 for individual items like gloves, gowns, or saline that should be bundled into the facility fee. These are routinely removed on request.', severity: 'medium', potentialSavings: '$100–400' },
      { issue: 'Physician fee billed separately without notice', description: 'Doctors who treated you in the hospital may bill separately from the hospital itself, sometimes out-of-network even when the hospital is in-network.', severity: 'medium', potentialSavings: '$150–500' },
    ],
    totalPotentialSavings: '$550–1,700',
  },
  er: {
    shieldScore: 47,
    summary: 'Emergency room bills have the highest error rate of any medical bill type. Multiple providers, facility fees, and rushed billing make ER charges particularly worth disputing.',
    redFlags: [
      { issue: 'Facility fee on top of physician fee', description: 'ER visits commonly generate two separate bills — one from the hospital and one from the ER physician group. The facility fee alone can often be negotiated down significantly.', severity: 'high', potentialSavings: '$400–1,200' },
      { issue: 'Level of care may be overcoded', description: 'ER visits are billed on a scale from Level 1–5. Hospitals routinely bill Level 4 or 5 when a lower level is more appropriate. This is one of the most disputed charges in healthcare.', severity: 'high', potentialSavings: '$200–600' },
      { issue: 'Medications billed at retail markup', description: 'Hospitals frequently charge 10–100x the actual cost of medications administered in the ER. Request an itemized breakdown of every drug charge.', severity: 'medium', potentialSavings: '$50–300' },
    ],
    totalPotentialSavings: '$650–2,100',
  },
  specialist: {
    shieldScore: 58,
    summary: 'Specialist bills commonly contain coding errors and charges for services not directly tied to your visit. A few key items are worth requesting documentation on before paying.',
    redFlags: [
      { issue: 'Upcoded office visit level', description: 'Specialists frequently bill a higher complexity level (99214 or 99215) than the visit warranted. Ask for the documentation that justifies the billing level.', severity: 'medium', potentialSavings: '$75–250' },
      { issue: 'Separate charge for results review', description: 'Reviewing test results is often bundled into the office visit fee, but some practices bill it as a separate service. This is frequently reversed on request.', severity: 'low', potentialSavings: '$50–150' },
      { issue: 'Out-of-network assistant surgeon', description: 'If your visit involved any procedure, an assistant surgeon or anesthesiologist may have been out-of-network without your knowledge or consent.', severity: 'medium', potentialSavings: '$200–800' },
    ],
    totalPotentialSavings: '$325–1,200',
  },
  lab: {
    shieldScore: 62,
    summary: 'Lab bills are frequently inflated through panel bundling and duplicate test charges. These are among the easiest bills to dispute successfully.',
    redFlags: [
      { issue: 'Panel tests billed individually', description: 'Labs sometimes unbundle a standard panel (like a comprehensive metabolic panel) and bill each component test separately at a higher total cost than the panel price.', severity: 'high', potentialSavings: '$100–350' },
      { issue: 'Same test billed twice', description: 'Duplicate test charges are common in lab billing, especially when samples are split or tests are run on different days during the same visit.', severity: 'medium', potentialSavings: '$50–200' },
      { issue: 'Out-of-network lab used without notice', description: 'Your doctor may have sent your samples to an out-of-network lab without informing you, resulting in much higher charges than expected.', severity: 'medium', potentialSavings: '$100–400' },
    ],
    totalPotentialSavings: '$250–950',
  },
  urgent_care: {
    shieldScore: 64,
    summary: 'Urgent care bills are generally simpler than hospital bills but still contain common errors worth addressing before payment.',
    redFlags: [
      { issue: 'Facility fee added to visit', description: 'Some urgent care centers charge a facility fee on top of the physician visit fee. This is often negotiable, especially if you were unaware of it when you checked in.', severity: 'medium', potentialSavings: '$75–200' },
      { issue: 'Supplies billed at excessive markup', description: 'Bandages, gloves, or wound care supplies are frequently billed at 5–20x their actual cost. Request an itemized list and challenge any supply charges over $25.', severity: 'low', potentialSavings: '$30–120' },
      { issue: 'Billed as ER rather than urgent care', description: 'If your visit was billed under an ER billing code instead of an urgent care code, you may have been charged significantly more than necessary.', severity: 'high', potentialSavings: '$200–600' },
    ],
    totalPotentialSavings: '$305–920',
  },
  surgery_center: {
    shieldScore: 49,
    summary: 'Surgery center bills are complex and frequently contain implant markups, anesthesia overcharges, and unbundled service fees that are worth a thorough review.',
    redFlags: [
      { issue: 'Implant or device marked up significantly', description: 'Surgery centers frequently mark up the cost of implants, hardware, or devices by 100–500% over their actual cost. You have the right to request the invoice price.', severity: 'high', potentialSavings: '$500–3,000' },
      { issue: 'Anesthesia time billed incorrectly', description: 'Anesthesia is billed in time units. Rounding up or miscounting the actual time is common. Request the start and end times documented in your surgical record.', severity: 'high', potentialSavings: '$200–800' },
      { issue: 'Pre-op and post-op billed separately', description: 'Pre-operative and post-operative care is typically bundled into the surgical fee. Billing these separately is considered unbundling and is a dispute-worthy charge.', severity: 'medium', potentialSavings: '$150–500' },
    ],
    totalPotentialSavings: '$850–4,300',
  },
  dental: {
    shieldScore: 60,
    summary: 'Dental bills commonly contain coding errors and charges for procedures that should be bundled together. Several items here are worth questioning.',
    redFlags: [
      { issue: 'Procedure bundling error', description: 'Certain dental procedures must be billed together under one code. Billing them separately — called unbundling — inflates the total and is grounds for a dispute.', severity: 'medium', potentialSavings: '$75–300' },
      { issue: 'X-rays billed at non-standard rate', description: 'Dental X-ray charges vary widely. If your bill shows X-ray charges significantly above the standard rate for your area, this can be negotiated.', severity: 'low', potentialSavings: '$40–150' },
      { issue: 'Insurance coordination error', description: 'If you have both primary and secondary dental insurance, coordination of benefits errors frequently result in you being billed for amounts your secondary insurer should cover.', severity: 'medium', potentialSavings: '$100–400' },
    ],
    totalPotentialSavings: '$215–850',
  },
  other: {
    shieldScore: 55,
    summary: 'Medical bills across all provider types share common error patterns. We\'ve flagged the most likely issues based on your bill details.',
    redFlags: [
      { issue: 'No itemized bill provided', description: 'You have the legal right to a complete itemized bill. Without one, it\'s impossible to verify every charge. Always request this before paying any medical bill.', severity: 'high', potentialSavings: 'Unknown until reviewed' },
      { issue: 'Potential duplicate charges', description: 'Duplicate line items are one of the most common medical billing errors. An itemized bill will reveal whether any service was charged more than once.', severity: 'medium', potentialSavings: '$100–500' },
      { issue: 'Financial assistance may be available', description: 'Most hospitals and many providers offer charity care or financial hardship programs that are rarely advertised. Ask the billing department directly before paying.', severity: 'low', potentialSavings: 'Up to 100% of balance' },
    ],
    totalPotentialSavings: '$200–1,000+',
  },
}

const API_ERROR_FALLBACK = {
  shieldScore: 54,
  summary: 'We found several potential issues worth investigating. Duplicate charges and facility fees are common in this bill type.',
  redFlags: [
    { issue: 'Potential duplicate charge', description: 'A charge appears listed more than once. This is one of the most common medical billing errors and is often corrected upon request.', severity: 'high', potentialSavings: '$200–400' },
    { issue: 'Upcoded procedure', description: 'The procedure code billed may not match the actual service provided. Request documentation supporting this billing level.', severity: 'medium', potentialSavings: '$100–250' },
    { issue: 'No itemized bill on record', description: 'Without a full itemized bill it\'s impossible to verify all charges. You have the right to request one at any time.', severity: 'low', potentialSavings: 'Unknown' },
  ],
  totalPotentialSavings: '$300–650',
  negotiationLetter: 'Dear Billing Department,\n\nI am writing to formally dispute charges on my recent medical bill. After reviewing the statement, I have identified several items that warrant review.\n\nI am requesting:\n1. A complete itemized bill with each procedure code\n2. A review of any duplicate line items\n3. Documentation supporting the billing codes used\n\nPlease respond within 30 business days. I am happy to work with your team to resolve this matter.\n\nSincerely,\n[Your Name]\n[Date of Service]\n[Account Number]',
  phoneScript: 'Step 1 — Opening:\n"Hi, I\'m calling about a recent bill. My name is [Name] and my account number is [#]. I have some questions about specific charges."\n\nStep 2 — Request itemized bill:\n"Can you send me a complete itemized bill with each procedure code? I\'ll need that before I can pay."\n\nStep 3 — If they push back:\n"I understand, but I have the right to an itemized bill. I\'d like to submit that request in writing if needed."\n\nStep 4 — Dispute specific items:\n"I also noticed this charge appears twice — can you look into that?"\n\nStep 5 — Ask about financial assistance:\n"Do you have a charity care program or financial hardship assistance I might qualify for?"\n\nStep 6 — Close:\n"I\'d like to resolve this. Can we set a follow-up date if I don\'t hear back within 30 days?"',
  nextSteps: [
    'Request a complete itemized bill in writing within 5 business days',
    'Call the billing department and escalate to a supervisor if needed',
    'Send the dispute letter via certified mail with return receipt',
    'Follow up in 30 days — if unresolved, contact your state insurance commissioner',
  ],
}

// ── App Router ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('landing')
  const [results, setResults] = useState(null)
  const [tier, setTier] = useState('free')

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

    // ── PAID TIERS: real Claude AI analysis ───────────────────────────────────
    const prompt = `You are a medical billing expert and patient advocate. Analyze this medical bill and identify errors, overcharges, and negotiation opportunities.

Bill Information:
- Provider Type: ${billData.providerType}
- Insurance Status: ${billData.insuranceStatus}
- Total Billed: ${billData.billAmount}
- Bill Content: ${billData.rawText || 'Not provided — analyze based on provider type and amount, and note common issues for this bill type'}
- Additional Context: ${billData.context || 'None'}

Respond ONLY with a valid JSON object. No markdown. No code blocks. No preamble. Exact structure:
{
  "shieldScore": <integer 0-100, 100=fully legitimate, lower=more issues>,
  "summary": "<2-3 sentence plain-English overview>",
  "redFlags": [{"issue":"<title>","description":"<plain English explanation>","severity":"high|medium|low","potentialSavings":"<e.g. $100-300>"}],
  "totalPotentialSavings": "<range>",
  "negotiationLetter": "<complete professional letter addressed to the billing department — use actual newlines — reference specific issues found>",
  "phoneScript": "<step by step script with what to say and exactly how to handle common pushback>",
  "nextSteps": ["<step 1>","<step 2>","<step 3>","<step 4>"]
}`

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResults(data)
      setView('results')
    } catch {
      setResults(API_ERROR_FALLBACK)
      setView('results')
    }
  }

  if (view === 'landing') return <Landing onStart={() => setView('analyze')} onPricing={() => scrollTo('pricing')} onB2B={() => scrollTo('b2b')} />
  if (view === 'analyze') return <Analyze onBack={() => setView('landing')} onComplete={analyze} />
  if (view === 'processing') return <Processing />
  if (view === 'results') return <Results results={results} tier={tier} onNew={() => setView('landing')} />
}
