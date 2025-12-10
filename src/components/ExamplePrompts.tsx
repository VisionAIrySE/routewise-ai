import { useState } from 'react';
import { MessageCircle, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ExamplePromptsProps {
  onPromptClick?: (prompt: string) => void;
}

const prompts = {
  'Route Planning': [
    "I have 4 hours tomorrow starting at 9am",
    "Plan my route for Friday, I'm free from 8:30am to 2pm",
    "What's the best route if I only have 2 hours this afternoon?",
    "I can work a full 8-hour day tomorrow, optimize my route",
    "Plan a half-day route starting at 10am",
  ],
  'Priority & Urgency': [
    "What are my most critical inspections right now?",
    "Show me everything that's overdue",
    "Which inspections are due this week?",
    "Focus only on CRITICAL and URGENT items today",
    "What will expire if I don't get to it by Friday?",
  ],
  'Fixed Appointments': [
    "I have a SIG appointment at 10:30am tomorrow, plan around it",
    "Build a route with my 2pm fixed appointment as the anchor",
    "What can I fit in before my 11am scheduled inspection?",
    "I have two fixed appointments tomorrow at 9am and 2pm",
  ],
  'Geographic Focus': [
    "Focus on the Hartford area today",
    "I want to stay in the northeast quadrant",
    "Cluster inspections near downtown",
    "What's closest to my current location in Stamford?",
    "Group inspections by city",
  ],
  'Route Modifications': [
    "Skip the first stop, I already completed it",
    "Remove stop 3, the homeowner rescheduled",
    "Add another inspection if there's time",
    "Swap stops 2 and 4",
    "Can I fit in one more near my last stop?",
  ],
  'Analysis & Info': [
    "How many MIL inspections do I have pending?",
    "What's my workload look like this week?",
    "Show me all SIG appointments coming up",
    "Which company has the most urgent inspections?",
    "Summarize what I need to complete by end of week",
  ],
};

const promptCategories = Object.entries(prompts);
const leftColumn = promptCategories.slice(0, 3);
const rightColumn = promptCategories.slice(3);

export function ExamplePrompts({ onPromptClick }: ExamplePromptsProps) {
  return (
    <div className="rounded-xl border border-border bg-card animate-fade-in">
      <Accordion type="single" collapsible defaultValue="ai-assistant">
        <AccordionItem value="ai-assistant" className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">AI Route Assistant</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Click any prompt to get started
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                {leftColumn.map(([category, categoryPrompts]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="h-auto py-1.5 px-2.5 text-xs text-left whitespace-normal"
                          onClick={() => onPromptClick?.(prompt)}
                        >
                          <MessageCircle className="h-3 w-3 mr-1.5 shrink-0" />
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                {rightColumn.map(([category, categoryPrompts]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="h-auto py-1.5 px-2.5 text-xs text-left whitespace-normal"
                          onClick={() => onPromptClick?.(prompt)}
                        >
                          <MessageCircle className="h-3 w-3 mr-1.5 shrink-0" />
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
