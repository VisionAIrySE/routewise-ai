// Column mapping utilities for CSV auto-detection

export const FIELD_KEYWORDS: Record<string, string[]> = {
  // STREET ADDRESS
  address: [
    'street', 'address', 'addr', 'location street', 'property address',
    'site address', 'physical address', 'mailing address', 'service address',
    'inspection address', 'risk address', 'property location', 'street address',
    'address line', 'address1', 'address 1', 'addr1', 'addr 1',
    'property street', 'site street', 'loc street', 'loc address',
    'insured address', 'loss address', 'loss location', 'premise address',
    'location address', 'situs address', 'situs', 'premises'
  ],

  // CITY
  city: [
    'city', 'town', 'municipality', 'location city', 'property city',
    'site city', 'mailing city', 'service city', 'inspection city',
    'risk city', 'insured city', 'loss city', 'loc city', 'premise city'
  ],

  // STATE
  state: [
    'state', 'st', 'province', 'location state', 'property state',
    'site state', 'mailing state', 'service state', 'inspection state',
    'risk state', 'insured state', 'loss state', 'loc state', 'premise state',
    'state code', 'state/province'
  ],

  // ZIP CODE
  zip: [
    'zip', 'zipcode', 'zip code', 'zip_code', 'postal', 'postal code',
    'postalcode', 'postcode', 'post code', 'location zip', 'property zip',
    'site zip', 'mailing zip', 'service zip', 'inspection zip', 'risk zip',
    'insured zip', 'loss zip', 'loc zip', 'premise zip', 'zip+4', 'zip4',
    'zip 4', 'zip+', 'postal zip'
  ],

  // INSURED NAME (single field)
  insured: [
    'insured', 'insured name', 'insuredname', 'policyholder', 'policy holder',
    'customer', 'customer name', 'client', 'client name', 'owner', 'owner name',
    'property owner', 'homeowner', 'home owner', 'named insured', 'insrd',
    'claimant', 'claimant name', 'account name', 'account', 'member',
    'member name', 'subscriber', 'subscriber name', 'applicant', 'applicant name',
    'name of insured', 'name', 'full name', 'fullname', 'contact name',
    'contact', 'primary name', 'primary contact', 'responsible party',
    'loss payee', 'loss name', 'loss contact'
  ],

  // FIRST NAME (if separate)
  first_name: [
    'first name', 'firstname', 'first_name', 'fname', 'f name', 'given name',
    'givenname', 'first', 'policyholder first', 'policy holder first',
    'insured first', 'owner first', 'customer first', 'client first',
    'contact first', 'primary first', 'member first'
  ],

  // LAST NAME (if separate)
  last_name: [
    'last name', 'lastname', 'last_name', 'lname', 'l name', 'surname',
    'family name', 'familyname', 'last', 'policyholder last', 'policy holder last',
    'insured last', 'owner last', 'customer last', 'client last',
    'contact last', 'primary last', 'member last'
  ],

  // COMPANY NAME (for commercial/business)
  company_name: [
    'company', 'company name', 'companyname', 'business', 'business name',
    'businessname', 'organization', 'org', 'org name', 'corporation',
    'corp', 'corp name', 'entity', 'entity name', 'firm', 'firm name',
    'dba', 'doing business as', 'trade name', 'tradename', 'commercial name',
    'insured company', 'insured business', 'policyholder company'
  ],

  // DUE DATE
  due_date: [
    'due', 'due date', 'duedate', 'due_date', 'deadline', 'expiration',
    'expiration date', 'expire', 'expire date', 'expires', 'target date',
    'target', 'completion date', 'complete by', 'complete date',
    'inspection due', 'insp due', 'required by', 'required date',
    'must complete', 'must complete by', 'needed by', 'need by',
    'turnaround', 'tat', 'tat date', 'sla', 'sla date', 'commit date',
    'committed date', 'promise date', 'expected date', 'expected by',
    'final date', 'end date', 'close date', 'close by'
  ],

  // APPOINTMENT FLAG (yes/no needs appointment)
  appointment_flag: [
    'appt', 'appointment', 'appointment needed', 'appt needed', 'needs appt',
    'needs appointment', 'appointment required', 'appt required', 'call ahead',
    'call first', 'contact first', 'schedule required', 'scheduling required',
    'must schedule', 'must call', 'requires appointment', 'requires appt',
    'appointment necessary', 'pre-schedule', 'preschedule', 'appointment?',
    'appt?', 'call?', 'schedule?', 'apt', 'apt needed', 'apt required'
  ],

  // APPOINTMENT DATE (pre-scheduled date only)
  appointment_date: [
    'appointment date', 'appt date', 'scheduled date', 'schedule date',
    'scheduled for', 'appointment scheduled', 'appt scheduled',
    'confirmed date', 'confirmed appointment', 'booked date', 'booked for',
    'reservation date', 'reserved date', 'set date', 'arranged date',
    'arranged for', 'apptdate', 'appointmentdate', 'sched date'
  ],

  // SCHEDULE FOR (datetime field - date + time)
  schedule_for: [
    'schedule for', 'scheduled for', 'schedulefor', 'scheduled time',
    'schedule time', 'appointment time', 'appt time', 'appointment datetime',
    'appt datetime', 'scheduled datetime', 'schedule datetime',
    'inspection time', 'inspection datetime', 'visit time', 'visit datetime',
    'arrival time', 'arrive by', 'arrival datetime', 'start time',
    'begin time', 'meeting time', 'meeting datetime', 'time slot',
    'timeslot', 'time/date', 'date/time', 'datetime'
  ],

  // INSPECTION TYPE (for duration lookup)
  inspection_type: [
    'inspection type', 'inspectiontype', 'insp type', 'type', 'service type',
    'servicetype', 'order type', 'ordertype', 'job type', 'jobtype',
    'work type', 'worktype', 'survey type', 'surveytype', 'visit type',
    'visittype', 'form type', 'formtype', 'category', 'classification',
    'class', 'product', 'product type', 'service', 'service code',
    'inspection category', 'insp category', 'work order type', 'wo type',
    'high value', 'standard', 'premium', 'basic', 'level', 'tier',
    'complexity', 'scope', 'inspection scope'
  ],

  // NOTES / COMMENTS / SPECIAL INSTRUCTIONS
  notes: [
    'notes', 'note', 'comments', 'comment', 'remarks', 'remark',
    'instructions', 'instruction', 'special instructions', 'special notes',
    'additional info', 'additional information', 'addl info', 'add info',
    'description', 'desc', 'details', 'detail', 'memo', 'memos',
    'observation', 'observations', 'internal notes', 'field notes',
    'inspector notes', 'inspection notes', 'attention', 'alert',
    'warning', 'caution', 'important', 'special', 'other', 'misc',
    'miscellaneous', 'freeform', 'free form', 'text', 'message'
  ],

  // POLICY NUMBER (for reference/matching)
  policy_number: [
    'policy', 'policy number', 'policynumber', 'policy #', 'policy#',
    'policy no', 'policy num', 'pol number', 'pol #', 'pol#', 'pol no',
    'contract', 'contract number', 'contract #', 'contract#', 'contract no',
    'account number', 'account #', 'account#', 'account no', 'acct',
    'acct number', 'acct #', 'acct#', 'acct no', 'reference', 'reference #',
    'ref', 'ref #', 'ref#', 'ref no', 'reference number', 'id', 'identifier'
  ],

  // CLAIM NUMBER (for claims-based inspections)
  claim_number: [
    'claim', 'claim number', 'claimnumber', 'claim #', 'claim#', 'claim no',
    'loss number', 'loss #', 'loss#', 'loss no', 'case', 'case number',
    'case #', 'case#', 'case no', 'file', 'file number', 'file #', 'file#',
    'file no', 'incident', 'incident number', 'incident #', 'incident#',
    'report number', 'report #', 'report#', 'report no'
  ],

  // PHONE NUMBER
  phone: [
    'phone', 'telephone', 'tel', 'phone number', 'phonenumber', 'phone #',
    'phone#', 'contact phone', 'contact number', 'cell', 'cell phone',
    'cellphone', 'mobile', 'mobile phone', 'mobilephone', 'home phone',
    'work phone', 'office phone', 'primary phone', 'insured phone',
    'customer phone', 'client phone', 'daytime phone', 'evening phone',
    'callback', 'callback number', 'call back', 'reach at'
  ],

  // EMAIL
  email: [
    'email', 'e-mail', 'email address', 'emailaddress', 'mail',
    'electronic mail', 'contact email', 'insured email', 'customer email',
    'client email', 'primary email', 'work email', 'personal email'
  ],

  // SQUARE FOOTAGE (property size)
  square_feet: [
    'square feet', 'sqft', 'sq ft', 'sq. ft', 'square footage', 'squarefeet',
    'squarefootage', 'size', 'property size', 'home size', 'building size',
    'living area', 'living space', 'total sqft', 'total sq ft', 'area',
    'floor area', 'gross area', 'heated sqft', 'heated sq ft', 'footage'
  ],

  // YEAR BUILT
  year_built: [
    'year built', 'yearbuilt', 'year_built', 'built', 'built year',
    'construction year', 'year constructed', 'year of construction',
    'age', 'building age', 'home age', 'property age', 'vintage',
    'original year', 'date built', 'build date', 'construction date'
  ],

  // PROPERTY TYPE
  property_type: [
    'property type', 'propertytype', 'dwelling type', 'dwellingtype',
    'structure type', 'structuretype', 'building type', 'buildingtype',
    'occupancy', 'occupancy type', 'use', 'property use', 'usage',
    'residence type', 'residencetype', 'home type', 'hometype',
    'construction type', 'constructiontype', 'style', 'property style'
  ]
};

