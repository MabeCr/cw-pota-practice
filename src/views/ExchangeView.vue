<script setup lang="ts">
</script>

<template>
  <div class="exchange-container">
    <div class="exchange-content">

      <header class="page-header">
        <p class="page-eyebrow">Reference</p>
        <h1 class="page-title">The POTA CW Exchange</h1>
        <p class="page-subtitle">
          A quick-reference guide to the standard Parks on the Air Morse exchange.
        </p>
      </header>

      <!-- Overview -->
      <section class="card">
        <h2 class="card-heading">What is the POTA Exchange?</h2>
        <p class="card-body">
          Parks on the Air (POTA) contacts follow a short, standardized CW exchange.
          The <strong>activator</strong> (operating from a park) sends a signal report and their
          state or province abbreviation. The <strong>hunter</strong> (calling in) confirms with their
          own report back. The whole thing is fast and repeatable, which is important when you have a pileup going.
        </p>
      </section>

      <!-- Exchange Flow -->
      <section class="card">
        <h2 class="card-heading">Exchange Flow</h2>

        <div class="flow">

          <div class="flow-step activator">
            <div class="step-label">Activator calls CQ</div>
            <div class="exchange-line">
              <span class="role-tag act">ACT</span>
              <code class="cw">CQ CQ POTA DE <em>KM4BE</em> K</code>
            </div>
            <p class="step-note">Keep calling until a hunter responds.</p>
          </div>

          <div class="flow-arrow">↓</div>

          <div class="flow-step hunter">
            <div class="step-label">Hunter calls in</div>
            <div class="exchange-line">
              <span class="role-tag hnt">HNT</span>
              <code class="cw"><em>KF8ENC</em></code>
            </div>
            <p class="step-note">The hunter sends just their callsign. In a pileup, multiple hunters may call at the same time.</p>
          </div>

          <div class="flow-arrow">↓</div>

          <div class="flow-step activator">
            <div class="step-label">Activator works the hunter</div>
            <div class="exchange-line">
              <span class="role-tag act">ACT</span>
              <code class="cw"><em>KF8ENC</em> TU GM UR 599 599 OH OH BK</code>
            </div>
            <p class="step-note">
              The activator sends the hunter's callsign, a greeting, the signal report, and their state. BK at the end signals "back to you."
            </p>
          </div>

          <div class="flow-arrow">↓</div>

          <div class="flow-step hunter">
            <div class="step-label">Hunter confirms</div>
            <div class="exchange-line">
              <span class="role-tag hnt">HNT</span>
              <code class="cw">BK TU UR 599 599 OH OH BK</code>
            </div>
            <p class="step-note">The hunter confirms with their own report and sends BK to pass it back to the activator.</p>
          </div>

          <div class="flow-arrow">↓</div>

          <div class="flow-step activator">
            <div class="step-label">Activator closes the QSO</div>
            <div class="exchange-line">
              <span class="role-tag act">ACT</span>
              <code class="cw">BK TU OH OH 73 "dit dit"</code>
            </div>
            <p class="step-note">The activator wraps up with the hunter's state, 73, and a dit dit. This is an invitation for the hunter to send dit dit back to close out the contact.</p>
          </div>

        </div>
      </section>

      <!-- Signal Report -->
      <section class="card">
        <h2 class="card-heading">Signal Report (RST)</h2>
        <p class="card-body">
          POTA CW uses the three-digit <strong>RST system</strong> to report readability, strength, and tone.
          Each digit has its own scale:
        </p>
        <table class="ref-table">
          <thead>
            <tr><th>Digit</th><th>Meaning</th><th>Scale</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>R</strong> (Readability)</td><td>How clearly can you copy the signal?</td><td>1 (unreadable) to 5 (perfectly readable)</td></tr>
            <tr><td><strong>S</strong> (Strength)</td><td>How strong is the signal?</td><td>1 (faint) to 9 (extremely strong)</td></tr>
            <tr><td><strong>T</strong> (Tone)</td><td>How clean is the CW note?</td><td>1 (very rough) to 9 (pure, clean tone)</td></tr>
          </tbody>
        </table>
        <p class="card-body">
          You will also hear operators send <strong>5NN</strong> instead of 599. In CW shorthand, N is
          used in place of 9 because it is faster to key. So 5NN and 599 mean exactly the same thing.
        </p>
      </section>

      <!-- Park to Park -->
      <section class="card">
        <h2 class="card-heading">Park-to-Park (P2P) Contacts</h2>
        <p class="card-body">
          If the hunter is also activating a park, the contact is called Park-to-Park (P2P) and counts as a bonus QSO for both logs. The hunter flags it by including their park reference when they call in.
        </p>
        <div class="flow">
          <div class="flow-step hunter">
            <div class="step-label">Hunter (also activating) calls in</div>
            <div class="exchange-line">
              <span class="role-tag hnt">HNT</span>
              <code class="cw"><em>KF8ENC</em> P2P or P2P <em>KF8ENC</em></code>
            </div>
            <p class="step-note">Callsign, then P2P or P2P, then Callsign. Both are OK.</p>
          </div>
          <div class="flow-arrow">↓</div>
          <div class="flow-step activator">
            <div class="step-label">Activator acknowledges the P2P</div>
            <div class="exchange-line">
              <span class="role-tag act">ACT</span>
              <code class="cw"><em>KF8ENC</em> TU GM UR 599 599 OH OH K1995 K1995 BK</code>
            </div>
            <p class="step-note">The same exchange as normal, but with P2P called out so both operators can log it correctly.</p>
          </div>
          <div class="flow-arrow">↓</div>

          <div class="flow-step hunter">
            <div class="step-label">Hunter confirms</div>
            <div class="exchange-line">
              <span class="role-tag hnt">HNT</span>
              <code class="cw">BK TU UR 599 599 OH OH K1940 K1940 BK</code>
            </div>
            <p class="step-note">The hunter confirms with their own report and sends BK to pass it back to the activator.</p>
          </div>
        </div>
      </section>

      <!-- Quick Reference -->
      <section class="card">
        <h2 class="card-heading">Quick Reference</h2>
        <table class="ref-table">
          <thead>
            <tr><th>Abbreviation</th><th>Meaning</th></tr>
          </thead>
          <tbody>
            <tr><td><code>CQ</code></td><td>A general call inviting any station to reply</td></tr>
            <tr><td><code>DE</code></td><td>Means "from" and precedes the sender's callsign</td></tr>
            <tr><td><code>K</code></td><td>Go ahead, invitation to transmit</td></tr>
            <tr><td><code>BK</code></td><td>Back to you, passing the transmission back</td></tr>
            <tr><td><code>TU</code></td><td>Thank you, used to confirm the contact</td></tr>
            <tr><td><code>P2P</code></td><td>Park-to-Park, meaning both stations are activating a park</td></tr>
            <tr><td><em>State/Province</em></td><td>Two-letter abbreviation for the park's location, such as OH, CA, or TX</td></tr>
          </tbody>
        </table>
      </section>

    </div>
  </div>
