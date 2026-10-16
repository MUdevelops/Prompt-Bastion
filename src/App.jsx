import { useState, useEffect, useRef } from 'react'
import { CH, evaluate, HINT_COST, PASS, DIFF_XP, RANKS, rankOf } from './engine.js'

const KEY = 'prompt-bastion-v1'
const blank = () => ({ done: {}, xpGiven: {}, drafts: {}, hints: {}, stats: { runs: 0, cases: 0, defended: 0, streak: 0, perfect: false }, pc: {}, last: {}, hist: [] })
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY)); const b = blank()
    if (!s || typeof s !== 'object') return b
    for (const k in b) if (s[k] && typeof s[k] === 'object' && Array.isArray(s[k]) === Array.isArray(b[k])) b[k] = k === 'stats' ? { ...b.stats, ...s.stats } : s[k]
    return b
  } catch { return blank() }
}
const PILL = ['#FFBB94', '#FB9590', '#EE7480', '#DC586D', '#C14562', '#A33757', '#852E4E', '#6A2548']
const LIGHT = [0, 1, 2]
const ACH = [
  ['First Line of Defense', 'Complete any mission.', (s) => Object.keys(s.done).length > 0],
  ['Override Resisted', 'Complete The Instruction Override.', (s) => s.done.override != null],
  ['Secret Keeper', 'Complete The Secret Vault.', (s) => s.done.vault != null],
  ['Format Guardian', 'Complete The Format Lock.', (s) => s.done.format != null],
  ['Injection Analyst', 'Evaluate 24 or more test cases.', (s) => s.stats.cases >= 24],
  ['Perfect Simulation', 'Score 100 with no hints used.', (s) => s.stats.perfect],
  ['Bastion Master', 'Complete all missions with a 95+ average best score.', (s) => CH.every((c) => s.done[c.id] != null) && avg(s) >= 95]
]
const avg = (s) => { const v = Object.values(s.done); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0 }
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const unlocked = (s, i) => i === 0 || s.done[CH[i - 1].id] != null

function report(s) {
  const done = CH.filter((c) => s.done[c.id] != null)
  const pc = Object.entries(s.pc)
  const top = [...pc].sort((a, b) => b[1].p - a[1].p)[0]
  const fail = [...pc].sort((a, b) => b[1].f - a[1].f)[0]
  return {
    generated: new Date().toISOString(),
    disclaimer: 'Simulated educational tests. This report does not certify the security of any real AI system.',
    completionPercent: Math.round((done.length / CH.length) * 100), missionsCompleted: done.length, totalMissions: CH.length,
    testCasesEvaluated: s.stats.cases, aggregateScore: Math.round(CH.reduce((a, c) => a + (s.done[c.id] || 0), 0) / CH.length), rank: rankOf(avg(s)),
    mostSuccessfulPrinciple: top && top[1].p ? top[0] : null, mostCommonFailure: fail && fail[1].f ? fail[0] : null,
    needsRevision: CH.filter((c) => (s.done[c.id] || 0) < 85).map((c) => c.title),
    challenges: CH.map((c) => ({ id: c.id, title: c.title, completed: s.done[c.id] != null, bestScore: s.done[c.id] ?? null, draft: s.drafts[c.id] || '' })),
    study: ['Prompt injection and indirect prompt injection', 'Least privilege for AI tools and actions', 'Output validation outside the model', 'Defense in depth: prompts are one layer, not a guarantee']
  }
}
function reportHTML(r) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Prompt Bastion Security Report</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:760px;margin:2rem auto;padding:0 1rem;color:#2b0f22}h1{color:#852E4E}table{border-collapse:collapse;width:100%}td,th{border:1px solid #DC586D;padding:.4rem .6rem;text-align:left}pre{background:#fff3ec;padding:.6rem;white-space:pre-wrap}.n{background:#FFBB94;padding:.6rem 1rem;border-radius:12px}</style></head><body><h1>Prompt Bastion Security Report</h1><p class="n">${esc(r.disclaimer)}</p><p>Generated ${esc(r.generated)}</p><ul><li>Training completion: ${r.completionPercent}% (${r.missionsCompleted}/${r.totalMissions})</li><li>Test cases evaluated: ${r.testCasesEvaluated}</li><li>Aggregate simulated score: ${r.aggregateScore}/100 (${esc(r.rank)})</li><li>Most successful principle: ${esc(r.mostSuccessfulPrinciple || 'n/a')}</li><li>Most common failure: ${esc(r.mostCommonFailure || 'n/a')}</li></ul><h2>Missions</h2><table><tr><th>Mission</th><th>Status</th><th>Best</th></tr>${r.challenges.map((c) => `<tr><td>${esc(c.title)}</td><td>${c.completed ? 'Completed' : 'Not completed'}</td><td>${c.bestScore ?? '-'}</td></tr>`).join('')}</table><h2>Needs revision</h2><ul>${r.needsRevision.map((t) => `<li>${esc(t)}</li>`).join('') || '<li>None</li>'}</ul><h2>Saved defenses</h2>${r.challenges.map((c) => `<h3>${esc(c.title)}</h3><pre>${esc(c.draft || '(no draft)')}</pre>`).join('')}<h2>Further study</h2><ul>${r.study.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></body></html>`
}
const download = (name, type, data) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000) }

