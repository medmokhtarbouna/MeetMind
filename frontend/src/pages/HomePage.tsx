import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { ArrowRight, CheckCircle2, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header
        className={`sticky top-0 z-20 backdrop-blur-md transition-all ${
          scrolled
            ? 'bg-white/95 border-b border-slate-200 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-4 py-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/img/logo.png" 
              alt="MeetMind" 
              className="h-8 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-[18px] font-semibold tracking-wide text-[#5b5b5b]">
                MeetMind
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-[15px] text-slate-500 md:flex">
            <Link to="/" className="font-semibold text-slate-800">
              Home
            </Link>

            <a
              href="#features"
              className="hover:text-slate-800"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('features')
              }}
            >
              Features
            </a>

            <a
              href="#workflows"
              className="hover:text-slate-800"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('workflows')
              }}
            >
              Workflows
            </a>

            <a
              href="#insights"
              className="hover:text-slate-800"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('insights')
              }}
            >
              Insights
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button
                  size="sm"
                  leftIcon={<LayoutDashboard className="h-4 w-4" />}
                  className="rounded-full bg-[#1cc3c5] px-6 py-2 text-sm font-medium text-white hover:bg-[#18a9ab]"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button
                  size="sm"
                  className="rounded-full bg-[#5b5d61] px-6 py-2 text-sm font-medium text-white hover:bg-[#4b4d51]"
                >
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-10 md:min-h-[calc(100vh-80px)] md:flex-row md:items-center">
          <div className="flex-1 space-y-6">
            <h1 className="text-[32px] leading-[1.1] tracking-tight text-[#5b5b5b] md:text-[50px]">
              Turn Every Sales Conversation Into Strategic Intelligence
            </h1>

            <p className="max-w-xl text-[17px] leading-relaxed text-slate-500">
              Upload your meeting recordings and instantly transform them into structured
              insights, deal probability scores, and actionable next steps — powered by AI.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/signup">
                <Button className="rounded-full bg-[#1cc3c5] px-7 py-2.5 text-base font-medium text-white hover:bg-[#18a9ab]">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Button
                variant="secondary"
                size="md"
                className="rounded-full border-slate-300 px-6 py-2.5 text-base text-slate-600"
                onClick={() => document.getElementById('workflows')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center md:justify-end" aria-hidden>
            <img src="/img/hero-visual.png" alt="MeetMind" className="p-10" />
          </div>
        </section>

        <section
          id="workflows"
          className=" 2xl:px-36 xl:px-8 px-16 pb-20 pt-20 bg-[#f3f4fa]"
        >
          <div className="mb-10 text-center">
            <h2 className="text-[36px] font-semibold tracking-tight text-[#5b5b5b]">
              Built Around Real Sales Workflows
            </h2>
            <p className="mt-2 text-[15px] text-slate-500">
              Practical AI capabilities designed for modern revenue teams.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center rounded-3xl  p-6 text-center transition-all duration-300 hover:shadow-xl border border-slate-400"
              >
                <div className="mb-5 flex h-28 w-28 items-center justify-center">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>

                <h3 className="text-[16px] font-semibold text-slate-800">
                  {item.title}
                </h3>

                <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-24"></div>

        <section id="insights" className="mx-auto max-w-[1200px] px-4 pb-14">
          <div className="">
            <h2 className="text-[32px] font-semibold tracking-tight text-[#5b5b5b] pb-[20px]">
              Sales Teams Don’t Need More Meetings — They Need Better Insights
            </h2>

            <div className="">
              <p className="text-[15px] leading-relaxed">
                Most sales conversations generate pages of notes but very little clarity.
                Teams leave meetings with fragmented takeaways, missed buying signals,
                and unclear next steps. Instead of driving decisions forward,
                valuable insights remain buried inside long discussions.
              </p>

              <p className="text-[15px] leading-relaxed">
                <span className="font-medium text-slate-800">
                  MeetMind
                </span>{' '}
                transforms raw conversations into structured, actionable intelligence —
                giving your team the clarity and direction needed to move deals forward with confidence.
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3 text-slate-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1cc3c5]" />
                  <p>Important buying signals are buried inside long conversations.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1cc3c5]" />
                  <p>Risk indicators go unnoticed.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1cc3c5]" />
                  <p>Follow-ups are delayed.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

            <div className='mx-auto max-w-[1200px] px-4 pb-14'>

        <section
          className="hidden md:block relative 2xl:px-28 lg:px-20 md:px-10 px-4 pt-[95px] pb-[115px]"
          style={{
            backgroundImage: "url('/img/section.png')",
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="relative max-w-xl text-white">
            <h2 className="text-[32px] font-semibold leading-tight">
              Ready to Turn Conversations into Strategy?
            </h2>
            <p className="mt-4 text-[15px] text-white/90">
              Upload your next sales meeting and let AI extract insights, signals,
              and deal confidence instantly.
            </p>
          </div>
        </section>
        </div>

        <section className="mx-auto max-w-[1200px] px-4 pb-16">
          <div className="mb-8 flex flex-col gap-2">
            <h2 className="text-[32px] font-semibold tracking-tight ">
              Everything you need to operationalize meetings
            </h2>
            <p className="max-w-2xl text-[16px] text-slate-500">
              Upload meetings, extract structured intelligence, and take action faster — all in one clean workspace.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {ICON_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 
        
        
        "
              >
                <div className="flex items-center justify-center rounded-2xl ">
                  <img
                    src={card.icon}
                    alt={card.title}
                    className="h-24 w-24 object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="mt-5">
                  <h3 className="text-[16px] font-semibold text-slate-800 text-center">{card.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                    {card.description}
                  </p>
                </div>

                <div className="mt-5">
                  <Link to={card.href}>
                    <div
                      className="w-full rounded-md bg-white border border-1 border-slate-200 px-6 py-2.5 text-sm font-medium text-black hover:bg-[#1cc3c5] hover:text-white transition-all duration-300 text-center"
                    >
                      {card.cta}
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="block md:hidden mx-auto max-w-[1200px]  px-4 pb-24">
          <div className="relative">
            <div className="relative rounded-[60px] bg-[#86a9a1] p-10">
              <div className="max-w-xl text-white">
                <h2 className="text-[28px] font-semibold leading-tight">
                  Ready to Turn Conversations into Strategy?
                </h2>
                <p className="mt-4 text-[14px] text-white/90">
                  Upload your next sales meeting and let AI extract insights, signals,
                  and deal confidence instantly.
                </p>
              </div>
            </div>

            <div className="absolute -bottom-6 right-6"></div>
          </div>
        </section>

        <section id="features" className="2xl:px-36 xl:px-8 px-16 pb-20 pt-20 bg-[#f3f4fa] text-center">
          <div>
            <h2 className="text-[36px] font-semibold tracking-tight text-[#5b5b5b]">
              From Conversation to Clarity in Minutes
            </h2>
            <p className="mt-1  text-[16px] text-slate-500">
              Turn every meeting into a structured deal review — transcripts, signals,
              probability, and next steps in one workspace.
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"></div>

          <div className="grid gap-6 md:grid-cols-5">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-3xl  p-6  transition-all duration-300 hover:shadow-xl border border-slate-400"
              >
                <div className="flex h-28 w-28 items-center justify-center ">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="h-28 w-28 object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="text-sm font-medium text-slate-800">
                  {feature.title}
                </div>

                <p className="text-[13px] text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-24"></div>

        <section id="how-it-works" className="mx-auto max-w-[1200px] px-4 pb-16">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-[32px] font-semibold tracking-tight text-[#5b5b5b]">
                Three Steps to Smarter Sales Decisions
              </h2>
              <p className="mt-1  text-[16px] text-slate-500">
                Secure upload, AI analysis, and a clear path forward — without changing
                your workflow.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.label}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="inline-flex items-center gap-2 text-[15px] text-slate-500">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1cc3c5] text-white  text-[15px]">
                    {step.step}
                  </span>
                  <span>{step.label}</span>
                </div>
                <div className="text-sm font-medium text-slate-800">{step.title}</div>
                <p className="text-[13px] text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer id="customers" className="border-t border-slate-200 bg-[#f3f4fa]">
        <div className="mx-auto max-w-[1200px] px-4 py-16">
          <div className="grid gap-10 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1cc3c5] to-[#35d4c7] text-sm font-semibold text-white">
                  MI
                </div>
                <span className="text-[18px] font-semibold text-slate-800">
                  MeetMind
                </span>
              </div>

              <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-slate-500">
                Transform your sales meetings into structured intelligence.
                Extract buying signals, assess deal confidence, and move forward with clarity.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800">Product</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-slate-800">Features</a></li>
                <li><a href="#" className="hover:text-slate-800">How it Works</a></li>
                <li><a href="#" className="hover:text-slate-800">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-800">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800">Company</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-slate-800">About</a></li>
                <li><a href="#" className="hover:text-slate-800">Careers</a></li>
                <li><a href="#" className="hover:text-slate-800">Contact</a></li>
                <li><a href="#" className="hover:text-slate-800">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800">Legal</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-slate-800">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-slate-800">Terms of Service</a></li>
                <li><a href="#" className="hover:text-slate-800">Data Processing</a></li>
                <li><a href="#" className="hover:text-slate-800">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-200 pt-6 flex flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
            <span>
              © {new Date().getFullYear()} MeetMind. All rights reserved.
            </span>

            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-800">LinkedIn</a>
              <a href="#" className="hover:text-slate-800">Twitter</a>
              <a href="#" className="hover:text-slate-800">Status</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    title: 'Automatic Transcription with Speaker Identification',
    description:
      'Accurate AI-powered transcription with clear speaker labels and timestamps.',
    icon: '/img/icons/chat.png',
  },
  {
    title: 'Buying & Hesitation Signal Detection',
    description:
      'Automatically detect commitment signals, objections, and risk indicators.',
    icon: '/img/icons/badge.png',
  },
  {
    title: 'Deal Probability Estimation',
    description:
      'Get a data-driven probability score based on contextual signals.',
    icon: '/img/icons/plus.png',
  },
  {
    title: 'Recommended Next Actions',
    description:
      'Receive strategic suggestions tailored to the meeting outcome.',
    icon: '/img/icons/folder.png',
  },
  {
    title: 'AI-Generated Follow-up Email',
    description:
      'Generate a professional follow-up email aligned with key commitments.',
    icon: '/img/icons/envelope.png',
  },
] as const

const HOW_IT_WORKS = [
  {
    step: 1,
    label: 'Upload Your Meeting Recording',
    title: 'Securely upload your video or audio file.',
    description: '',
  },
  {
    step: 2,
    label: 'AI Analyzes the Conversation',
    title:
      'The system transcribes, identifies speakers, extracts insights, and evaluates deal potential.',
    description: '',
  },
  {
    step: 3,
    label: 'Act with Confidence',
    title:
      'Review structured insights, ask follow-up questions, and move forward with clarity.',
    description: '',
  },
] as const

const ICON_CARDS = [
  {
    icon: '/img/icons/icon1.png',
    title: 'Smart Meeting Upload',
    description:
      'Upload a meeting recording in seconds and keep everything organized by company.',
    cta: 'Upload a Meeting',
    href: '/signup',
  },
  {
    icon: '/img/icons/icon2.png',
    title: 'AI Call Intelligence',
    description:
      'Extract buying signals, objections, and key commitments with speaker-aware timestamps for fast review.',
    cta: 'See Insights',
    href: '/signup',
  },
  {
    icon: '/img/icons/icon3.png',
    title: 'Team-Ready Workspace',
    description:
      'Turn transcripts into actions: follow-up email drafts, recommended next steps, and confidence scoring.',
    cta: 'Explore Dashboard',
    href: '/signup',
  },
] as const

const CORE_ITEMS = [
  {
    icon: '/img/icons/chat.png',
    title: 'Conversation Intelligence',
    description:
      'Extract buying signals, objections, and key commitments from every sales call.',
  },
  {
    icon: '/img/icons/calendar.png',
    title: 'Timeline Awareness',
    description:
      'Detect urgency, next steps, and decision milestones automatically.',
  },
  {
    icon: '/img/icons/folder.png',
    title: 'Organized Deal Records',
    description:
      'Keep meetings structured by account, opportunity, and pipeline stage.',
  },
  {
    icon: '/img/icons/plus.png',
    title: 'Actionable Outcomes',
    description:
      'Turn transcripts into follow-ups, probability scoring, and strategic guidance.',
  },
] as const