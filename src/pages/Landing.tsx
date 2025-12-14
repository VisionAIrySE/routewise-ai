import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Brain,
  Navigation,
  ChevronRight,
  Gift,
  Mail,
  Check,
  X,
  Quote,
  Building2,
} from 'lucide-react';
import heroInspector from '@/assets/hero-inspector.png';
import chatScreenshot from '@/assets/chat-screenshot.png';

const genericRoutingIssues = [
  'Shortest route, period',
  'Treats every stop the same',
  'You manage deadlines manually',
  'Hope you don\'t miss expirations',
  'No control when you hit no-shows, locked gates, or dogs in the yard',
];

const manualPlanningIssues = [
  'Spreadsheets and sticky notes',
  'Hours lost every week',
  'Missed deadlines = lost revenue',
  'Constant mental overhead',
  'Different companies with different deadline requirements',
];

const inspectorRouteFeatures = [
  'Expiring inspections surfaced first',
  'Stops clustered by neighborhood',
  'Your anchored appointments respected',
  'Route adapts to YOUR available hours and individual inspection times',
  'Adjust your route on the fly in the field',
];

const steps = [
  { icon: Upload, title: 'Upload', description: 'Drop your XLS or CSV exports from your company portals when you\'re ready to hit the road. We read them all.' },
  { icon: Brain, title: 'Prioritize', description: <>AI analyzes expiration dates, location clusters, and your time constraints <strong>conversationally</strong> in seconds. Just tell it your plans for the day. Critical deadlines bubble to the top automatically.</> },
  { icon: Navigation, title: 'Go', description: 'Get a route that makes sense: nearby stops grouped together, urgent inspections first, built around your real schedule...and adjustable on the Go!' },
];

