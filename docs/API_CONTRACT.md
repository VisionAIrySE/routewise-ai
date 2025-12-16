# Inspector Route AI - API Contract Documentation

This document defines the exact request/response structures for all frontend-to-n8n communications.

## Overview

All API calls route through the **n8n-proxy Edge Function**:
```
https://rsylbntdtflyoaxiwhvm.supabase.co/functions/v1/n8n-proxy
```

The proxy:
1. Validates JWT token from `Authorization: Bearer <token>` header
2. Extracts `user_id` from the verified JWT
3. Injects `user_id` into the request body
4. Forwards to appropriate n8n webhook

**Authentication**: All requests require `Authorization: Bearer <supabase_access_token>` header.

---

## 1. Chat / Build Route

**Trigger**: User sends message in AI chat panel  
**Consumer**: `src/hooks/useChat.ts` → `AIChatPanel.tsx`

### Request

```typescript
// POST to n8n-proxy (no action param)
interface ChatRequest {
  message: string;              // REQUIRED - User's natural language request
  session_id: string;           // REQUIRED - UUID for conversation continuity
  editing_route?: boolean;      // Optional - true if editing existing route
  current_route?: EditRouteContext; // Optional - context when editing
}

interface EditRouteContext {
  action: string;               // "edit_route"
  route_id: string;             // UUID of route being edited
  route_date: string;           // "YYYY-MM-DD"
  start_time?: string | null;   // "HH:MM" or null
  stops: RouteStop[];           // Current stops array
  total_hours?: number | null;
  total_miles?: number | null;
  zones?: string[] | null;
  original_request?: string | null;
  hours_requested?: number | null;
  location_filter?: string | null;
  exclusions?: string[] | null;
}
```

### Response - Route Optimizer Response (Primary)

```typescript
interface RouteOptimizerResponse {
  success: boolean;                    // REQUIRED - must be true for valid response
  query: string;                       // Original user query
  query_date: string;                  // "YYYY-MM-DD"
  available_hours: number | null;      // Hours user requested
  total_pending: number;               // Total pending inspections in system
  urgency_counts: {                    // REQUIRED for type detection
    CRITICAL: number;
    URGENT: number;
    SOON: number;
    NORMAL: number;
    UNKNOWN: number;
  };
  route_plan?: string;                 // Markdown-formatted route plan (REQUIRED for display)
  ai_summary?: string;                 // Optional AI commentary
  optimized_routes?: RouteDay[];       // Structured route data for maps/saving
  home_base?: HomeBase;                // User's home base coordinates
  generated_at: string;                // ISO timestamp
  deferred?: string[];                 // List of deferred inspection IDs
  deferred_reason?: string;            // Why inspections were deferred
}
```

### Response - General Text (Fallback)

```typescript
// If not RouteOptimizerResponse, frontend extracts text from:
interface GenericResponse {
  response?: string;    // Primary text field
  message?: string;     // Alternative
  output?: string;      // Alternative
  text?: string;        // Alternative
}
// Falls back to JSON.stringify(data) if none match
```

### Type Detection Logic

```typescript
function isRouteOptimizerResponse(data: unknown): data is RouteOptimizerResponse {
  return (
    data.success === true &&
    (typeof data.route_plan === 'string' || Array.isArray(data.optimized_routes)) &&
    data.urgency_counts !== undefined
  );
}
```

---

## 2. CSV Upload

**Trigger**: User uploads file in CSVUploadModal  
**Consumer**: `src/components/CSVUploadModal.tsx`

### Request

```typescript
// POST to n8n-proxy?action=upload
// Content-Type: multipart/form-data (set automatically by browser)

FormData {
  file: File;           // REQUIRED - CSV or XLSX file
  // user_id is injected by proxy from JWT - DO NOT send from frontend
}
```

### Response

```typescript
interface UploadResponse {
  success: boolean;                    // REQUIRED
  message: string;                     // Human-readable status
  company: string;                     // Detected company code (MIL, IPI, SIG, etc.)
  batch_id: string;                    // Unique batch identifier
  total_rows_in_file: number;          // Total rows in uploaded file
  valid_inspections: number;           // Rows that passed validation
  inserted_to_airtable: number;        // Legacy field (still checked for count)
  timestamp: string;                   // ISO timestamp
  
  // Reconciliation fields (optional)
  needs_reconciliation?: boolean;      // True if missing inspections detected
  missing_inspections?: MissingInspection[];  // List of missing inspections
  missing_count?: number;              // Count of missing
  reconciliation_message?: string;     // Explanation message
}

interface MissingInspection {
  id: string;                          // Inspection UUID (Supabase)
  inspection_id: string;               // External inspection ID
  company: string;                     // Company code
  insured_name: string;                // Property owner name
  address: string;                     // Full address
  urgency: string;                     // CRITICAL | URGENT | SOON | NORMAL
  days_remaining: number;              // Days until due
}
```

### Count Extraction Logic (Frontend)

```typescript
// Frontend checks these fields in priority order:
const recordsCount = 
  uploadResult.inserted_to_airtable || 
  uploadResult.valid_inspections || 
  uploadResult.total_rows_in_file || 
  0;
```

---

## 3. Reconcile Inspections

**Trigger**: User confirms reconciliation after upload  
**Consumer**: `src/components/ReconcileInspections.tsx` → `src/lib/routeUtils.ts`

### Request

```typescript
// POST to n8n-proxy
interface ReconcileRequest {
  action: "reconcile";                 // REQUIRED - action identifier
  completed_ids: string[];             // REQUIRED - inspection UUIDs to mark COMPLETED
  removed_ids: string[];               // REQUIRED - inspection UUIDs to mark REMOVED
}
```

### Response

