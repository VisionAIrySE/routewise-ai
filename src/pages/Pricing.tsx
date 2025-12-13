import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronLeft, Users, User } from 'lucide-react';

const plans = [
  {
    name: 'Individual',
    icon: User,
    price: 17,
    priceId: 'price_1RTJPjP4yLzxS46bqdJwbYSV',
    description: 'Perfect for solo field inspectors',
    features: [
      'Unlimited route optimization',
      'AI-powered planning assistant',
      'Multi-company CSV uploads',
      'Save & edit routes',
      'Push to Google Maps',
      'Completion tracking',
      'Mobile app access',
      'Print-ready route sheets',
    ],
  },
  {
    name: 'Team',
    icon: Users,
    price: 15,
    priceId: 'price_1RTJRgP4yLzxS46byVtdR7yg',
    perSeat: true,
    description: 'For inspection companies with multiple inspectors',
    popular: true,
    features: [
      'Everything in Individual',
      'Team management dashboard',
      'Add & remove team members',
      'View individual member routes',
      'Team-wide route oversight',
      'CSV upload tracking',
      'Priority support',
      'Volume discounts available',
    ],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="RouteWise AI" className="h-9 w-9 rounded-lg" />
            <span className="text-xl font-bold text-foreground">RouteWise AI</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="gap-2">
              <Link to="/">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Pricing Content */}
      <main className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Subscribe today and get 2 weeks included upfront. Cancel anytime.
            </p>
          </div>

          {/* Plans */}
          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground">
                        /mo{plan.perSeat ? ' per seat' : ''}
                      </span>
                    </div>
                    {plan.perSeat && (
                      <p className="mt-1 text-sm font-medium text-primary">
                        3 seat minimum
                      </p>
                    )}
                    <p className="mt-2 text-sm text-muted-foreground">
                      2 weeks included with subscription
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={`/signup?plan=${plan.name.toLowerCase()}&price=${plan.priceId}`}>
                      Get Started
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Enterprise */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              Need a custom solution for your enterprise?{' '}
              <a 
                href="mailto:Russ@VisionAIry.biz" 
                className="text-primary hover:underline font-medium"
              >
                Contact us
              </a>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
