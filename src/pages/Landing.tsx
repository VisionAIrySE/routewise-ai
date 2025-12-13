import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Upload,
  MessageSquare,
  Navigation,
  Smartphone,
  Bot,
  RefreshCw,
  Map,
  CalendarDays,
  Anchor,
  BarChart3,
  Save,
  Clock,
  Printer,
  Building2,
  Shield,
  ChevronRight,
  Gift,
  Mail,
} from 'lucide-react';

const features = [
  { icon: Smartphone, title: 'Mobile App', description: 'Install on your phone, full platform access' },
  { icon: Bot, title: 'Conversational AI', description: 'Just talk - no forms, no clicking through menus' },
  { icon: RefreshCw, title: 'On-the-Fly Rerouting', description: 'Plans change? Adjust your route mid-day' },
  { icon: Map, title: 'Push to Maps', description: 'One tap to Google Maps from your phone' },
  { icon: CalendarDays, title: 'Multi-Day Planning', description: '"Mon/Wed/Fri, 5 hours each" - done' },
  { icon: Anchor, title: 'Appointment Anchors', description: 'Build your route around fixed appointments' },
  { icon: BarChart3, title: 'Track Completions', description: 'See your weekly, monthly, yearly stats' },
  { icon: Save, title: 'Save Routes', description: 'Plan, save, and adjust daily routes weeks in advance' },
  { icon: Clock, title: 'Duration Control', description: 'Adjust time per stop, route recalculates' },
  { icon: Printer, title: 'Print-Ready', description: 'Professional route sheets for the field' },
  { icon: Building2, title: 'Multi-Company', description: 'Combine stops from different sources' },
  { icon: Shield, title: 'PII-Safe', description: 'We only store name, address, company, urgency' },
];

const steps = [
  { icon: Upload, title: 'Upload', description: 'Drop your inspection CSVs from any company' },
  { icon: MessageSquare, title: 'Ask', description: '"Plan tomorrow, 6 hours, skip downtown" - that\'s it' },
  { icon: Navigation, title: 'Go', description: 'Push to Google Maps and hit the road' },
];

const painPoints = [
  'Juggling multiple company portals',
  'Hours spent on manual route planning',
  'Wasted drive time between stops',
  'Missed deadlines and penalties',
  'Cancels and no-shows mid-route',
];

export default function Landing() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="RouteWise AI" className="h-9 w-9 rounded-lg" />
            <span className="text-xl font-bold text-foreground">RouteWise AI</span>
          </div>
          
          <nav className="hidden items-center gap-6 md:flex">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <Link
              to="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Stop Planning.
              <span className="block text-primary">Start Inspecting.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              AI-powered route optimization for field inspectors. Plan your week in seconds. 
              Adjust on the fly. Push directions to your phone.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="gap-2 text-base">
                <Link to="/pricing">
                  Start Your Free Trial
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Built for Inspectors, by Inspectors
            </p>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Sound familiar?
              </h2>
              <ul className="mt-6 space-y-4">
                {painPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-sm font-medium text-destructive">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8">
                <h3 className="text-xl font-semibold text-foreground">
                  RouteWise AI brings it all together.
                </h3>
                <p className="mt-3 text-lg text-muted-foreground">
                  Just tell it what you need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three steps. That's it.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative rounded-2xl border border-border bg-card p-8 text-center transition-shadow hover:shadow-lg"
              >
                <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-y border-border bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for how inspectors actually work
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Companies */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            Interested in RouteWise AI for your inspection company?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Boost inspector productivity. Improve on-time completions. Attract top talent.
          </p>
          <Button variant="outline" asChild className="mt-6 gap-2">
            <a href="mailto:Russ@VisionAIry.biz">
              <Mail className="h-4 w-4" />
              Drop us a line
            </a>
          </Button>
        </div>
      </section>

      {/* Referral Bonus */}
      <section className="border-y border-border bg-primary/5 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Gift className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            Share the Savings
          </h2>
          <p className="mt-4 text-muted-foreground">
            Know other inspectors? Refer them to RouteWise AI and get 2 weeks free for each signup.
          </p>
          <Button asChild className="mt-6">
            <Link to="/pricing">Start Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Final CTA */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Get one more inspection done this month?
          </h2>
          <p className="mt-2 text-xl text-primary font-medium">
            It's already paid for itself.
          </p>
          <Button size="lg" asChild className="mt-8 gap-2 text-base">
            <Link to="/pricing">
              Start Your Free Trial
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            2 weeks free with your subscription.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <img src="/favicon.png" alt="RouteWise AI" className="h-8 w-8 rounded-lg" />
              <span className="font-semibold text-foreground">RouteWise AI</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            © 2025 RouteWise AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}