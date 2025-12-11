import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  Menu,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AIChatPanel } from '@/components/AIChatPanel';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Inspections', href: '/inspections', icon: ClipboardList },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <img src="/favicon.png" alt="RouteWise-AI" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-semibold text-foreground">RouteWise-AI</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="RouteWise-AI" className="h-8 w-8 rounded-lg" />
            <span className="font-semibold">RouteWise-AI</span>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <img src="/favicon.png" alt="RouteWise-AI" className="h-9 w-9 rounded-lg" />
            <span className="text-lg font-semibold">RouteWise-AI</span>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen pt-16 lg:pt-0">
          {children}
        </div>
      </main>

      {/* AI Chat Panel */}
      <AIChatPanel open={chatPanelOpen} onOpenChange={setChatPanelOpen} />
    </div>
  );
}
