import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import "./App.css";

// ----- Mock Data -----
const MODELS = [
  {
    id: "gpt-4o",
    name: "GPT‑4o",
    family: "OpenAI",
    params: "?",
    license: "Proprietary",
    released: "2024",
    speed: 4,
    cost: 4,
    strength: ["Reasoning", "Tool Use", "Multimodal"],
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT‑4.1 mini",
    family: "OpenAI",
    params: "?",
    license: "Proprietary",
    released: "2024",
    speed: 5,
    cost: 2,
    strength: ["Cheap", "Fast", "General"],
  },
  {
    id: "llama-3.1-70b",
    name: "Llama 3.1 70B",
    family: "Meta",
    params: "70B",
    license: "Open (LLAMA)",
    released: "2024",
    speed: 3,
    cost: 3,
    strength: ["Open Source", "Strong Coding"],
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    family: "Mistral",
    params: "?",
    license: "Proprietary",
    released: "2024",
    speed: 3,
    cost: 3,
    strength: ["Concise", "Efficient"],
  },
];

const PROMPTS = [
  {
    id: 1,
    title: "Blog Outliner",
    body: "Act as a content strategist. Outline a 1,200‑word blog on ‘LLM Safety by Design’. Include H2/H3s and 5 key references.",
    tags: ["marketing", "writing"],
  },
  {
    id: 2,
    title: "Code Reviewer",
    body: "You are a senior TypeScript reviewer. Given code and tests, return a concise diff‑style review with risks and fixes.",
    tags: ["engineering", "code"],
  },
  {
    id: 3,
    title: "UX Feedback Bot",
    body: "Role‑play a critical UX researcher. Evaluate a landing page hero for clarity, proof, and actionability. Return a 10‑point checklist.",
    tags: ["design", "ux"],
  },
];

