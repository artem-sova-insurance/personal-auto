const CUR_YEAR = new Date().getFullYear();

export const VEHICLE_YEARS = Array.from({ length: CUR_YEAR - 1989 }, (_, i) => {
  const y = String(CUR_YEAR + 1 - i);
  return { value: y, label: y };
});

export const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' },   { value: '4', label: 'April' },
  { value: '5', label: 'May' },     { value: '6', label: 'June' },
  { value: '7', label: 'July' },    { value: '8', label: 'August' },
  { value: '9', label: 'September' },{ value: '10', label: 'October' },
  { value: '11', label: 'November' },{ value: '12', label: 'December' },
];

export const INCIDENT_YEARS = Array.from({ length: 4 }, (_, i) => {
  const y = String(CUR_YEAR - i);
  return { value: y, label: y };
});

export const YES_NO = [
  { value: 'yes', labelKey: 'common.yes' },
  { value: 'no',  labelKey: 'common.no' },
];

// ── Car makes & models ────────────────────────────────────────────────────────
export const CAR_MAKES = [
  'Acura','Audi','BMW','Buick','Cadillac','Chevrolet','Chrysler','Dodge',
  'Ford','GMC','Genesis','Honda','Hyundai','Infiniti','Jeep','Kia',
  'Land Rover','Lexus','Lincoln','Mazda','Mercedes-Benz','Mitsubishi',
  'Nissan','Ram','Subaru','Tesla','Toyota','Volkswagen','Volvo','Other',
];

export const CAR_MODELS = {
  Acura:           ['ILX','MDX','RDX','TLX','Other'],
  Audi:            ['A3','A4','A6','Q3','Q5','Q7','Other'],
  BMW:             ['3 Series','5 Series','7 Series','X1','X3','X5','X7','M3','M5','Other'],
  Buick:           ['Enclave','Encore','Envision','Other'],
  Cadillac:        ['CT4','CT5','Escalade','XT4','XT5','XT6','Other'],
  Chevrolet:       ['Blazer','Camaro','Colorado','Equinox','Malibu','Silverado 1500','Suburban','Tahoe','Traverse','Other'],
  Chrysler:        ['300','Pacifica','Voyager','Other'],
  Dodge:           ['Challenger','Charger','Durango','Journey','Other'],
  Ford:            ['Bronco','EcoSport','Edge','Escape','Expedition','Explorer','F-150','Fusion','Maverick','Mustang','Ranger','Other'],
  GMC:             ['Acadia','Canyon','Sierra 1500','Terrain','Yukon','Other'],
  Genesis:         ['G70','G80','GV70','GV80','Other'],
  Honda:           ['Accord','Civic','CR-V','HR-V','Odyssey','Passport','Pilot','Ridgeline','Other'],
  Hyundai:         ['Elantra','Ioniq 5','Ioniq 6','Kona','Palisade','Santa Fe','Sonata','Tucson','Other'],
  Infiniti:        ['Q50','QX50','QX60','QX80','Other'],
  Jeep:            ['Cherokee','Compass','Gladiator','Grand Cherokee','Renegade','Wrangler','Other'],
  Kia:             ['Carnival','EV6','Forte','K5','Seltos','Soul','Sorento','Sportage','Stinger','Telluride','Other'],
  'Land Rover':    ['Defender','Discovery','Evoque','Range Rover','Sport','Other'],
  Lexus:           ['ES','GX','IS','LS','NX','RX','UX','Other'],
  Lincoln:         ['Aviator','Corsair','Nautilus','Navigator','Other'],
  Mazda:           ['CX-30','CX-5','CX-9','Mazda3','MX-5 Miata','Other'],
  'Mercedes-Benz': ['A-Class','C-Class','E-Class','GLA','GLC','GLE','S-Class','Other'],
  Mitsubishi:      ['Eclipse Cross','Outlander','Mirage','Other'],
  Nissan:          ['Altima','Armada','Frontier','Maxima','Murano','Pathfinder','Rogue','Sentra','Titan','Versa','Other'],
  Ram:             ['1500','2500','3500','ProMaster','Other'],
  Subaru:          ['Ascent','BRZ','Crosstrek','Forester','Impreza','Legacy','Outback','Solterra','Other'],
  Tesla:           ['Cybertruck','Model 3','Model S','Model X','Model Y','Other'],
  Toyota:          ['4Runner','Avalon','bZ4X','Camry','Corolla','GR86','Highlander','Land Cruiser','Prius','RAV4','Sequoia','Sienna','Tacoma','Tundra','Other'],
  Volkswagen:      ['Atlas','Golf','ID.4','Jetta','Passat','Taos','Tiguan','Other'],
  Volvo:           ['S60','V60','XC40','XC60','XC90','Other'],
  Other:           ['Other'],
};