function Confirm({ open, title, text, yes, onYes, onNo }) {
  const r = useRef(null)
  useEffect(() => { const d = r.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close() }, [open])
  return (
    <dialog ref={r} className="dlg" onCancel={(e) => { e.preventDefault(); onNo() }} aria-labelledby="dlgt">
      <h2 id="dlgt">{title}</h2><p>{text}</p>
      <div className="row"><button className="btn ghost" onClick={onNo}>Cancel</button><button className="btn danger" onClick={onYes}>{yes}</button></div>
    </dialog>
  )
}
const Pill = ({ status }) => <span className={'st ' + status}>{status === 'defended' ? '✓ Defended' : status === 'failed' ? '✕ Failed' : '! Needs review'}</span>

export default function App() {
  const [s, setS] = useState(load)
  const [view, setView] = useState('mission')
  const [cid, setCid] = useState(() => CH.find((c, i) => unlocked(load(), i) && load().done[c.id] == null)?.id || CH[0].id)
  const [res, setRes] = useState({})
  const [menu, setMenu] = useState(false)
  const [ask, setAsk] = useState(false)
  const [learn, setLearn] = useState(false)
  const [toast, setToast] = useState('')
  const ch = CH.find((c) => c.id === cid)
  const idx = CH.indexOf(ch)
  const text = s.drafts[cid] ?? ch.starter
  const r = res[cid]
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage unavailable */ } }, [s])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2200); return () => clearTimeout(t) } }, [toast])
  const go = (v, id) => { if (id) { setCid(id); setLearn(false) } setView(v); setMenu(false); window.scrollTo(0, 0) }
  const setText = (v) => setS((p) => ({ ...p, drafts: { ...p.drafts, [cid]: v } }))
  const completed = Object.keys(s.done).length
  const xp = Object.keys(s.xpGiven).reduce((a, id) => a + (DIFF_XP[CH.find((c) => c.id === id)?.diff] || 0), 0)
  const playerRank = completed ? rankOf(avg(s)) : 'Recruit'

  const run = () => {
    const out = evaluate(ch, text)
    const used = s.hints[cid] || 0
    const final = Math.max(0, out.net - used * HINT_COST)
    const passed = final >= PASS
    const first = passed && !s.xpGiven[cid]
    out.final = final; out.used = used; out.passed = passed; out.first = first
    setRes((p) => ({ ...p, [cid]: out }))
    setS((p) => {
      const pc = { ...p.pc }
      out.rules.forEach((x) => { const c = pc[x.principle] || { p: 0, f: 0 }; pc[x.principle] = { p: c.p + (x.pass ? 1 : 0), f: c.f + (x.pass ? 0 : 1) } })
      const st = p.stats
      return {
        ...p, pc,
        stats: { ...st, runs: st.runs + 1, cases: st.cases + out.cases.length, defended: st.defended + out.cases.filter((c) => c.status === 'defended').length, streak: passed ? st.streak + 1 : 0, perfect: st.perfect || (final === 100 && used === 0) },
        done: passed ? { ...p.done, [cid]: Math.max(p.done[cid] || 0, final) } : p.done,
        xpGiven: first ? { ...p.xpGiven, [cid]: true } : p.xpGiven,
        hints: passed ? { ...p.hints, [cid]: 0 } : p.hints,
        last: { ...p.last, [cid]: final },
        hist: passed ? [{ id: cid, score: final, t: Date.now() }, ...p.hist].slice(0, 5) : p.hist
      }
    })
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const copy = async () => { try { await navigator.clipboard.writeText(text); setToast('Copied to clipboard') } catch { setToast('Copy failed. Select the text and copy manually.') } }
  const hintN = s.hints[cid] || 0
  const reveal = () => hintN < 3 && setS((p) => ({ ...p, hints: { ...p.hints, [cid]: hintN + 1 } }))
  const next = CH[idx + 1]
  const cont = CH.find((c, i) => unlocked(s, i) && s.done[c.id] == null) || CH[CH.length - 1]
  const rep = report(s)

  return (
    <div className="app">
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <button className="btn ghost menu" aria-expanded={menu} aria-controls="nav" onClick={() => setMenu(!menu)}>Menu</button>
        <div className="brand"><svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3l11 4v8c0 7-5 12-11 14C10 27 5 22 5 15V7z" fill="#FFBB94" /><path d="M11 15l4 4 7-8" stroke="#4C1D3D" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><div><strong>Prompt Bastion</strong><span>Build Defenses. Survive the Injection.</span></div></div>
        <div className="sim" role="note">SIMULATION MODE · No live AI model or API is connected.</div>
        <div className="lvl">{view === 'work' ? `Level ${idx + 1} of ${CH.length}` : `${completed}/${CH.length} missions`}</div>
        <button className="btn ghost" onClick={() => setAsk(true)}>Reset</button>
      </header>
      <aside id="nav" className={'side' + (menu ? ' open' : '')}>
        <nav aria-label="Main">
          {[['mission', 'Mission Control'], ['map', 'Challenge Map'], ['report', 'Security Report'], ['about', 'About and Privacy']].map(([v, l]) => <button key={v} className={'nav' + (view === v ? ' on' : '')} aria-current={view === v ? 'page' : undefined} onClick={() => go(v)}>{l}</button>)}
        </nav>
        <p className="lab">Missions</p>
        <ol className="mini">
          {CH.map((c, i) => <li key={c.id}><button className={'nav' + (view === 'work' && cid === c.id ? ' on' : '')} disabled={!unlocked(s, i)} onClick={() => go('work', c.id)}><span className="dot" style={{ background: PILL[i] }} />{c.title}{s.done[c.id] != null && <b className="chk">✓</b>}{!unlocked(s, i) && <i>Locked</i>}</button></li>)}
        </ol>
      </aside>
      <main id="main" className="main" tabIndex="-1">
        {view === 'mission' && (
          <section className="fade">
            <h1>{completed ? 'Welcome back, defender.' : 'Welcome to Prompt Bastion.'}</h1>
            <p className="lead">{completed ? `You have completed ${completed} of ${CH.length} missions. Pick up where you left off.` : 'You will write defensive instructions for a simulated AI assistant, test them against injection attacks, and learn why each rule matters. Start with mission 1.'}</p>
            <div className="row"><button className="btn big" onClick={() => go('work', cont.id)}>{completed ? 'Continue mission' : 'Start first mission'}</button><button className="btn ghost" onClick={() => setAsk(true)}>Restart training</button></div>
            <div className="stats">
              {[['Player rank', playerRank], ['Missions completed', `${completed}/${CH.length}`], ['Current streak', s.stats.streak], ['Attacks tested', s.stats.cases], ['Successful defenses', s.stats.defended], ['XP', xp]].map(([k, v]) => <div className="stat" key={k}><span>{k}</span><strong>{v}</strong></div>)}
            </div>
            <h2>Progress</h2>
            <div className="stack" aria-label="Mission progress">{CH.map((c, i) => <div key={c.id} className="bar" style={{ background: PILL[i], opacity: s.done[c.id] != null ? 1 : 0.28, color: LIGHT.includes(i) ? '#4C1D3D' : '#fff' }}>{c.title}<b>{s.done[c.id] != null ? s.done[c.id] : ''}</b></div>)}</div>
            <h2>Recently completed</h2>
            {s.hist.length ? <ul className="plain">{s.hist.map((h, i) => <li key={i}>{CH.find((c) => c.id === h.id).title}<b>{h.score}/100</b></li>)}</ul> : <p className="muted">Nothing yet. Completed missions will appear here.</p>}
            <h2>Achievements</h2>
            <div className="ach">{ACH.map(([n, d, t]) => { const on = t(s); return <div key={n} className={'a' + (on ? ' on' : '')}><strong>{on ? '★ ' : ''}{n}</strong><span>{d}</span></div> })}</div>
          </section>
        )}
        {view === 'map' && (
          <section className="fade">
            <h1>Challenge Map</h1>
            <p className="lead">Missions unlock in order. Replay any completed mission to improve your best score.</p>
            <ol className="pills">
              {CH.map((c, i) => { const ok = unlocked(s, i); return (
                <li key={c.id} className={'pillc' + (ok ? '' : ' lock')} style={{ background: PILL[i], color: LIGHT.includes(i) ? '#4C1D3D' : '#fff', zIndex: 10 - i }}>
                  <div><strong>{i + 1}. {c.title}</strong><p>{c.brief}</p><small>{c.diff} · {DIFF_XP[c.diff]} XP · Best: {s.done[c.id] ?? '–'}</small></div>
                  <button className="btn pb" disabled={!ok} onClick={() => go('work', c.id)}>{!ok ? 'Locked' : s.done[c.id] != null ? 'Replay' : 'Start'}</button>
                </li>) })}
            </ol>
          </section>
        )}
        {view === 'work' && (
          <section className="fade" key={cid}>
            <p className="muted">Mission {idx + 1} · {ch.diff} · {DIFF_XP[ch.diff]} XP on first completion</p>
            <h1>{ch.title}</h1>
            <p className="lead">{ch.brief}</p>
            <div className="grid2">
              <div className="card">
                <h2>Threat</h2>
                <p><b>Learning objective:</b> {ch.obj}</p>
                <p><b>Expected behavior:</b> {ch.expect}</p>
                <p className="lab">Sample untrusted input</p>
                <pre className="atk">{ch.attack}</pre>
                <p className="muted">Completion: score {PASS}+ after hint penalties. Hidden variations of this attack are tested.</p>
                <details><summary>Defense principles to cover</summary><ul>{ch.rules.map((x) => <li key={x.id}><b>{x.principle}.</b> {x.why}</li>)}</ul></details>
                <h2>Hints</h2>
                <p className="muted">Each hint used deducts {HINT_COST} points from this run's score. Hints go from broad to specific.</p>
                {ch.hints.slice(0, hintN).map((h, i) => <p className="hint" key={i}><b>Hint {i + 1}.</b> {h}</p>)}
                <button className="btn ghost" disabled={hintN >= 3} onClick={reveal}>{hintN >= 3 ? 'All hints shown' : `Reveal hint ${hintN + 1} (−${HINT_COST} pts)`}</button>
              </div>
              <div className="card">
                <label htmlFor="ed" className="lab">YOUR DEFENSIVE INSTRUCTIONS</label>
                <textarea id="ed" className="ed" spellCheck="false" value={text} onChange={(e) => setText(e.target.value)} rows="12" />
                <div className="row sp"><span className="muted">{text.length} characters · draft saved automatically</span></div>
                <div className="row">
                  <button className="btn big" onClick={run}>Run security tests</button>
                  <button className="btn ghost" onClick={copy}>Copy</button>
                  <button className="btn ghost" onClick={() => setText('')}>Clear</button>
                  <button className="btn ghost" onClick={() => setText(ch.starter)}>Reset to starter</button>
                </div>
              </div>
            </div>
            <div id="results" aria-live="polite">
              {!r && <div className="card empty"><h2>No results yet</h2><p>Edit the defense, then run the security tests. Every point in your score will be explained here.</p></div>}
              {r && (
                <div className="card fade">
                  <div className="score"><div className={'ring ' + (r.passed ? 'ok' : 'no')}><strong>{r.final}</strong><span>/100</span></div>
                  <div><h2>{rankOf(r.final)}</h2><p>{r.passed ? `Mission complete${r.first ? ` · +${DIFF_XP[ch.diff]} XP` : ' · XP already earned on first completion'}.` : `Score ${PASS}+ completes this mission. Review the failed checks below.`}</p>
                  <p className="muted">Test cases {r.raw}/100{r.penalty ? ` − unsafe wording ${r.penalty}` : ''}{r.used ? ` − hints ${r.used * HINT_COST}` : ''} · Rule coverage {r.coverage}% · {r.cases.filter((c) => c.status === 'defended').length} defended, {r.cases.filter((c) => c.status === 'failed').length} failed, {r.cases.filter((c) => c.status === 'review').length} to review · {r.ms.toFixed(1)} ms</p>
                  {r.weakest && <p><b>Weakest principle:</b> {r.weakest}</p>}</div></div>
                  {r.penalties.map((p) => <p className="warn" key={p.why}>−{p.pts} points: {p.why}. Remove wording that obeys users or documents unconditionally.</p>)}
                  <h2>Attack versus defense</h2>
                  <ul className="cases">
                    {r.cases.map((c, i) => (
                      <li key={i} className={'case ' + c.status}>
                        <div className="flow">{['Untrusted input', 'Defense rules', 'Simulated decision', 'Result'].map((t, k) => <span key={t} style={{ animationDelay: k * 120 + 'ms' }}>{t}</span>)}</div>
                        <p><b>Attacker input:</b> <code>{c.a}</code></p>
                        <p><b>Rules detected:</b> {c.rules.map((x) => <span key={x.id} className={'tag ' + (x.pass ? 'y' : 'n')}>{x.pass ? '✓' : '✕'} {x.name}</span>)}</p>
                        <p><b>Expected:</b> {c.e}</p>
                        <p><b>Simulated outcome:</b> {c.outcome} <Pill status={c.status} /> <span className="muted">+{c.points}/{c.pts}</span></p>
                        {c.missing.map((m) => <p className="fix" key={m.id}><b>Why it fell short:</b> {m.why} <b>Fix:</b> {m.fix}</p>)}
                      </li>
                    ))}
                  </ul>
                  <h2>Defense rules</h2>
                  <ul className="plain">{r.rules.map((x) => <li key={x.id}><span>{x.pass ? '✓' : '✕'} {x.name}</span><b>{x.pass ? 'Present' : 'Missing'}</b></li>)}</ul>
                  <p className="muted">A rule counts only when its required ideas appear together in a single sentence or line, so scattering keywords across the text does not help.</p>
                  <div className="row"><button className="btn ghost" onClick={run}>Retry</button>{r.passed && next && <button className="btn big" onClick={() => go('work', next.id)}>Next mission</button>}{r.passed && !next && <button className="btn big" onClick={() => go('report')}>View final report</button>}</div>
                </div>
              )}
            </div>
            <div className="card">
              <h2>Sample solution</h2>
              {s.last[cid] != null || learn ? (
                <><pre className="atk">{ch.solution}</pre><ul>{ch.rules.map((x) => <li key={x.id}><b>{x.principle}:</b> {x.why}</li>)}</ul></>
              ) : (
                <><p className="muted">Available after your first test run, or turn on learning mode.</p><button className="btn ghost" onClick={() => setLearn(true)}>Enable learning mode</button></>
              )}
            </div>
          </section>
        )}
        {view === 'report' && (
          <section className="fade" id="rep">
            <h1>{rep.missionsCompleted === CH.length ? 'Final Security Report' : 'Interim Security Report'}</h1>
            <p className="warn">Simulated educational tests only. This report does not certify the security of any real AI system.</p>
            <div className="stats">{[['Training completion', rep.completionPercent + '%'], ['Missions completed', `${rep.missionsCompleted}/${rep.totalMissions}`], ['Test cases evaluated', rep.testCasesEvaluated], ['Aggregate score', rep.aggregateScore + '/100'], ['Rank', rep.rank]].map(([k, v]) => <div className="stat" key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>
            <div className="stack">{CH.map((c, i) => <div key={c.id} className="bar" style={{ background: PILL[i], color: LIGHT.includes(i) ? '#4C1D3D' : '#fff', width: Math.max(30, s.done[c.id] || 0) + '%' }}>{c.title}<b>{s.done[c.id] ?? '–'}</b></div>)}</div>
            <p><b>Most successful principle:</b> {rep.mostSuccessfulPrinciple || 'Run some tests to find out'}</p>
            <p><b>Most common failure pattern:</b> {rep.mostCommonFailure || 'None recorded yet'}</p>
            <h2>Challenges that need revision</h2>
            <ul>{rep.needsRevision.length ? rep.needsRevision.map((t) => <li key={t}>{t}</li>) : <li>None. All missions scored 85+.</li>}</ul>
            <h2>Further study</h2><ul>{rep.study.map((t) => <li key={t}>{t}</li>)}</ul>
            <div className="row noprint">
              <button className="btn" onClick={() => download('prompt-bastion-report.json', 'application/json', JSON.stringify(report(s), null, 2))}>Download JSON</button>
              <button className="btn" onClick={() => download('prompt-bastion-report.html', 'text/html', reportHTML(report(s)))}>Download HTML</button>
              <button className="btn ghost" onClick={() => window.print()}>Print report</button>
            </div>
          </section>
        )}
        {view === 'about' && (
          <section className="fade">
            <h1>About the simulation</h1>
            <p className="lead">Prompt Bastion is a training game. No AI model is called, so results show whether your wording covers the required defensive ideas, not whether a real model would obey it.</p>
            <h2>How the local evaluator works</h2>
            <ul>
              <li>Your text is split into sentences and lines, lowercased, and stripped of punctuation.</li>
              <li>Each challenge defines rules. A rule passes only when every keyword group it needs appears together in the same sentence or line.</li>
              <li>Each test case lists the rules it needs. All present: defended, full points. Some present: needs review, half points. None: failed, zero.</li>
              <li>Wording that hands authority to users or documents costs 15 points. Hints cost {HINT_COST} points each. Scores are deterministic: same text, same score.</li>
              <li>Ranks: {RANKS.slice().reverse().map(([t, n]) => `${t}+ ${n}`).join(', ')}. XP is awarded once, on first completion of each mission.</li>
            </ul>
            <p className="warn">The scoring rules ship with the app and can be read in the browser. They are not secret, and passing a level is not proof that an AI system is secure. Real systems need layered controls beyond prompts: least privilege, output validation and monitoring.</p>
            <h2>Privacy and data</h2>
            <p>Progress, drafts and hint counts are stored in this browser's localStorage and are never sent anywhere. Storage is not encrypted and is visible to anyone using this browser profile. Clearing site data removes your progress.</p>
            <button className="btn danger" onClick={() => setAsk(true)}>Delete saved progress</button>
          </section>
        )}
      </main>
      <Confirm open={ask} title="Reset all progress?" text="This permanently deletes the missions, scores, drafts and statistics saved by Prompt Bastion in this browser." yes="Delete progress" onNo={() => setAsk(false)} onYes={() => { try { localStorage.removeItem(KEY) } catch { /* ignore */ } setS(blank()); setRes({}); setAsk(false); setCid(CH[0].id); setView('mission'); setToast('Progress deleted') }} />
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
