import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useRef } from 'react';
import { Copy, MapPin, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  RouteOptimizerResponse,
  RouteDay,
  formatGeneratedTime,
  hasOptimizedRoutes,
  saveRouteToN8n,
  copyAddressesToClipboard,
  openInGoogleMaps,
  generateGoogleMapsUrl,
  extractAddresses,
  extractPrintableRouteContent,
  generatePrintableHTML,
  DEFAULT_HOME_BASE,
} from '@/lib/routeUtils';
import { RouteView } from '@/components/route/RouteView';

interface RouteResponseProps {
  response: RouteOptimizerResponse;
}

export function RouteResponse({ response }: RouteResponseProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const routeContentRef = useRef<HTMLDivElement>(null);

  const handleSaveRoute = async (route: RouteDay) => {
    setIsSaving(true);
    try {
      const result = await saveRouteToN8n(route, response);
      if (result.success) {
        toast({
          title: 'Route Saved!',
          description: result.message || `${route.day} route saved to Airtable`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Could not save route',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // If we have optimized routes with actual stops, show the map view
  if (hasOptimizedRoutes(response)) {
    return (
      <div className="route-response w-full">
        {/* Summary Header */}
        <div className="rounded-lg border border-border bg-muted/50 p-4 mb-4">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-base text-foreground">
                Optimized Route for {response.query_date}
              </h3>
              <p className="text-sm text-muted-foreground">
                {response.total_pending} inspections in pipeline • {response.available_hours}h available
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                Generated {formatGeneratedTime(response.generated_at)}
              </p>
            </div>
          </div>

          {/* Urgency Pills */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {response.urgency_counts.CRITICAL > 0 && (
              <span className="px-2 py-1 bg-critical/10 text-critical rounded-full text-xs font-medium">
                {response.urgency_counts.CRITICAL} Critical
              </span>
            )}
            {response.urgency_counts.URGENT > 0 && (
              <span className="px-2 py-1 bg-urgent/10 text-urgent rounded-full text-xs font-medium">
                {response.urgency_counts.URGENT} Urgent
              </span>
            )}
            {response.urgency_counts.SOON > 0 && (
              <span className="px-2 py-1 bg-soon/10 text-soon rounded-full text-xs font-medium">
                {response.urgency_counts.SOON} Soon
              </span>
            )}
            {response.urgency_counts.NORMAL > 0 && (
              <span className="px-2 py-1 bg-normal/10 text-normal rounded-full text-xs font-medium">
                {response.urgency_counts.NORMAL} Normal
              </span>
            )}
          </div>
        </div>

        {/* Interactive Route View */}
        <RouteView
          routes={response.optimized_routes!}
          homeBase={response.home_base || DEFAULT_HOME_BASE}
          onSaveRoute={handleSaveRoute}
        />
      </div>
    );
  }

  // Fallback to markdown rendering for route_plan text
  return (
    <div className="route-response w-full">
      {/* Summary Card */}
      <div className="rounded-lg border border-border bg-muted/50 p-4 mb-4">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h3 className="font-semibold text-base text-foreground">
              Route Plan for {response.query_date}
            </h3>
            <p className="text-sm text-muted-foreground">
              {response.total_pending} inspections in pipeline • {response.available_hours}h available
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Generated {formatGeneratedTime(response.generated_at)}
            </p>
          </div>
        </div>

        {/* Urgency Pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {response.urgency_counts.CRITICAL > 0 && (
            <span className="px-2 py-1 bg-critical/10 text-critical rounded-full text-xs font-medium">
              {response.urgency_counts.CRITICAL} Critical
            </span>
          )}
          {response.urgency_counts.URGENT > 0 && (
            <span className="px-2 py-1 bg-urgent/10 text-urgent rounded-full text-xs font-medium">
              {response.urgency_counts.URGENT} Urgent
            </span>
          )}
          {response.urgency_counts.SOON > 0 && (
            <span className="px-2 py-1 bg-soon/10 text-soon rounded-full text-xs font-medium">
              {response.urgency_counts.SOON} Soon
            </span>
          )}
          {response.urgency_counts.NORMAL > 0 && (
            <span className="px-2 py-1 bg-normal/10 text-normal rounded-full text-xs font-medium">
              {response.urgency_counts.NORMAL} Normal
            </span>
          )}
        </div>
      </div>

      {/* AI Summary (when no route_plan) */}
      {response.ai_summary && !response.route_plan && (
        <div className="mb-4 p-4 bg-card rounded-lg border border-border">
          <p className="text-foreground">{response.ai_summary}</p>
        </div>
      )}

      {/* Deferred Inspections */}
      {response.deferred && response.deferred.length > 0 && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm font-medium text-muted-foreground mb-1">Deferred locations:</p>
          <p className="text-sm text-foreground">{response.deferred.join(', ')}</p>
          {response.deferred_reason && (
            <p className="text-xs text-muted-foreground mt-1">{response.deferred_reason}</p>
          )}
        </div>
      )}

      {/* Markdown Content */}
      {response.route_plan && (
        <div ref={routeContentRef} className="route-plan-content prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold mt-6 mb-3 text-foreground">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold mt-5 mb-2 text-foreground">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-medium mt-4 mb-2 text-muted-foreground">{children}</h3>
              ),
              pre: ({ children }) => (
                <pre className="bg-card border border-border text-foreground p-4 rounded-lg overflow-x-auto text-sm my-4 font-mono">
                  {children}
                </pre>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>
                ) : (
                  <code>{children}</code>
                );
              },
              ul: ({ children }) => (
                <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-foreground">{children}</li>
              ),
              hr: () => <hr className="my-6 border-border" />,
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              p: ({ children }) => (
                <p className="my-2 text-foreground">{children}</p>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="w-full border-collapse border border-border text-sm">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody>{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="border-b border-border">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left font-semibold text-foreground border border-border">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-foreground border border-border">{children}</td>
              ),
            }}
          >
            {response.route_plan}
          </ReactMarkdown>
        </div>
      )}

      {/* Action Buttons for text-based route plans */}
      {(() => {
        const addresses = extractAddresses(response);
        const mapsUrl = generateGoogleMapsUrl(addresses);
        console.log('[RouteResponse] Extracted addresses:', addresses);
        console.log('[RouteResponse] Generated Maps URL:', mapsUrl);
        return (response.route_plan || addresses.length > 0) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-border flex-wrap print:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={addresses.length === 0}
              onClick={() => {
                const count = copyAddressesToClipboard(addresses);
                toast({
                  title: 'Addresses Copied',
                  description: `${count} addresses copied to clipboard`,
                });
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Addresses {addresses.length > 0 && `(${addresses.length})`}
            </Button>
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <MapPin className="w-4 h-4" />
                Open in Maps
              </a>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                disabled
              >
                <MapPin className="w-4 h-4 mr-2" />
                Open in Maps
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log('[Print] Button clicked');
                const printableContent = response.route_plan 
                  ? extractPrintableRouteContent(response.route_plan)
                  : '';
                
                console.log('[Print] Printable content length:', printableContent?.length);
                
                if (!printableContent) {
                  toast({
                    title: 'Print Failed',
                    description: 'No route content found to print',
                    variant: 'destructive',
                  });
                  return;
                }

                const html = generatePrintableHTML(printableContent, response.query_date);
                console.log('[Print] Generated HTML length:', html?.length);
                
                // Use data URI to open in new tab - most reliable method
                const dataUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
                window.open(dataUri, '_blank');
                
                toast({
                  title: 'Print Preview Opened',
                  description: 'Use Ctrl+P (Cmd+P on Mac) to print from the new tab',
                });
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Route
            </Button>
          </div>
        );
      })()}
    </div>
  );
}
