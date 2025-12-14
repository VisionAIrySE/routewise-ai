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
    <div className="space-y-4 animate-fade-in">
      {/* Prominent CTA Section */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/10 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <img src="/favicon.png" alt="Inspector Route AI" className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground lg:text-2xl">
                Inspector Route AI Assistant
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Plan, review, prioritize, and adjust your inspection schedule based on your needs. 
                Just describe your availability and let AI optimize your routes!
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="shrink-0 gap-2 shadow-lg shadow-primary/25 text-base px-6 py-6"
            onClick={() => onPromptClick?.("I have time available today, what should I prioritize?")}
          >
            <MessageCircle className="h-5 w-5" />
            Start Planning
          </Button>
        </div>
      </div>

      {/* Prompt Suggestions Accordion */}
      <div className="rounded-xl border border-border bg-card">
        <Accordion type="single" collapsible>
          <AccordionItem value="prompt-suggestions" className="border-0">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground">Prompt Suggestions</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    Example prompts to help you get started
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
    </div>
  );
}
