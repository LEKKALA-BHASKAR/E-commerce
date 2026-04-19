import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const SUBJECTS = ['General enquiry', 'Wholesale', 'Order issue', 'Partnership', 'Press'];

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      e.target.reset();
      setSubmitting(false);
      toast.success("Thanks — we'll be in touch within one business day.");
    }, 600);
  };

  return (
    <div className="bg-cream">
      <section className="container py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-gold">Contact</p>
          <h1 className="mt-3 font-display text-5xl text-ink-800 sm:text-6xl">Get in Touch</h1>
          <p className="mt-4 text-ink-500">
            Questions about a harvest, a wholesale order, or a recipe? Our small team reads every message and replies in person.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <form onSubmit={onSubmit} className="rounded-3xl border border-ink-100 bg-white p-8 shadow-card sm:p-10">
            <h2 className="font-display text-2xl text-ink-800">Send a Message</h2>
            <p className="mt-1 text-sm text-ink-500">We typically reply within one business day.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input label="First name" name="first" required />
              <Input label="Last name" name="last" required />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Email" type="email" name="email" required />
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-500">Subject</label>
                <select
                  name="subject"
                  required
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 focus:border-gold focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>Choose a topic</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-500">Message</label>
              <textarea
                name="message"
                required
                rows={6}
                placeholder="Tell us how we can help…"
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-gold focus:outline-none"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? 'Sending…' : <>Send Message <Send size={14} /></>}
              </Button>
            </div>
          </form>

          {/* Sidebar info */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-ink-100 bg-white p-8 shadow-card">
              <h3 className="font-display text-xl text-ink-800">Customer Support</h3>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gold/10 text-gold">
                    <Mail size={14} />
                  </span>
                  <div>
                    <p className="font-medium text-ink-800">Email Us</p>
                    <a href="mailto:hello@saharagroceries.com" className="text-ink-500 hover:text-gold">hello@saharagroceries.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gold/10 text-gold">
                    <Phone size={14} />
                  </span>
                  <div>
                    <p className="font-medium text-ink-800">Call Us</p>
                    <a href="tel:+18007242721" className="text-ink-500 hover:text-gold">1-800-SAHARA-1</a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card">
              <div className="aspect-[4/3] bg-cream-200">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=80"
                  alt="Flagship store"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl text-ink-800">Our Flagship</h3>
                <ul className="mt-4 space-y-3 text-sm text-ink-500">
                  <li className="flex items-start gap-3">
                    <MapPin size={14} className="mt-0.5 flex-none text-gold" />
                    <span>124 Oasis Avenue<br />Phoenix, AZ 85001</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock size={14} className="mt-0.5 flex-none text-gold" />
                    <span>Open Daily · 8am – 8pm</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
