# Route Optimizer Status - December 10, 2025

## Current State: ALMOST WORKING

The route optimizer is functional but has one remaining issue:
- **AI keeps asking clarifying questions** instead of building routes immediately
- Need to test updated system prompt with stronger MANDATORY rules at top

## What's Working
1. **Prepare AI Context** - Has lat/lng, all inspection data, home_base coords
2. **Format Response** - Falls back to `route_plan` markdown when AI outputs markdown
3. **Lovable frontend** - Parses EXPORT FOR NAVIGATION block, buttons work
4. **Markdown rendering** - Tables render with remark-gfm plugin

## What Needs Testing
- Updated system prompt with MANDATORY section at top
- ZIP code routing (97707 = Sunriver, not Bend)

## Workflow Details
- **Workflow ID:** `1zJt14eRztaBwFTz`
- **Name:** Inspector Route System - AI Route Optimizer
- **Nodes:** 23

## Key Nodes
- `Route Query` - Webhook entry point
- `Fetch Pending Inspections` - Gets data from Airtable
- `Prepare AI Context` - Builds inspection array with lat/lng
- `Route Optimizer Agent` - AI agent with Claude
- `Calculate Route Times` - Regex fixes times in markdown (may need to be passthrough)
- `Format Response` - Returns route_plan or optimized_routes
- `Send Response` - Webhook response

## System Prompt (FINAL VERSION TO TEST)
Located at: `/home/visionairy/routewise-ai/docs/SYSTEM_PROMPT_FINAL.md`

## Inspection Data Structure
```javascript
{
  id: "IPI-20251211-021",
  company: "IPI",
  address: "16928 PONDEROSA CASCADE DR, BEND, OR 97703",
  street: "16928 PONDEROSA CASCADE DR",
  city: "BEND",
  state: "OR",
  zip: "97703",
  insured: "BIRD, JANET",
  days_remaining: 7,
  urgency: "URGENT",
  duration_min: 15,
  lat: 44.2159572,
  lng: -121.4789961
}
```

## Inspection Counts by Zone
- **Bend (97701, 97702, 97703):** 9 inspections
- **Sunriver (97707):** 3 inspections
- **La Pine (97739):** 7 inspections
- **Other zones:** 13 inspections (Redmond, Madras, Prineville, etc.)

## Key Rules
1. Route by ZIP CODE, not city name in address
2. "BEND, OR 97707" = Sunriver (zip determines zone)
3. Default 8 hours if not specified
4. Default 08:00 AM start if not specified
5. Never ask clarifying questions

## Failed Approaches (DO NOT RETRY)
1. **Structured Output Parser** - Broke workflow connections, AI returned zone names instead of IDs
2. **JSON output from AI** - AI interprets schema loosely, needs explicit instructions
3. **MCP node updates** - Can mess up connections, safer to paste in UI

## Next Steps (Priority Order)
1. **Paste final system prompt** into Route Optimizer Agent and test
2. **Fix timing calculations** - AI math is inconsistent, may need Calculate Route Times node to do real math instead of regex fixes
3. **Add print-friendly tag** - Create marker in AI output (e.g., `<!-- PRINT_ROUTE_DAY1 -->`) that Lovable can extract for printing only final route stops
4. **Fix Google Maps button** - "Open in Maps" failing:
   - Debug `extractAddresses()` parsing of EXPORT FOR NAVIGATION
   - Check URL encoding for Google Maps
   - Split by day (separate Maps links for Thursday vs Friday)
5. **Populate Google Maps by day** - Each day needs its own "Open in Maps" button