```typescript
interface ReconciliationResult {
  success: boolean;                    // REQUIRED
  message: string;                     // Human-readable status
  completed_count: number;             // Number marked completed
  removed_count: number;               // Number marked removed
  total_updated: number;               // Total records updated
}
```

---

## 4. Get Saved Routes (Legacy n8n)

**Trigger**: Fetching routes via n8n (legacy path)  
**Consumer**: `src/lib/routeUtils.ts` → `fetchSavedRoutes()`

### Request

```typescript
// POST to n8n-proxy
interface GetSavedRoutesRequest {
  action: "get_saved_routes";          // REQUIRED
}
```

### Response

```typescript
interface SavedRoutesResponse {
  success: boolean;                    // REQUIRED
  routes: SavedRoute[];                // Array of saved routes
  count: number;                       // Total count
}

interface SavedRoute {
  id: string;                          // Route UUID
  date: string;                        // "YYYY-MM-DD"
  stops_count: number;
  total_miles: number;
  total_hours: number;
  drive_hours: number;
  fuel_cost: number;
  zones: string;                       // Comma-separated zone names
  start_time?: string;                 // "HH:MM"
  finish_time?: string;                // "HH:MM"
  stops: RouteStop[];                  // Ordered stop array
  created_at?: string;                 // ISO timestamp
}
```

---

## 5. Save Route (Direct Supabase)

**Note**: Routes are now saved directly to Supabase, NOT via n8n.

**Trigger**: User clicks "Save Route"  
**Consumer**: `src/hooks/useSavedRoutes.ts` → `useSaveRoute()`

### Data Saved to `saved_routes` Table

```typescript
interface SaveRouteInsert {
  user_id: string;                     // From auth context
  route_date: string;                  // "YYYY-MM-DD"
  day_of_week: number;                 // 0-6 (Sunday=0)
  route_name: string | null;           // Day name or custom name
  status: "planned";                   // Initial status
  stops_count: number;
  total_miles: number | null;
  total_hours: number | null;
  drive_hours: number | null;
  inspection_hours: number | null;
  fuel_cost: number | null;
  zones: string[] | null;              // Array of zone names
  start_time: string | null;           // "HH:MM"
  finish_time: string | null;          // "HH:MM"
  stops_json: RouteStop[];             // Full stop data as JSONB
  original_request: string | null;     // Original user prompt
}
```

---

## 6. Mark Inspection Complete

**Trigger**: User marks stop as "Already Done"  
**Consumer**: Direct Supabase update (not n8n)

### Data Updated in `inspections` Table

```typescript
// Direct Supabase update
await supabase
  .from('inspections')
  .update({ 
    status: 'COMPLETED',
    completed_date: new Date().toISOString().split('T')[0]
  })
  .eq('id', inspectionId)
  .eq('user_id', userId);
```

---

## Shared Data Types

### RouteStop

```typescript
interface RouteStop {
  id: string;                          // Inspection UUID
  order: number;                       // Stop sequence (1-based)
  lat: number;                         // Latitude
  lng: number;                         // Longitude
  name: string;                        // Insured/property name
  address: string;                     // Full street address
  company: string;                     // Company code (MIL, IPI, SIG)
  urgency: string;                     // CRITICAL | URGENT | SOON | NORMAL
  duration_minutes: number;            // Inspection duration
  drive_minutes_to_next: number | null; // Drive time to next stop
  drive_miles_to_next: number | null;   // Distance to next stop
  needs_call_ahead: boolean;           // Requires advance call
  scheduled_time?: string;             // "HH:MM" if scheduled
  days_remaining?: number;             // Days until due (999 = no due date)
}
```

### RouteDay

```typescript
interface RouteDay {
  day: string;                         // Day name (e.g., "MONDAY")
  date: string;                        // "YYYY-MM-DD"
  summary: {
    stops: number;
    total_route_hours: number;
    total_drive_hours: number;
    inspection_hours: number;
    total_distance_miles: number;
    estimated_fuel: number;
    zones: string[];
  };
  stops: RouteStop[];
}
```

### HomeBase

```typescript
interface HomeBase {
  lat: number;
  lng: number;
  address: string;
}
```

---

## Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  error: string;                       // Error message
  status?: number;                     // HTTP status code
}
```

### Frontend Error Handling Pattern

```typescript
// All API calls follow this pattern:
if (!response.ok || result.error) {
  throw new Error(result.error || `Request failed: ${response.status}`);
}
```

---

## Field Name Reference

| UI Field | n8n Field | Supabase Column | Notes |
|----------|-----------|-----------------|-------|
| Insured Name | `insured_name` | `insured_name` | snake_case throughout |
| Address | `address` | `full_address` or `street + city + state + zip` | Combined on read |
| Company | `company` | `company_name` | MIL, IPI, SIG codes |
| Urgency | `urgency` | `urgency_tier` | CRITICAL/URGENT/SOON/NORMAL |
| Days Remaining | `days_remaining` | `days_remaining` | 999 = no due date |
| Due Date | `due_date` | `due_date` | Date only, no time |
| Duration | `duration_minutes` | `duration_min` | In minutes |
| Call Ahead | `needs_call_ahead` | `needs_call_ahead` | Boolean |
| Fixed Appointment | `fixed_appointment` | `fixed_appointment` | ISO timestamp |
| Status | `status` | `status` | PENDING/PLANNED/COMPLETED/REMOVED |

---

## n8n Webhook Endpoints

The proxy forwards to these n8n webhooks:

| Action | Webhook URL |
|--------|-------------|
| Route Query (chat) | `https://visionairy.app.n8n.cloud/webhook/route-query` |
| CSV Upload | `https://visionairy.app.n8n.cloud/webhook/upload-inspections` |

**Note**: These URLs are hardcoded in the edge function, not configurable via environment variables.