// ----- Utilities -----
const ratingDots = (n) => (
  <div className="flex gap-1 items-center" aria-label={`${n}/5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`h-2.5 w-2.5 rounded-full ${
          i < n ? "bg-white/90" : "bg-white/25"
        }`}
      />
    ))}
  </div>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-xs text-white/80">
    {children}
  </span>
);

// ----- Prompt Analyzer (simple heuristic) -----
function analyzePrompt(p) {
  const scoreParts = [];
  const s = p.trim();
  if (!s) return { score: 0, tips: ["Prompt is empty"] };
  const length = s.split(/\s+/).length;
  const hasRole = /act as|you are|role\-?play/i.test(s);
  const hasContext = /given|based on|using|about|for the following/i.test(s);
  const hasConstraints =
    /return|format|limit|bullets|steps|json|markdown/i.test(s);
  const hasAudience =
    /for (developers|designers|students|executives|beginners)/i.test(s);
  const score =
    Math.min(10, Math.round(length / 25)) +
    (hasRole ? 2 : 0) +
    (hasContext ? 2 : 0) +
    (hasConstraints ? 2 : 0) +
    (hasAudience ? 1 : 0);
  if (length < 20) scoreParts.push("Add more detail and context.");
  if (!hasRole) scoreParts.push("Define a role (e.g., ‘Act as a…’). ");
  if (!hasConstraints) scoreParts.push("Specify output format or constraints.");
  if (!hasContext) scoreParts.push("Provide concrete inputs or references.");
  return { score: Math.min(15, score), tips: scoreParts };
}

// ----- Components -----
function Section({ id, title, subtitle, children }) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="mb-8 flex flex-col gap-3">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-white/70 max-w-3xl text-sm sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.15),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(36,141,237,0.18),transparent_50%)]" />
      <section className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white"
        >
          Explore, Compare, and Build with LLMs
        </motion.h1>
        <p className="mt-5 max-w-2xl text-white/75">
          myllmmodel.com is your hub for hands‑on LLM demos, model comparisons,
          and a curated prompt library. Learn, prototype, and ship faster.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#playground"
            className="rounded-2xl bg-white text-gray-900 px-5 py-2.5 font-medium shadow hover:shadow-lg transition"
          >
            Try Playground
          </a>
          <a
            href="#models"
            className="rounded-2xl border border-white/20 px-5 py-2.5 font-medium text-white hover:bg-white/10 transition"
          >
            Browse Models
          </a>
          <a
            href="#prompts"
            className="rounded-2xl border border-white/20 px-5 py-2.5 font-medium text-white hover:bg-white/10 transition"
          >
            Prompt Library
          </a>
        </div>
      </section>
    </div>
  );
}

function ModelCard({ m }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{m.name}</h3>
          <p className="text-xs text-white/60">
            {m.family} • {m.released} • {m.license}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wide text-white/60">
            Speed
          </div>
          {ratingDots(m.speed)}
          <div className="mt-2 text-[11px] uppercase tracking-wide text-white/60">
            Cost
          </div>
          {ratingDots(m.cost)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {m.strength.map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
      </div>
    </motion.div>
  );
}

function Models() {
  return (
    <Section
      id="models"
      title="Model Highlights"
      subtitle="A quick snapshot of popular LLMs. Compare speed, cost, and strengths at a glance."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {MODELS.map((m) => (
          <ModelCard key={m.id} m={m} />
        ))}
      </div>
    </Section>
  );
}

function Compare() {
  const [a, setA] = useState(MODELS[0].id);
  const [b, setB] = useState(MODELS[2].id);
  const A = useMemo(() => MODELS.find((m) => m.id === a), [a]);
  const B = useMemo(() => MODELS.find((m) => m.id === b), [b]);
  return (
    <Section
      id="compare"
      title="Model Comparison"
      subtitle="Pick two models to compare qualitative trade‑offs."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <label className="block text-xs text-white/70 mb-2">Model A</label>
          <select
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <div className="mt-4 text-white">
            <div className="text-sm font-semibold">{A.name}</div>
            <div className="text-xs text-white/70">
              {A.family} • {A.license}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-white/60">Speed</div>
                {ratingDots(A.speed)}
              </div>
              <div>
                <div className="text-white/60">Cost</div>
                {ratingDots(A.cost)}
              </div>
              <div>
                <div className="text-white/60">Strengths</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {A.strength.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center text-white/40">
          vs
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <label className="block text-xs text-white/70 mb-2">Model B</label>
          <select
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <div className="mt-4 text-white">
            <div className="text-sm font-semibold">{B.name}</div>
            <div className="text-xs text-white/70">
              {B.family} • {B.license}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-white/60">Speed</div>
                {ratingDots(B.speed)}
              </div>
              <div>
                <div className="text-white/60">Cost</div>
                {ratingDots(B.cost)}
              </div>
              <div>
                <div className="text-white/60">Strengths</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {B.strength.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Playground() {
  const [prompt, setPrompt] = useState(
    "Act as a product marketer. Write a 50‑word hero subtitle for an LLM playground website in a confident, simple tone."
  );
  const [response, setResponse] = useState("");
  const run = () => {
    // Placeholder: simulate a response
    const canned =
      "Build, test, and compare AI models in minutes—not months. Run playful demos, refine prompts, and ship production‑ready workflows with clarity and control.";
    setResponse(canned);
  };
  return (
    <Section
      id="playground"
      title="Playground (Demo)"
      subtitle="Try a local demo. Connect your own API later for real outputs."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <label className="block text-xs text-white/70 mb-2">Prompt</label>
          <textarea
            className="min-h-[160px] w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={run}
              className="rounded-xl bg-white text-gray-900 px-4 py-2 text-sm font-medium"
            >
              Run
            </button>
            <a
              href="#docs"
              className="text-xs text-white/70 underline underline-offset-2"
            >
              How to connect an API
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <label className="block text-xs text-white/70 mb-2">Response</label>
          <div className="min-h-[160px] whitespace-pre-wrap rounded-xl border border-white/15 bg-black/30 p-4 text-white/90">
            {response || "—"}
          </div>
        </div>
      </div>
    </Section>
  );
}

function PromptLibrary() {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return PROMPTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q))
    );
  }, [query]);

  const analysis = analyzePrompt(draft);

  return (
    <Section
      id="prompts"
      title="Prompt Library & Analyzer"
      subtitle="Grab high‑quality prompts or paste your own to get instant feedback."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts or tags…"
              className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none"
            />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white">
                    {p.title}
                  </h4>
                  <div className="flex gap-1">
                    {p.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-white/80">{p.body}</p>
                <div className="mt-3">
                  <button
                    onClick={() => setDraft(p.body)}
                    className="rounded-lg bg-white text-gray-900 px-3 py-1.5 text-xs font-medium"
                  >
                    Use
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <label className="block text-xs text-white/70 mb-2">
            Your Prompt
          </label>
          <textarea
            className="min-h-[150px] w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-xs text-white/70">Quality Score</div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {analysis.score}/15
              </div>
            </div>
            <div className="text-right text-xs text-white/70 max-w-[60%]">
              {analysis.tips.length ? (
                <ul className="list-disc list-inside space-y-1">
                  {analysis.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              ) : (
                <span>Looks solid. Try adding examples or edge cases.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Pricing() {
  return (
    <Section
      id="pricing"
      title="Pricing"
      subtitle="Start free. Scale as you grow."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            name: "Starter",
            price: "Free",
            desc: "Prompt Library, Demo Playground, 50 local runs/day",
            cta: "Get Started",
          },
          {
            name: "Builder",
            price: "$19/mo",
            desc: "Custom prompt collections, export, API connector",
            cta: "Upgrade",
          },
          {
            name: "Team",
            price: "$79/mo",
            desc: "Shared libraries, roles, usage analytics",
            cta: "Contact Sales",
          },
        ].map((t, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-6"
          >
            <div className="text-sm text-white/70">{t.name}</div>
            <div className="mt-2 text-3xl font-bold text-white">{t.price}</div>
            <p className="mt-2 text-white/75 text-sm">{t.desc}</p>
            <button className="mt-5 w-full rounded-xl bg-white text-gray-900 px-4 py-2 font-medium">
              {t.cta}
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="text-white/70 text-sm">
          © {new Date().getFullYear()} myllmmodel.com • All rights reserved
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="#models" className="text-white/70 text-sm hover:text-white">
            Models
          </a>
          <a href="#compare" className="text-white/70 text-sm hover:text-white">
            Compare
          </a>
          <a href="#prompts" className="text-white/70 text-sm hover:text-white">
            Prompts
          </a>
          <a href="#pricing" className="text-white/70 text-sm hover:text-white">
            Pricing
          </a>
          <a href="#docs" className="text-white/70 text-sm hover:text-white">
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function MyLLMModelLanding() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white selection:bg-white/20">
      {/* Top Nav */}
      <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-black/30 border-b border-white/10">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#248DED] to-[#36E2B1]" />
            <span className="font-semibold">
              myllmmodel<span className="text-white/60">.com</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <a href="#models" className="hover:text-white">
              Models
            </a>
            <a href="#compare" className="hover:text-white">
              Compare
            </a>
            <a href="#playground" className="hover:text-white">
              Playground
            </a>
            <a href="#prompts" className="hover:text-white">
              Prompts
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10">
              Sign in
            </button>
            <button className="rounded-xl bg-white text-gray-900 px-3 py-1.5 text-sm font-medium">
              Get Started
            </button>
          </div>
        </nav>
      </div>

      <Hero />
      <Models />
      <Compare />
      <Playground />
      <PromptLibrary />
      <Pricing />
      <Footer />
    </div>
  );
}
