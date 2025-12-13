import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Menu,
  Upload,
  LogOut,
  User,
  Users,
  Shield,
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AIChatPanel } from '@/components/AIChatPanel';
import { CSVUploadModal } from '@/components/CSVUploadModal';
import { SavedRoutes } from '@/components/route/SavedRoutes';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Calendar', href: '/app/calendar', icon: Calendar },
    { name: 'Inspections', href: '/app/inspections', icon: ClipboardList },
    { name: 'Team', href: '/app/team', icon: Users },
    ...(isAdmin ? [{ name: 'Admin', href: '/app/admin', icon: Shield }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <img src="/favicon.png" alt="RouteWise-AI" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-semibold text-foreground">RouteWise-AI</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href === '/app' && location.pathname === '/app');
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
          <Button
            variant="outline"
            className="mt-4 flex items-center gap-3 w-full justify-start"
            onClick={() => setUploadModalOpen(true)}
          >
            <Upload className="h-5 w-5" />
            Upload CSV/XLS
          </Button>
        </nav>

        {/* Saved Routes Section */}
        <div className="mt-4 border-t border-border pt-4 px-2">
          <SavedRoutes />
        </div>

        {/* User Info & Sign Out - Desktop */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
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
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <img src="/favicon.png" alt="RouteWise-AI" className="h-9 w-9 rounded-lg" />
            <span className="text-lg font-semibold">RouteWise-AI</span>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href === '/app' && location.pathname === '/app');
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
            <Button
              variant="outline"
              className="mt-4 flex items-center gap-3 w-full justify-start"
              onClick={() => {
                setUploadModalOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              <Upload className="h-5 w-5" />
              Upload CSV/XLS
            </Button>
          </nav>

          {/* User Info - Mobile */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
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

      {/* CSV Upload Modal */}
      <CSVUploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  );
}
