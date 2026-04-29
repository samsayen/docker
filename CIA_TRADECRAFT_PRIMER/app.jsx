
const { useState, useEffect, useRef } = React;

// ── Category config ────────────────────────────────────────────────────────
const CAT = {
  intro:        { label: 'Foundation',   color: '#6b7f99', bg: 'rgba(107,127,153,0.12)', accent: '#6b7f99' },
  diagnostic:   { label: 'Diagnostic',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  accent: '#3b82f6' },
  contrarian:   { label: 'Contrarian',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   accent: '#ef4444' },
  imaginative:  { label: 'Imaginative',  color: '#10b981', bg: 'rgba(16,185,129,0.12)',  accent: '#10b981' },
  capstone:     { label: 'Capstone',     color: '#d6a352', bg: 'rgba(214,163,82,0.12)',  accent: '#d6a352' },
};

// ── Quiz Widget ────────────────────────────────────────────────────────────
function QuizWidget({ quiz, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleSubmit = () => {
    setRevealed(true);
    if (selected === quiz.correct) onComplete && onComplete();
  };

  return (
    <div style={appStyles.quizBox}>
      <div style={appStyles.quizLabel}>Knowledge Check</div>
      <p style={appStyles.quizQ}>{quiz.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {quiz.options.map((opt, i) => {
          let bg = 'transparent';
          let border = '1.5px solid rgba(255,255,255,0.1)';
          let color = 'inherit';
          if (revealed) {
            if (i === quiz.correct) { bg = 'rgba(16,185,129,0.15)'; border = '1.5px solid #10b981'; color = '#10b981'; }
            else if (i === selected && i !== quiz.correct) { bg = 'rgba(239,68,68,0.12)'; border = '1.5px solid #ef4444'; color = '#ef4444'; }
          } else if (selected === i) {
            bg = 'rgba(214,163,82,0.15)'; border = '1.5px solid #d6a352';
          }
          return (
            <button key={i} onClick={() => !revealed && setSelected(i)}
              style={{ ...appStyles.quizOpt, background: bg, border, color: color || 'inherit', cursor: revealed ? 'default' : 'pointer' }}>
              <span style={appStyles.quizLetter}>{String.fromCharCode(65+i)}</span>
              {opt}
            </button>
          );
        })}
      </div>
      {!revealed && (
        <button onClick={handleSubmit} disabled={selected === null}
          style={{ ...appStyles.btn, opacity: selected === null ? 0.4 : 1, marginTop: 12 }}>
          Submit Answer
        </button>
      )}
      {revealed && (
        <div style={appStyles.explanation}>
          <span style={{ color: selected === quiz.correct ? '#10b981' : '#ef4444', fontWeight: 700, marginRight: 6 }}>
            {selected === quiz.correct ? '✓ Correct' : '✗ Incorrect'}
          </span>
          {quiz.explanation}
        </div>
      )}
    </div>
  );
}

// ── ACH Demo Matrix ────────────────────────────────────────────────────────
function ACHDemo({ data }) {
  const [matrix, setMatrix] = useState(() =>
    data.evidence.map(e => [...e.ratings])
  );
  const ratings = ['C', 'I', 'N'];
  const rColor = { C: '#10b981', I: '#ef4444', N: '#6b7280' };

  const cycle = (row, col) => {
    setMatrix(m => {
      const next = m.map(r => [...r]);
      const cur = ratings.indexOf(next[row][col]);
      next[row][col] = ratings[(cur + 1) % ratings.length];
      return next;
    });
  };

  const scores = data.hypotheses.map((_, hi) =>
    matrix.reduce((acc, row) => acc + (row[hi] === 'I' ? -1 : 0), 0)
  );

  return (
    <div style={{ overflowX: 'auto', marginTop: 8 }}>
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
        Click any cell to cycle: <span style={{color:'#10b981'}}>C = Consistent</span> · <span style={{color:'#ef4444'}}>I = Inconsistent</span> · <span style={{color:'#6b7280'}}>N = Not Applicable</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ ...appStyles.achTh, textAlign: 'left', width: '40%' }}>Evidence</th>
            {data.hypotheses.map((h, i) => (
              <th key={i} style={{ ...appStyles.achTh, color: '#d6a352' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.evidence.map((ev, ri) => (
            <tr key={ri}>
              <td style={appStyles.achTd}>{ev.item}</td>
              {matrix[ri].map((r, ci) => (
                <td key={ci} onClick={() => cycle(ri, ci)}
                  style={{ ...appStyles.achTd, textAlign: 'center', cursor: 'pointer',
                    color: rColor[r], fontWeight: 700, fontSize: 14,
                    background: r === 'I' ? 'rgba(239,68,68,0.07)' : r === 'C' ? 'rgba(16,185,129,0.05)' : 'transparent'
                  }}>
                  {r}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td style={{ ...appStyles.achTd, fontWeight: 600, fontSize: 12, color: '#9ca3af' }}>Inconsistency Score</td>
            {scores.map((s, i) => (
              <td key={i} style={{ ...appStyles.achTd, textAlign: 'center', fontWeight: 700,
                color: s === Math.min(...scores) ? '#ef4444' : '#6b7280' }}>
                {s}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
        The hypothesis with the most negative score (most inconsistencies) is the least likely.
      </div>
    </div>
  );
}

// ── Bias Cards ────────────────────────────────────────────────────────────
function BiasCards({ biasGroups }) {
  const groupColors = { blue: '#3b82f6', amber: '#d6a352', green: '#10b981', red: '#ef4444' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 8 }}>
      {biasGroups.map((g, gi) => (
        <div key={gi}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: groupColors[g.color], marginBottom: 10 }}>{g.group}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {g.biases.map((b, bi) => (
              <BiasCard key={bi} bias={b} color={groupColors[g.color]} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BiasCard({ bias, color }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div onClick={() => setFlipped(f => !f)} style={{ cursor: 'pointer', perspective: 600, height: 120 }}>
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transition: 'transform 0.4s', transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}>
        <div style={{ ...appStyles.biasCardFace, background: `${color}18`, border: `1.5px solid ${color}40` }}>
          <div style={{ fontWeight: 700, color, fontSize: 14 }}>{bias.name}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>tap for definition</div>
        </div>
        <div style={{ ...appStyles.biasCardFace, ...appStyles.biasCardBack, background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${color}40` }}>
          <p style={{ fontSize: 12, lineHeight: 1.5, color: '#d1d5db' }}>{bias.description}</p>
        </div>
      </div>
    </div>
  );
}

// ── Historical Examples Table ───────────────────────────────────────────
function HistoricalTable({ examples }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ ...appStyles.achTh, textAlign: 'left', width: '20%' }}>Event</th>
            <th style={{ ...appStyles.achTh, textAlign: 'left' }}>Unchallenged Assumption</th>
            <th style={{ ...appStyles.achTh, textAlign: 'left', color: '#10b981' }}>What Was Actually True</th>
          </tr>
        </thead>
        <tbody>
          {examples.map((ex, i) => (
            <tr key={i}>
              <td style={{ ...appStyles.achTd, fontWeight: 600, color: '#d6a352', verticalAlign: 'top' }}>{ex.event}</td>
              <td style={{ ...appStyles.achTd, verticalAlign: 'top', color: '#f1f5f9' }}>{ex.assumption}</td>
              <td style={{ ...appStyles.achTd, verticalAlign: 'top', color: '#86efac' }}>{ex.reality}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── STEEP Framework ───────────────────────────────────────────────────────
function STEEPGrid({ framework }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginTop: 8 }}>
      {framework.map((item, i) => (
        <div key={i} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', fontFamily: 'Space Grotesk, sans-serif' }}>{item.letter}</div>
          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, marginBottom: 6 }}>{item.word}</div>
          {item.examples.map((ex, j) => (
            <div key={j} style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6 }}>· {ex}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Futures Matrix ────────────────────────────────────────────────────────
function FuturesMatrix({ matrixExample }) {
  const { axis1, axis2, quadrants } = matrixExample;
  const qColors = ['rgba(59,130,246,0.12)', 'rgba(239,68,68,0.12)', 'rgba(16,185,129,0.12)', 'rgba(214,163,82,0.12)'];
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {quadrants.map((q, i) => (
          <div key={i} style={{ background: qColors[i], border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d6a352', marginBottom: 6 }}>{q.label}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{q.examples}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#6b7280' }}>
        <span>← {axis2.left}</span>
        <span style={{ fontStyle: 'italic' }}>{axis2.label}</span>
        <span>{axis2.right} →</span>
      </div>
    </div>
  );
}

// ── Timeline View ────────────────────────────────────────────────────────
function TimelineView({ phases }) {
  const phaseColors = ['#3b82f6', '#d6a352', '#ef4444'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 12 }}>
      {phases.map((phase, pi) => (
        <div key={pi} style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: phaseColors[pi],
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13,
              color: '#fff', flexShrink: 0 }}>{pi + 1}</div>
            {pi < phases.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(255,255,255,0.08)', marginTop: 4 }} />}
          </div>
          <div style={{ paddingBottom: 20 }}>
            <div style={{ fontWeight: 700, color: phaseColors[pi], marginBottom: 4 }}>{phase.phase}</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 10 }}>{phase.description}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {phase.tools.map((t, ti) => (
                <div key={ti} style={{ background: `${phaseColors[pi]}18`, border: `1px solid ${phaseColors[pi]}40`,
                  borderRadius: 6, padding: '4px 10px', fontSize: 12, color: phaseColors[pi] }}>
                  {t.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────
function SectionHeader({ children, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 12px' }}>
      <div style={{ width: 3, height: 18, borderRadius: 2, background: accent, flexShrink: 0 }} />
      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: accent }}>{children}</h3>
    </div>
  );
}

// ── Steps List ────────────────────────────────────────────────────────────
function StepsList({ steps, accent }) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {steps.map((step, i) => (
        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: `${accent}20`,
            border: `1.5px solid ${accent}60`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: accent, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
          <span style={{ fontSize: 14, lineHeight: 1.6, color: '#d1d5db' }}>{step}</span>
        </li>
      ))}
    </ol>
  );
}

// ── Example Box ────────────────────────────────────────────────────────────
function ExampleBox({ title, content }) {
  return (
    <div style={appStyles.exampleBox}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: '#d6a352', marginBottom: 8 }}>Case Study: {title}</div>
      {content.split('\n\n').map((para, i) => (
        <p key={i} style={{ margin: 0, marginBottom: i < content.split('\n\n').length - 1 ? 10 : 0,
          fontSize: 13, lineHeight: 1.7, color: '#c8d0db', fontStyle: para.startsWith('"') ? 'italic' : 'normal' }}>
          {para}
        </p>
      ))}
    </div>
  );
}

// ── Lesson View ────────────────────────────────────────────────────────────
function LessonView({ lesson, onComplete }) {
  const [quizDone, setQuizDone] = useState(false);
  const accent = CAT[lesson.category].color;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: accent, background: `${accent}15`, padding: '3px 10px', borderRadius: 20 }}>
            {CAT[lesson.category].label}
          </span>
        </div>
        <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 800, lineHeight: 1.2,
          fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>{lesson.title}</h1>
        <p style={{ margin: 0, fontSize: 16, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.5 }}>{lesson.tagline}</p>
      </div>

      {/* Summary */}
      <div style={{ fontSize: 15, lineHeight: 1.75, color: '#cbd5e1', padding: '18px 22px',
        background: 'rgba(255,255,255,0.03)', borderRadius: 10, borderLeft: `3px solid ${accent}`,
        marginBottom: 24 }}>
        {lesson.summary}
      </div>

      {/* INTRO: Mindset - Historical Examples (object array) */}
      {lesson.historicalExamples && lesson.historicalExamples[0] && lesson.historicalExamples[0].event && (
        <>
          <SectionHeader accent={accent}>Strategic Assumptions That Were Not Challenged</SectionHeader>
          <HistoricalTable examples={lesson.historicalExamples} />
        </>
      )}

      {/* INTRO: Biases */}
      {lesson.biasGroups && (
        <>
          <SectionHeader accent={accent}>Bias Taxonomy — Tap Cards to Explore</SectionHeader>
          <BiasCards biasGroups={lesson.biasGroups} />
        </>
      )}

      {/* INTRO: Technique Map */}
      {lesson.techniqueMap && (
        <>
          <SectionHeader accent={accent}>Three Categories of Technique</SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {lesson.techniqueMap.map((t, i) => {
              const c = CAT[t.type.toLowerCase()].color;
              return (
                <div key={i} style={{ background: `${c}10`, border: `1px solid ${c}30`, borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: c, fontSize: 14, marginBottom: 6 }}>{t.type}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.5 }}>{t.description}</div>
                  {t.tools.map((tool, j) => (
                    <div key={j} style={{ fontSize: 12, color: '#e2e8f0', padding: '3px 0', borderBottom: j < t.tools.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      {tool}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* How to Use: Timeline */}
      {lesson.timelinePhases && !lesson.timelineDetail && (
        <>
          <SectionHeader accent={accent}>When to Apply Each Technique</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lesson.timelinePhases.map((phase, pi) => (
              <div key={pi} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, color: '#d6a352', marginBottom: 8 }}>{phase.phase}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {phase.tools.map((t, ti) => (
                    <span key={ti} style={{ background: 'rgba(214,163,82,0.12)', border: '1px solid rgba(214,163,82,0.3)',
                      borderRadius: 4, padding: '2px 8px', fontSize: 12, color: '#d6a352' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Strategies: detailed timeline */}
      {lesson.timelineDetail && (
        <>
          <SectionHeader accent={accent}>Analytic Timeline</SectionHeader>
          <TimelineView phases={lesson.timelineDetail} />
        </>
      )}

      {/* Key Principles for Strategies page */}
      {lesson.keyPrinciples && (
        <>
          <SectionHeader accent={accent}>Core Principles</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lesson.keyPrinciples.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: `3px solid ${accent}50` }}>
                <span style={{ color: accent, fontWeight: 700, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>{p}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Standard lesson: When to Use */}
      {lesson.whenToUse && (
        <>
          <SectionHeader accent={accent}>When to Use</SectionHeader>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#cbd5e1', margin: 0 }}>{lesson.whenToUse}</p>
        </>
      )}

      {/* Value Added */}
      {lesson.valueAdded && (
        <>
          <SectionHeader accent={accent}>Value Added</SectionHeader>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#cbd5e1', margin: 0 }}>{lesson.valueAdded}</p>
        </>
      )}

      {/* Steps */}
      {lesson.steps && (
        <>
          <SectionHeader accent={accent}>The Method</SectionHeader>
          <StepsList steps={lesson.steps} accent={accent} />
        </>
      )}

      {/* Rules (brainstorming) */}
      {lesson.rules && (
        <>
          <SectionHeader accent={accent}>Rules for Effective Brainstorming</SectionHeader>
          <StepsList steps={lesson.rules} accent={accent} />
        </>
      )}

      {/* Brainstorm phases */}
      {lesson.phases && (
        <>
          <SectionHeader accent={accent}>Divergent Phase → Convergent Phase</SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 10, fontSize: 13 }}>DIVERGENT — Generate</div>
              <StepsList steps={lesson.phases.divergent} accent="#3b82f6" />
            </div>
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 10, fontSize: 13 }}>CONVERGENT — Organize</div>
              <StepsList steps={lesson.phases.convergent} accent="#10b981" />
            </div>
          </div>
        </>
      )}

      {/* Checklist questions */}
      {lesson.checklistQuestions && (
        <>
          <SectionHeader accent={accent}>Key Questions to Ask</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lesson.checklistQuestions.map((q, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                <span style={{ color: accent, flexShrink: 0 }}>?</span>
                <span style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{q}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Source types */}
      {lesson.sourceTypes && (
        <>
          <SectionHeader accent={accent}>Intelligence Source Types</SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {lesson.sourceTypes.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, color: accent, fontSize: 14, marginBottom: 4 }}>{s.type}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{s.description}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Indicator categories */}
      {lesson.indicatorCategories && (
        <>
          <SectionHeader accent={accent}>Sample Indicator Categories</SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {lesson.indicatorCategories.map((cat, i) => (
              <div key={i} style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: 8, fontSize: 13 }}>{cat.category}</div>
                {cat.examples.map((ex, j) => (
                  <div key={j} style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>· {ex}</div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ACH Demo */}
      {lesson.achDemo && (
        <>
          <SectionHeader accent={accent}>Interactive ACH Matrix</SectionHeader>
          <ACHDemo data={lesson.achDemo} />
        </>
      )}

      {/* VS comparison */}
      {lesson.vsTeamAB && (
        <>
          <SectionHeader accent={accent}>Devil's Advocacy vs. Team A/Team B</SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8, fontSize: 13 }}>Devil's Advocacy</div>
              <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{lesson.vsTeamAB.devilsAdvocacy}</p>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8, fontSize: 13 }}>Team A / Team B</div>
              <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{lesson.vsTeamAB.teamAB}</p>
            </div>
          </div>
        </>
      )}

      {/* Mirror imaging warning */}
      {lesson.mirrorImagingWarning && (
        <>
          <SectionHeader accent={accent}>The Mirror-Imaging Trap</SectionHeader>
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10, padding: '14px 18px', fontSize: 14, lineHeight: 1.7, color: '#fca5a5' }}>
            ⚠️ {lesson.mirrorImagingWarning}
          </div>
        </>
      )}

      {/* STEEP framework */}
      {lesson.steepFramework && (
        <>
          <SectionHeader accent={accent}>The STEEP Framework</SectionHeader>
          <STEEPGrid framework={lesson.steepFramework} />
        </>
      )}

      {/* Historical high-impact examples — string array only */}
      {lesson.historicalExamples && typeof lesson.historicalExamples[0] === 'string' && (
        <>
          <SectionHeader accent={accent}>Historic Low-Probability Events That Materialized</SectionHeader>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {lesson.historicalExamples.map((ex, i) => (
              <span key={i} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 6, padding: '4px 12px', fontSize: 13, color: '#fca5a5' }}>{ex}</span>
            ))}
          </div>
        </>
      )}

      {/* Futures matrix */}
      {lesson.matrixExample && (
        <>
          <SectionHeader accent={accent}>Sample 2×2 Futures Matrix</SectionHeader>
          <FuturesMatrix matrixExample={lesson.matrixExample} />
        </>
      )}

      {/* Case Study */}
      {lesson.example && (
        <>
          <SectionHeader accent={accent}>Case Study</SectionHeader>
          <ExampleBox title={lesson.example.title} content={lesson.example.content} />
        </>
      )}

      {/* Quote */}
      {lesson.quote && (
        <blockquote style={{ margin: '24px 0', padding: '16px 20px',
          borderLeft: `3px solid ${accent}`, background: 'rgba(255,255,255,0.02)',
          borderRadius: '0 8px 8px 0' }}>
          <p style={{ margin: '0 0 8px', fontSize: 15, fontStyle: 'italic', lineHeight: 1.7, color: '#e2e8f0' }}>
            "{lesson.quote.text}"
          </p>
          <cite style={{ fontSize: 12, color: accent, fontStyle: 'normal' }}>— {lesson.quote.source}</cite>
        </blockquote>
      )}

      {/* Category recaps (course overview) */}
      {lesson.categoryRecaps && (
        <>
          <SectionHeader accent={accent}>Recap by Section</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lesson.categoryRecaps.map((cr, i) => {
              const c = CAT[cr.category] ? CAT[cr.category].color : accent;
              return (
                <div key={i} style={{ background: `${c}10`, border: `1px solid ${c}30`,
                  borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: c, marginBottom: 6 }}>{cr.label}</div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#cbd5e1' }}>{cr.summary}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Recap */}
      {lesson.recap && (
        <div style={{ marginTop: 32, padding: '18px 22px',
          background: `${accent}10`, border: `1px solid ${accent}35`,
          borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 3, height: 14, borderRadius: 2, background: accent, flexShrink: 0 }} />
            <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: accent }}>Recap</h3>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none',
            display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lesson.recap.map((point, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: accent, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quiz */}
      <div style={{ marginTop: 32 }}>
        <QuizWidget quiz={lesson.quiz}
          onComplete={() => { setQuizDone(true); onComplete && onComplete(lesson.id); }} />
      </div>

      {quizDone && (
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#10b981' }}>
          ✓ Lesson marked complete
        </div>
      )}
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────
function Sidebar({ lessons, currentId, onSelect, completed, isOpen, onClose }) {
  const groups = [
    { key: 'intro',       label: 'Foundation' },
    { key: 'diagnostic',  label: 'Diagnostic' },
    { key: 'contrarian',  label: 'Contrarian' },
    { key: 'imaginative', label: 'Imaginative' },
    { key: 'capstone',    label: 'Capstone' },
  ];

  return (
    <div style={{ ...appStyles.sidebar, transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}>
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#6b7f99', marginBottom: 4 }}>Tradecraft Primer</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>
          Structured Analytic Techniques
        </div>
        <div style={{ marginTop: 10, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
          <div style={{ height: '100%', background: '#d6a352', borderRadius: 4, width: `${Math.round(completed.size / lessons.length * 100)}%`, transition: 'width 0.5s' }} />
        </div>
        <div style={{ fontSize: 11, color: '#6b7f99', marginTop: 4 }}>{completed.size}/{lessons.length} lessons complete</div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
        {groups.map(g => {
          const groupLessons = lessons.filter(l => l.category === g.key);
          if (!groupLessons.length) return null;
          const accent = CAT[g.key].color;
          return (
            <div key={g.key} style={{ marginBottom: 8 }}>
              <div style={{ padding: '8px 20px 4px', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: accent }}>
                {g.label}
              </div>
              {groupLessons.map(l => {
                const isActive = l.id === currentId;
                const isDone = completed.has(l.id);
                return (
                  <button key={l.id} onClick={() => { onSelect(l.id); onClose(); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 20px',
                      background: isActive ? `${accent}18` : 'transparent',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                      transition: 'all 0.15s' }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      background: isDone ? accent : 'rgba(255,255,255,0.08)',
                      border: isDone ? 'none' : `1px solid rgba(255,255,255,0.15)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, color: isDone ? '#000' : '#6b7f99' }}>
                      {isDone ? '✓' : ''}
                    </span>
                    <span style={{ fontSize: 13, color: isActive ? '#f1f5f9' : '#94a3b8',
                      fontWeight: isActive ? 600 : 400, lineHeight: 1.3 }}>{l.title}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
function App() {
  const lessons = LESSONS_DATA;
  const [currentId, setCurrentId] = useState(() => localStorage.getItem('tp_current') || lessons[0].id);
  const [completed, setCompleted] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('tp_completed') || '[]')); }
    catch { return new Set(); }
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = useRef(null);

  const current = lessons.find(l => l.id === currentId) || lessons[0];
  const currentIndex = lessons.findIndex(l => l.id === currentId);

  useEffect(() => {
    localStorage.setItem('tp_current', currentId);
  }, [currentId]);

  useEffect(() => {
    localStorage.setItem('tp_completed', JSON.stringify([...completed]));
  }, [completed]);

  const markComplete = (id) => {
    setCompleted(prev => new Set([...prev, id]));
  };

  const navigate = (dir) => {
    const next = lessons[currentIndex + dir];
    if (next) {
      setCurrentId(next.id);
      if (contentRef.current) contentRef.current.scrollTop = 0;
    }
  };

  const accent = CAT[current.category].color;

  return (
    <div style={appStyles.root}>
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9, display: 'none' }}
          className="sidebar-overlay" />
      )}

      <Sidebar
        lessons={lessons}
        currentId={currentId}
        onSelect={(id) => { setCurrentId(id); if (contentRef.current) contentRef.current.scrollTop = 0; }}
        completed={completed}
        isOpen={sidebarOpen}
        onClose={() => {}}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={appStyles.topbar}>
          <button onClick={() => setSidebarOpen(o => !o)} style={appStyles.menuBtn}>
            <span>☰</span>
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10,
              background: `${accent}20`, color: accent, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
              {CAT[current.category].label}
            </span>
            <span style={{ fontSize: 13, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {current.title}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#6b7f99', flexShrink: 0 }}>
            {currentIndex + 1} / {lessons.length}
          </div>
        </div>

        {/* Scrollable content */}
        <div ref={contentRef} style={appStyles.content}>
          <LessonView key={currentId} lesson={current} onComplete={markComplete} />

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => navigate(-1)} disabled={currentIndex === 0}
              style={{ ...appStyles.navBtn, opacity: currentIndex === 0 ? 0.3 : 1 }}>
              ← Previous
            </button>
            <div style={{ display: 'flex', gap: 4 }}>
              {lessons.map((l, i) => (
                <div key={i} onClick={() => { setCurrentId(l.id); if (contentRef.current) contentRef.current.scrollTop = 0; }}
                  style={{ width: i === currentIndex ? 20 : 6, height: 6, borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s',
                    background: i === currentIndex ? accent : completed.has(l.id) ? `${accent}60` : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            <button onClick={() => navigate(1)} disabled={currentIndex === lessons.length - 1}
              style={{ ...appStyles.navBtn, opacity: currentIndex === lessons.length - 1 ? 0.3 : 1 }}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const appStyles = {
  root: {
    display: 'flex', height: '100vh', background: '#0e1521',
    color: '#e2e8f0', fontFamily: 'Inter, DM Sans, sans-serif',
    overflow: 'hidden'
  },
  sidebar: {
    width: 260, flexShrink: 0, background: '#0a1018',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', flexDirection: 'column', height: '100vh',
    position: 'sticky', top: 0, zIndex: 10
  },
  topbar: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
    background: '#0e1521', borderBottom: '1px solid rgba(255,255,255,0.07)',
    flexShrink: 0
  },
  menuBtn: {
    background: 'transparent', border: 'none', color: '#94a3b8',
    cursor: 'pointer', fontSize: 18, padding: 4, lineHeight: 1
  },
  content: {
    flex: 1, overflowY: 'auto', padding: '32px 36px 60px',
  },
  quizBox: {
    background: 'rgba(214,163,82,0.06)', border: '1px solid rgba(214,163,82,0.2)',
    borderRadius: 12, padding: '20px 22px'
  },
  quizLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#d6a352', marginBottom: 10
  },
  quizQ: {
    margin: '0 0 14px', fontSize: 15, fontWeight: 600, lineHeight: 1.5, color: '#f1f5f9'
  },
  quizOpt: {
    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
    borderRadius: 8, textAlign: 'left', fontSize: 13, lineHeight: 1.5, transition: 'all 0.15s',
    color: '#cbd5e1', fontFamily: 'inherit'
  },
  quizLetter: {
    width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1
  },
  btn: {
    background: '#d6a352', color: '#000', border: 'none', borderRadius: 8,
    padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'opacity 0.15s'
  },
  navBtn: {
    background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.15s'
  },
  explanation: {
    marginTop: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.04)',
    borderRadius: 8, fontSize: 13, lineHeight: 1.6, color: '#cbd5e1'
  },
  exampleBox: {
    background: 'rgba(214,163,82,0.05)', border: '1px solid rgba(214,163,82,0.2)',
    borderRadius: 10, padding: '18px 20px'
  },
  achTh: {
    padding: '8px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
    textTransform: 'uppercase', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.02)'
  },
  achTd: {
    padding: '8px 10px', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: '#cbd5e1', lineHeight: 1.5
  },
  biasCardFace: {
    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden', borderRadius: 10, padding: 14,
    display: 'flex', flexDirection: 'column', justifyContent: 'center'
  },
  biasCardBack: {
    transform: 'rotateY(180deg)'
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