// ── FL top insurers ───────────────────────────────────────────────────────────
export const FL_INSURERS = [
  { value: 'state_farm',     label: 'State Farm' },
  { value: 'geico',          label: 'GEICO' },
  { value: 'progressive',    label: 'Progressive' },
  { value: 'allstate',       label: 'Allstate' },
  { value: 'usaa',           label: 'USAA' },
  { value: 'farmers',        label: 'Farmers' },
  { value: 'liberty_mutual', label: 'Liberty Mutual' },
  { value: 'nationwide',     label: 'Nationwide' },
  { value: 'aaa',            label: 'AAA' },
  { value: 'travelers',      label: 'Travelers' },
  { value: 'other',          label: 'Other' },
  { value: 'dont_know',      label: "I'm not sure" },
  { value: 'none',           label: 'No insurance currently' },
];

// ── Usage options ─────────────────────────────────────────────────────────────
export const USAGE_OPTIONS = [
  { value: 'commute',   label: 'Commute to work',          labelKey: 'vehicle.usage_commute' },
  { value: 'pleasure',  label: 'Pleasure / personal',       labelKey: 'vehicle.usage_pleasure' },
  { value: 'business',  label: 'Business use',              labelKey: 'vehicle.usage_business' },
  { value: 'rideshare', label: 'Rideshare (Uber/Lyft/Other)', labelKey: 'vehicle.usage_rideshare' },
  { value: 'turo',      label: 'Turo (car rental)',         labelKey: 'vehicle.usage_turo' },
];

// ── Annual miles options ──────────────────────────────────────────────────────
export const ANNUAL_MILES_OPTIONS = [
  { value: 'under5k',  label: 'Under 5,000',     labelKey: 'vehicle.miles_under5k' },
  { value: '5to7k',    label: '5,000 – 7,000',   labelKey: 'vehicle.miles_5to7k' },
  { value: '7to15k',   label: '7,000 – 15,000',  labelKey: 'vehicle.miles_7to15k' },
  { value: '15to20k',  label: '15,000 – 20,000', labelKey: 'vehicle.miles_15to20k' },
  { value: 'over20k',  label: 'Over 20,000',      labelKey: 'vehicle.miles_over20k' },
];

// ── Ownership options ─────────────────────────────────────────────────────────
export const OWNERSHIP_OPTIONS = [
  { value: 'owned',    label: 'Owned outright' },
  { value: 'financed', label: 'Financed (loan)' },
  { value: 'leased',   label: 'Leased' },
];

// ── Relationship options ──────────────────────────────────────────────────────
export const RELATIONSHIP_OPTIONS = [
  { value: 'spouse',   label: 'Spouse / Partner' },
  { value: 'child',    label: 'Child' },
  { value: 'parent',   label: 'Parent' },
  { value: 'sibling',  label: 'Sibling' },
  { value: 'roommate', label: 'Roommate' },
  { value: 'other',    label: 'Other' },
];

// ── Violation types ───────────────────────────────────────────────────────────
export const VIOLATION_TYPES = [
  { value: 'speeding_minor',   label: 'Speeding (1–15 mph over)' },
  { value: 'speeding_major',   label: 'Speeding (16+ mph over)' },
  { value: 'reckless',         label: 'Reckless driving' },
  { value: 'dui',              label: 'DUI / DWI' },
  { value: 'at_fault',         label: 'At-fault accident' },
  { value: 'failure_to_stop',  label: 'Failure to stop' },
  { value: 'distracted',       label: 'Distracted driving' },
  { value: 'other',            label: 'Other moving violation' },
];

// ── Contact step fields ───────────────────────────────────────────────────────
export const CONTACT_FIELDS = [
  {
    id: 'nameGrid', type: '_grid',
    fields: [
      { id: 'firstName', type: 'text', label: 'First Name', placeholder: 'John', required: true },
      { id: 'lastName',  type: 'text', label: 'Last Name',  placeholder: 'Smith', required: true },
    ],
  },
  { id: 'dateOfBirth', type: 'date', label: 'Date of Birth', required: true },
  {
    id: 'maritalStatus', type: 'radio', labelKey: 'common.maritalStatus', label: 'Marital Status', required: true,
    options: [
      { value: 'single',   labelKey: 'common.single',   label: 'Single' },
      { value: 'married',  labelKey: 'common.married',  label: 'Married' },
      { value: 'divorced', labelKey: 'common.divorced', label: 'Divorced' },
      { value: 'widowed',  labelKey: 'common.widowed',  label: 'Widowed' },
    ],
  },
  {
    id: 'emailPhoneGrid', type: '_grid',
    fields: [
      { id: 'email', type: 'email', label: 'Email Address', placeholder: 'john@example.com', required: true },
      { id: 'phone', type: 'tel',   label: 'Phone Number',  placeholder: '(954) 000-0000',   required: true },
    ],
  },
  { id: 'address', type: 'text', labelKey: 'contact.address', label: 'Street Address', placeholder: '123 Main St, Hollywood, FL 33021' },
  {
    id: 'stateZipGrid', type: '_grid',
    fields: [
      { id: 'state',   type: 'select', label: 'State',    placeholder: '— State —', required: true },
      { id: 'zipCode', type: 'text',   label: 'ZIP Code', placeholder: '33021',     required: true },
    ],
  },
  {
    id: 'homeownerStatus', type: 'radio', labelKey: 'contact.homeownerStatus', label: 'Do you own or rent your home?',
    helpTextKey: 'contact.homeownerHint', helpText: 'Bundling home + auto can save you up to 15%',
    options: [
      { value: 'own',   labelKey: 'contact.own',   label: '🏠 Own' },
      { value: 'rent',  labelKey: 'contact.rent',  label: '🏢 Rent' },
      { value: 'other', labelKey: 'contact.other', label: 'Other' },
    ],
  },
];

