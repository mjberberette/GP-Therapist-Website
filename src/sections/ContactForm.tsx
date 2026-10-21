import { useRef, useState, type FormEvent } from 'react'
import { useReveal } from '../lib/useReveal'
import { contactForm, legal, practice } from '../content'
import { ArrowIcon, PhoneIcon, SparkleIcon } from '../components/Icons'
import './ContactForm.css'

/** Formspree-compatible endpoint (POST JSON, `Accept: application/json`). Set in `.env.local`. */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactForm() {
  const root = useRef<HTMLElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  useReveal(root)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    const data = Object.fromEntries(new FormData(form))
    if (data._gotcha) return
    if (!ENDPOINT) {
      console.warn('VITE_CONTACT_ENDPOINT is not set; the contact form cannot send.')
      setStatus('error')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section ref={root} id="contact-form" className="section cform" aria-labelledby="cform-title">
      <div className="container cform-grid">
        <header className="cform-head">
          <p className="kicker" data-fade>
            <span className="num">viii.</span>
            <span className="rule" />
            {contactForm.kicker}
          </p>
          <h2 id="cform-title" className="h2" data-split>
            {contactForm.heading[0]} <em>{contactForm.heading[1]}</em>
          </h2>
          <p className="cform-sub" data-fade>
            <SparkleIcon size={10} /> {contactForm.sub}
          </p>
          <a href={practice.phoneHref} className="cform-phone" data-fade>
            <PhoneIcon size={18} />
            <span>{practice.phone}</span>
          </a>
          <p className="cform-note" data-fade>
            {legal.emergency}
          </p>
        </header>

        <div className="cform-card" data-fade>
          {status === 'sent' ? (
            <div className="cform-done" role="status">
              <SparkleIcon size={18} />
              <p>{contactForm.success}</p>
              <button type="button" className="btn btn-ghost" onClick={() => setStatus('idle')}>
                <span className="btn-label">Send another message</span>
              </button>
            </div>
          ) : (
            <form className="cform-form" onSubmit={onSubmit} noValidate>
              <div className="cform-row">
                <label className="field">
                  <span className="field-label">
                    Name <i aria-hidden="true">*</i>
                  </span>
                  <input name="name" type="text" autoComplete="name" required />
                </label>
                <label className="field">
                  <span className="field-label">
                    Email <i aria-hidden="true">*</i>
                  </span>
                  <input name="email" type="email" autoComplete="email" inputMode="email" required />
                </label>
              </div>

              <div className="cform-row">
                <label className="field">
                  <span className="field-label">Phone</span>
                  <input name="phone" type="tel" autoComplete="tel" inputMode="tel" />
                </label>
                <label className="field">
                  <span className="field-label">I’m interested in</span>
                  <select name="topic" defaultValue={contactForm.topics[0]}>
                    {contactForm.topics.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>

              <fieldset className="field cform-methods">
                <legend className="field-label">Best way to reach you</legend>
                <div className="chips">
                  {contactForm.methods.map((m, i) => (
                    <label key={m} className="chip">
                      <input type="radio" name="method" value={m} defaultChecked={i === 0} />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="field">
                <span className="field-label">Message</span>
                <textarea name="message" rows={4} maxLength={1200} />
                <span className="field-hint">{contactForm.privacy}</span>
              </label>

              <label className="cform-check">
                <input type="checkbox" name="eligible" value="yes" required />
                <span>I’m 18 or older and live in Florida.</span>
              </label>

              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="cform-trap" aria-hidden="true" />

              <div className="cform-submit">
                <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                  <span className="btn-label">{status === 'sending' ? 'Sending…' : 'Send message'}</span>
                  <ArrowIcon size={14} />
                </button>
                <p className="cform-status" role="status" aria-live="polite">
                  {status === 'error' && (
                    <>
                      Something went wrong sending your message. Please call{' '}
                      <a href={practice.phoneHref}>{practice.phone}</a>.
                    </>
                  )}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