const testimonials = [
  {
    quote: "I used to spend Sunday nights planning my week. Now I upload my files and I'm done in 2 minutes.",
    author: "Mike R.",
    role: "Field Inspector, Texas",
  },
  {
    quote: "Finally something that understands expirations matter. I haven't missed a deadline in 3 months.",
    author: "Sarah K.",
    role: "Independent Inspector, Florida",
  },
  {
    quote: "The on-the-fly adjustments saved me when I hit a locked gate. Rerouted me to nearby stops instantly.",
    author: "James T.",
    role: "Mortgage Occupancy Inspector, Oregon",
  },
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
            <img src="/favicon.png" alt="Inspector Route AI" className="h-9 w-9 rounded-lg" />
            <span className="text-xl font-bold text-foreground">Inspector Route AI</span>
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
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            {/* Mobile: Image first */}
            <div className="lg:hidden flex flex-col items-center gap-6">
              <img 
                src={heroInspector} 
                alt="Field inspector using Inspector Route AI" 
                className="rounded-2xl shadow-2xl max-w-sm w-full object-cover"
              />
              <div className="flex flex-col items-center gap-3">
                <Button size="lg" asChild className="gap-2 text-base">
                  <Link to="/pricing">
                    Start Your 2-Week Trial
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Cancel anytime. No hassle.
                </p>
              </div>
            </div>
            
            {/* Text content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Stop Chasing Inspection Deadlines.
                <span className="block text-primary">Start Crushing Them, and More Of Them!</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                Inspector Route AI doesn't just optimize your drive—it prioritizes which stops matter most. Expiring inspections first. Clustered by proximity. Built around YOUR schedule and Flexible On The Go!
              </p>
            </div>

            {/* Desktop: Image on right with CTA below */}
            <div className="hidden lg:flex flex-col items-center gap-6">
              <img 
                src={heroInspector} 
                alt="Field inspector using Inspector Route AI" 
                className="rounded-2xl shadow-2xl max-w-md w-full object-cover"
              />
              <div className="flex flex-col items-center gap-3">
                <Button size="lg" asChild className="gap-2 text-base">
                  <Link to="/pricing">
                    Start Your 2-Week Trial
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Cancel anytime. No hassle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Comparison Section */}
      <section id="features" className="border-y border-border bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Other routing apps optimize distance. We optimize YOUR business.
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {/* Generic Routing Apps */}
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                Generic Routing Apps
              </h3>
              <ul className="space-y-4">
                {genericRoutingIssues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Manual Planning */}
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                Manual Planning
              </h3>
              <ul className="space-y-4">
                {manualPlanningIssues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Inspector Route AI */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 ring-2 ring-primary/20">
              <h3 className="text-xl font-semibold text-primary mb-6 text-center">
                Inspector Route AI
              </h3>
              <ul className="space-y-4">
                {inspectorRouteFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
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

          {/* App Screenshot */}
          <div className="mt-16 text-center">
            <div className="inline-block rounded-2xl border border-border bg-card p-4 shadow-xl">
              <img 
                src={chatScreenshot} 
                alt="Inspector Route AI app showing an optimized route" 
                className="rounded-lg max-w-3xl w-full"
              />
            </div>
            <p className="mt-4 text-muted-foreground italic">
              A real 9-stop route, built in 22 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* The Differentiator Block */}
      <section className="border-y border-border bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-center mb-10">
            Built for how inspectors ACTUALLY work
          </h2>
          
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              You've got 47 pending inspections across 3 counties. Some expire tomorrow. Some are in the same neighborhood. You have a 2pm appointment you can't move.
            </p>
            
            <p className="font-medium text-foreground">
              Generic routing apps see 47 pins on a map.
            </p>
            
            <div className="bg-card border border-border rounded-xl p-6 my-8">
              <p className="font-semibold text-foreground mb-4">Inspector Route AI sees:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span>3 CRITICAL expirations that must happen today</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span>6 stops clustered within 2 miles of each other</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span>Your 2pm anchor point that shapes the whole route</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span>8 hours of actual working time to fill</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span>Fill in stops on longer trips based on proximity AND priority</span>
                </li>
              </ul>
            </div>
            
            <p className="text-xl font-medium text-foreground text-center">
              The result? A route that hits your deadlines, minimizes windshield time, and fits YOUR day—not the other way around.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl text-center mb-16">
            Join inspectors who stopped missing deadlines and complete more inspections
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card p-8 relative"
              >
                <Quote className="h-8 w-8 text-primary/20 absolute top-6 right-6" />
                <p className="text-muted-foreground italic mb-6">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="border-y border-border bg-primary/5 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Gift className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            Know Other Inspectors?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Refer a friend, you both get 2 weeks free. No limit.
          </p>
          <Button asChild className="mt-6">
            <Link to="/signup">Get Your Referral Link</Link>
          </Button>
        </div>
      </section>

      {/* Final CTA */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            One to two more inspections per day. Every day.
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            At $14-17 per stop, that's as much as $680 extra per month or more. Inspector Route AI is $17/month. The math is simple.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Button size="lg" asChild className="gap-2 text-base">
              <Link to="/pricing">
                Start Your 2-Week Trial
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-muted-foreground">
              Refer a friend, you both get 2 weeks free
            </p>
          </div>
        </div>
      </section>

      {/* Enterprise Section - Prominent */}
      <section className="border-y border-border bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Building2 className="mx-auto h-16 w-16 text-primary mb-6" />
          <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
            Enterprise and White Label for Companies
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Deploy Inspector Route AI across your entire inspection team. Custom branding, centralized management, and volume pricing available.
          </p>
          <Button size="lg" asChild className="mt-10 gap-2 text-lg px-8 py-6" variant="outline">
            <a href="mailto:Russ@VisionAIry.biz">
              <Mail className="h-5 w-5" />
              Contact Us for Enterprise
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <img src="/favicon.png" alt="Inspector Route AI" className="h-8 w-8 rounded-lg" />
              <span className="font-semibold text-foreground">Inspector Route AI</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="mailto:Russ@VisionAIry.biz" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Enterprise Inquiries
              </a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            © 2025 Inspector Route AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