</template>

<style scoped>
.exchange-container {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 36px 40px;
}

.exchange-content {
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Page header ── */
.page-header {
  margin-bottom: 8px;
}

.page-eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--accent-text);
  margin: 0 0 10px;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 12px;
  letter-spacing: -0.01em;
}

.page-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

/* ── Cards ── */
.card {
  background: var(--bg-surface);
  border-radius: 10px;
  padding: 28px 32px;
  box-shadow: var(--shadow-card);
}

.card-heading {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-text);
  margin: 0 0 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-subtle);
}

.card-body {
  font-size: 0.94rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 14px;
}

.card-body:last-child {
  margin-bottom: 0;
}

.card-body strong {
  color: var(--text-primary);
  font-weight: 600;
}

/* ── Flow diagram ── */
.flow {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.flow-step {
  border-radius: 8px;
  padding: 14px 18px;
}

.flow-step.activator {
  background: var(--accent-light-2);
  border-left: 3px solid var(--accent);
}

.flow-step.hunter {
  background: var(--bg-surface-alt);
  border-left: 3px solid var(--border-strong);
}

.step-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.exchange-line {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.role-tag {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 4px;
  flex-shrink: 0;
}

.role-tag.act {
  background: var(--accent);
  color: #fff;
}

.role-tag.hnt {
  background: var(--border-strong);
  color: var(--text-primary);
}

.cw {
  font-family: var(--font-mono);
  font-size: 0.97rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.04em;
}

.cw em {
  font-style: normal;
  color: var(--accent-text);
}

.step-note {
  font-size: 0.83rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin: 0;
}

.step-note strong {
  color: var(--text-secondary);
  font-weight: 600;
}

.flow-arrow {
  text-align: center;
  color: var(--text-faint);
  font-size: 1.1rem;
  line-height: 1;
  padding: 2px 0;
}

/* ── Tables ── */
.ref-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin-top: 4px;
}

.ref-table th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-default);
}

.ref-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  line-height: 1.5;
  vertical-align: top;
}

.ref-table tr:last-child td {
  border-bottom: none;
}

.ref-table code {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-text);
}

.ref-table em {
  font-style: normal;
  color: var(--text-primary);
  font-size: 0.85rem;
}

.inline-code {
  font-family: var(--font-mono);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--accent-text);
}
</style>