// Field display names for UI
export const FIELD_LABELS: Record<string, string> = {
  address: 'Street Address',
  city: 'City',
  state: 'State',
  zip: 'ZIP Code',
  insured: 'Insured Name',
  first_name: 'First Name',
  last_name: 'Last Name',
  company_name: 'Company Name',
  due_date: 'Due Date',
  appointment_flag: 'Appointment Flag',
  appointment_date: 'Appointment Date',
  schedule_for: 'Schedule DateTime',
  inspection_type: 'Inspection Type',
  notes: 'Notes',
  policy_number: 'Policy Number',
  claim_number: 'Claim Number',
  phone: 'Phone',
  email: 'Email',
  square_feet: 'Square Feet',
  year_built: 'Year Built',
  property_type: 'Property Type'
};

// Required fields for minimum viable mapping
export const REQUIRED_FIELDS = ['address', 'city', 'state', 'zip'];

// Priority order for field detection
export const FIELD_PRIORITY = [
  'address', 'city', 'state', 'zip',  // Required location
  'insured', 'first_name', 'last_name', 'company_name',  // Name fields
  'due_date', 'appointment_flag', 'appointment_date', 'schedule_for',  // Dates
  'inspection_type', 'notes', 'phone', 'email',  // Other
  'policy_number', 'claim_number', 'square_feet', 'year_built', 'property_type'
];