// ── Coverage step fields ──────────────────────────────────────────────────────
export const COVERAGE_FIELDS = [
  {
    id: 'liabilityLimit', type: 'select', labelKey: 'coverage.liabilityLimit', label: 'Liability Coverage Limit', required: true,
    helpTextKey: 'coverage.liabilityHint', helpText: 'Bodily Injury per person / per accident / Property Damage',
    options: [
      { value: 'state_min',   labelKey: 'coverage.liability_state_min',   label: 'State Minimum' },
      { value: '10_20_10',    labelKey: 'coverage.liability_10_20_10',    label: '$10k / $20k / $10k' },
      { value: '25_50_25',    labelKey: 'coverage.liability_25_50_25',    label: '$25k / $50k / $25k' },
      { value: '50_100_50',   labelKey: 'coverage.liability_50_100_50',   label: '$50k / $100k / $50k' },
      { value: '100_300_100', labelKey: 'coverage.liability_100_300_100', label: '$100k / $300k / $100k' },
      { value: '250_500_250', labelKey: 'coverage.liability_250_500_250', label: '$250k / $500k / $250k' },
    ],
  },
  { id: 'hasCollision', type: 'radio', labelKey: 'coverage.hasCollision', label: 'Add Collision Coverage?', options: YES_NO },
  {
    id: 'collisionDeductible', type: 'select', labelKey: 'coverage.collisionDeductible', label: 'Collision Deductible',
    showWhen: { field: 'hasCollision', equals: 'yes' },
    options: [
      { value: '250',  label: '$250' },
      { value: '500',  label: '$500' },
      { value: '1000', label: '$1,000' },
      { value: '2000', label: '$2,000' },
      { value: '2500', label: '$2,500' },
    ],
  },
  { id: 'hasComprehensive', type: 'radio', labelKey: 'coverage.hasComprehensive', label: 'Add Comprehensive Coverage?', options: YES_NO },
  {
    id: 'comprehensiveDeductible', type: 'select', labelKey: 'coverage.comprehensiveDeductible', label: 'Comprehensive Deductible',
    showWhen: { field: 'hasComprehensive', equals: 'yes' },
    options: [
      { value: '100',  label: '$100' },
      { value: '250',  label: '$250' },
      { value: '500',  label: '$500' },
      { value: '1000', label: '$1,000' },
      { value: '2500', label: '$2,500' },
    ],
  },
  {
    id: 'additionalCoverages', type: 'checkbox-group', labelKey: 'coverage.additionalCoverages', label: 'Additional Coverages',
    options: [
      { value: 'uninsured_motorist', labelKey: 'coverage.cov_uninsured', label: 'Uninsured / Underinsured Motorist' },
      { value: 'medical_payments',   labelKey: 'coverage.cov_medical',   label: 'Medical Payments / PIP' },
      { value: 'roadside',           labelKey: 'coverage.cov_roadside',  label: 'Roadside Assistance' },
      { value: 'rental',             labelKey: 'coverage.cov_rental',    label: 'Rental Car Reimbursement' },
      { value: 'towing',             labelKey: 'coverage.cov_towing',    label: 'Towing & Labor' },
    ],
  },
  {
    id: 'additionalNotes', type: 'textarea', labelKey: 'coverage.additionalNotes', label: 'Anything else we should know?',
    placeholderKey: 'coverage.notesPlaceholder', placeholder: 'Special requests, questions, or details…',
  },
];

// ── History step fields ───────────────────────────────────────────────────────
export const HISTORY_FIELDS = [
  { id: 'hasViolations',   type: 'radio', label: 'Any traffic violations in the past 3 years?', required: true, options: YES_NO },
  { id: 'hasAccidents',    type: 'radio', label: 'Any accidents in the past 3 years?',          required: true, options: YES_NO },
  { id: 'currentlyInsured', type: 'radio', label: 'Are you currently insured?',                 required: true, options: YES_NO },
  {
    id: 'currentInsurer', type: 'select', label: 'Current Insurance Company',
    showWhen: { field: 'currentlyInsured', equals: 'yes' },
    options: FL_INSURERS,
  },
  {
    id: 'yearsInsured', type: 'select', label: 'How long with current insurer?',
    showWhen: { field: 'currentlyInsured', equals: 'yes' },
    options: [
      { value: 'under1', label: 'Less than 1 year' },
      { value: '1to2',   label: '1–2 years' },
      { value: '3to5',   label: '3–5 years' },
      { value: 'over5',  label: 'More than 5 years' },
    ],
  },
];
