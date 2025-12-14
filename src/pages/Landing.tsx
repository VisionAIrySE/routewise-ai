import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Upload,
  MessageSquare,
  Navigation,
  Bot,
  RefreshCw,
  Map,
  CalendarDays,
  Anchor,
  Building2,
  ChevronRight,
  Gift,
  Mail,
} from 'lucide-react';
import heroInspector from '@/assets/hero-inspector.png';
import appScreenshot from '@/assets/app-screenshot.png';

const features = [
  { icon: Bot, title: 'Talk, Don\'t Click', description: '"Give me 5 hours in Bend" beats 30 minutes of dragging pins.' },
  { icon: RefreshCw, title: 'Plans Change', description: 'Lockout? No-show? Reroute mid-day in 10 seconds.' },
  { icon: CalendarDays, title: 'Multi-Day Planning', description: '"Monday, Wednesday, Friday—6 hours each." Done.' },
  { icon: Anchor, title: 'Fixed Appointments', description: '"I have a 2pm in Redmond." Route builds around it.' },
  { icon: Building2, title: 'Any Company', description: 'MIL, IPI, SIG, whatever. Combine them all.' },
  { icon: Map, title: 'One Tap to Maps', description: 'Push your route to Google Maps and drive.' },
];

const steps = [
  { icon: Upload, title: 'Upload', description: 'Upload your XLS or CSV exports from your company portals, we read them all!' },
  { icon: MessageSquare, title: 'Ask', description: '"I have 6 hours tomorrow, give me the nearest, highest priority inspections. And schedule around the appointment on my calendar."' },
  { icon: Navigation, title: 'Go', description: 'Push to Google Maps. Hit the road.' },
];

const painPoints = [
  '6 AM alarm. Coffee. Open three portals. Start figuring out which stops make sense together.',
  '45 minutes later, you\'ve got a plan. Then someone no-shows. Gate\'s locked. Dog won\'t let you in the yard.',
  'Now you\'re backtracking across town, burning gas, losing daylight.',
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
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Mobile: Image first */}
            <div className="lg:hidden flex justify-center">
              <img 
                src={heroInspector} 
                alt="Field inspector using RouteWise AI" 
                className="rounded-2xl shadow-2xl max-w-sm w-full object-cover"
              />
            </div>
            
            {/* Text content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Stop Planning.
                <span className="block text-primary">Start Inspecting.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                One extra stop per day. That's $300+ more in your pocket every month. RouteWise plans your routes in seconds—for $17.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
                <Button size="lg" asChild className="gap-2 text-base">
                  <Link to="/pricing">
                    Get Started
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  2 weeks included. Cancel anytime.
                </p>
              </div>
            </div>

            {/* Desktop: Image on right */}
            <div className="hidden lg:flex justify-center">
              <img 
                src={heroInspector} 
                alt="Field inspector using RouteWise AI" 
                className="rounded-2xl shadow-2xl max-w-md w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl text-center">
            You Know The Drill
          </h2>
          <div className="mt-8 space-y-6">
            {painPoints.map((point, index) => (
              <p key={index} className="text-muted-foreground text-lg text-center">
                {point}
              </p>
            ))}
          </div>
          <p className="mt-10 text-xl font-medium text-foreground text-center">
            What if your route just... handled all that?
          </p>
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

          {/* App Screenshot */}
          <div className="mt-16 text-center">
            <div className="inline-block rounded-2xl border border-border bg-card p-4 shadow-xl">
              <img 
                src={appScreenshot} 
                alt="RouteWise AI app showing a 7-stop optimized route" 
                className="rounded-lg max-w-3xl w-full"
              />
            </div>
            <p className="mt-4 text-muted-foreground italic">
              A real 7-stop route, built in 22 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Referral Section - Right after How It Works */}
      <section className="border-y border-border bg-primary/5 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Gift className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            Know Other Inspectors?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Refer them. You both get 2 weeks free. No limit.
          </p>
          <Button asChild className="mt-6">
            <Link to="/signup">Get Your Referral Link</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for how inspectors actually work
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* ROI Section */}
      <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            The Math
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-3xl font-bold text-primary">$17</p>
              <p className="mt-2 text-muted-foreground">RouteWise per month</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-3xl font-bold text-foreground">$14-17</p>
              <p className="mt-2 text-muted-foreground">Per inspection</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-3xl font-bold text-green-600">$280-340</p>
              <p className="mt-2 text-muted-foreground">1 extra stop × 20 days</p>
            </div>
          </div>
          <p className="mt-10 text-xl font-medium text-foreground">
            If RouteWise gets you ONE more stop per day, it pays for itself 16 times over.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            One More Stop Per Day
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            That's the difference. $17/month. First 2 weeks included.
          </p>
          <Button size="lg" asChild className="mt-8 gap-2 text-base">
            <Link to="/pricing">
              Get Started
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
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
              <a href="mailto:Russ@VisionAIry.biz" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Mail className="h-4 w-4" />
                For Companies
              </a>
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
