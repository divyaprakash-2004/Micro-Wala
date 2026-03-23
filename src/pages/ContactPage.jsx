import { ExternalLink, Instagram, Mail, Phone, Youtube } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/micro_wala?igsh=MW91ZTM3ZjV6bjM3ZA==";
const YOUTUBE_URL = "https://youtube.com/@micro_wala?si=g_8GGQ-IiL4kCscL";
const SUPPORT_PHONE = "9523001743";
const SUPPORT_EMAIL = "justtkrishnaraj@gmail.com";

const ContactPage = () => {
  return (
    <section className="mx-auto max-w-3xl space-y-6 page-enter">
      <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-700 to-emerald-600 p-6 text-white shadow-xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Need Help?</p>
        <h1 className="mt-3 font-display text-3xl sm:text-5xl">Contact Micro Wala Support</h1>
        <p className="mt-3 max-w-2xl text-sm text-teal-50 sm:text-base">
          Agar order, payment ya delivery me koi dikkat ho, to directly contact karein. Hum jaldi help karenge.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-semibold text-teal-900"
        >
          <Instagram size={16} /> Instagram
        </a>
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-semibold text-teal-900"
        >
          <Youtube size={16} /> YouTube
        </a>
        <a
          href={`tel:${SUPPORT_PHONE}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-semibold text-teal-900"
        >
          <Phone size={16} /> Call Now
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="inline-flex items-center gap-2 text-base font-bold text-teal-900">
            <Instagram size={18} /> Instagram
          </p>
          <p className="mt-2 text-sm text-slate-700">@micro_wala</p>
          <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
            Open Instagram <ExternalLink size={13} />
          </p>
        </a>

        <a
          href={`tel:${SUPPORT_PHONE}`}
          className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="inline-flex items-center gap-2 text-base font-bold text-teal-900">
            <Phone size={18} /> Phone
          </p>
          <p className="mt-2 text-sm text-slate-700">{SUPPORT_PHONE}</p>
          <p className="mt-4 text-xs font-semibold text-teal-700">Tap to call now</p>
        </a>

        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="inline-flex items-center gap-2 text-base font-bold text-teal-900">
            <Youtube size={18} /> YouTube
          </p>
          <p className="mt-2 text-sm text-slate-700">@micro_wala</p>
          <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
            Open YouTube <ExternalLink size={13} />
          </p>
        </a>

        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="sm:col-span-2 rounded-2xl border border-teal-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="inline-flex items-center gap-2 text-base font-bold text-teal-900">
            <Mail size={18} /> Email
          </p>
          <p className="mt-2 text-sm text-slate-700">{SUPPORT_EMAIL}</p>
          <p className="mt-4 text-xs font-semibold text-teal-700">Tap to send email</p>
        </a>
      </div>
    </section>
  );
};

export default ContactPage;