/**
 * Auto-suggest field mappings based on column headers
 */
export function suggestMappings(headers: string[]): Record<string, string | null> {
  const mappings: Record<string, string | null> = {};
  const usedHeaders = new Set<string>();

  for (const field of FIELD_PRIORITY) {
    const keywords = FIELD_KEYWORDS[field];
    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const header of headers) {
      if (usedHeaders.has(header)) continue;

      const headerLower = header.toLowerCase().trim();

      for (const keyword of keywords) {
        // Exact match = highest score
        if (headerLower === keyword) {
          if (100 > bestScore) {
            bestScore = 100;
            bestMatch = header;
          }
        }
        // Contains keyword = partial score based on length ratio
        else if (headerLower.includes(keyword) || keyword.includes(headerLower)) {
          const score = Math.min(keyword.length, headerLower.length) /
                       Math.max(keyword.length, headerLower.length) * 80;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = header;
          }
        }
      }
    }

    if (bestMatch && bestScore > 30) {  // Threshold to avoid bad matches
      mappings[field] = bestMatch;
      usedHeaders.add(bestMatch);
    } else {
      mappings[field] = null;
    }
  }

  return mappings;
}

/**
 * Get unmapped columns (columns not assigned to any field)
 */
export function getUnmappedColumns(headers: string[], mappings: Record<string, string | null>): string[] {
  const mappedHeaders = new Set(Object.values(mappings).filter(v => v !== null));
  return headers.filter(h => !mappedHeaders.has(h));
}

/**
 * Generate a company code from company name
 */
export function generateCompanyCode(name: string): string {
  // Take first 3 letters of significant words
  const words = name.split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return 'NEW';
  
  if (words.length === 1) {
    return words[0].substring(0, 3).toUpperCase();
  }
  
  // Take first letter of each word up to 3 words
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
}

/**
 * Validate that all required fields are mapped
 */
export function validateMappings(mappings: Record<string, string | null>): { valid: boolean; missing: string[] } {
  const missing = REQUIRED_FIELDS.filter(field => !mappings[field]);
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Parse CSV headers from file content
 */
export function parseCSVHeaders(content: string): string[] {
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const headerLine = lines[0];
  // Handle quoted values
  const headers: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      headers.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  headers.push(current.trim());
  
  return headers.filter(h => h.length > 0);
}

/**
 * Convert mappings object to the format expected by company_profiles.column_mappings
 */
export function formatMappingsForDB(mappings: Record<string, string | null>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(mappings).filter(([_, v]) => v !== null)
  ) as Record<string, string>;
}
