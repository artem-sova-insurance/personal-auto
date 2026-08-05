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

// ── Violation types (Tickets / Violations category) ────────────────────────────
export const VIOLATION_TYPES = [
  { value: 'auto_theft_felony',             label: 'Auto Theft / Felony' },
  { value: 'careless_improper',             label: 'Careless or Improper Operation of Vehicle' },
  { value: 'defective_equipment',           label: 'Defective Equipment' },
  { value: 'disregard_traffic_device',      label: 'Disregard Traffic Device or Sign' },
  { value: 'drag_racing',                   label: 'Drag Racing' },
  { value: 'dui',                           label: 'Driving Under the Influence' },
  { value: 'equipment_violation',           label: 'Equipment Violations' },
  { value: 'failure_report_accident',       label: 'Failure to Report Accident' },
  { value: 'false_report_perjury',          label: 'False Report to Official / Perjury' },
  { value: 'failure_to_yield',              label: 'Failure to Yield' },
  { value: 'flee_elude_police',             label: 'Flee or Elude Police' },
  { value: 'following_too_close',           label: 'Following Too Close' },
  { value: 'homicide_assault_vehicle',       label: 'Homicide or Assault with Vehicle' },
  { value: 'improper_backing',              label: 'Improper Backing' },
  { value: 'improper_passing',              label: 'Improper Passing' },
  { value: 'improper_turn',                 label: 'Improper Turn / U-Turn' },
  { value: 'license_credentials_violation', label: 'License or Credentials Violation' },
  { value: 'leaving_scene',                 label: 'Leaving the Scene' },
  { value: 'minor_moving_violation',        label: 'Minor Moving Violations' },
  { value: 'open_bottle_container',         label: 'Open Bottle or Container' },
  { value: 'operate_without_consent',       label: "Operate without Owner's Consent" },
  { value: 'passing_school_bus',            label: 'Passing School Bus' },
  { value: 'reckless',                      label: 'Reckless Driving' },
  { value: 'refusal_to_test',               label: 'Refusal to Test' },
  { value: 'safety_violation',              label: 'Safety Violation' },
  { value: 'speeding_15_or_less',           label: 'Speeding – 15 MPH or Less' },
  { value: 'speeding_16_or_more',           label: 'Speeding – 16 MPH or Greater' },
  { value: 'wrong_side_road',               label: 'Wrong Side of Road' },
  { value: 'other',                         label: 'Other moving violation' },
];

// ── Accident types (Common Incidents + Claims categories) ──────────────────────
export const ACCIDENT_TYPES = [
  { value: 'at_fault_collision',     label: 'Accident – At Fault' },
  { value: 'not_at_fault_collision', label: 'Accident – Not At Fault' },
  { value: 'weather',                label: 'Acts of Nature / Weather Related' },
  { value: 'glass',                  label: 'Glass Only or Windshield Damage' },
  { value: 'hit_animal',             label: 'Hit an Animal' },
  { value: 'object_fell',            label: 'Object Fell on Vehicle (Not Weather Related)' },
  { value: 'theft_vandalism_fire',   label: 'Theft / Vandalism / Fire' },
  { value: 'pothole',                label: 'Damage From Pothole' },
  { value: 'comp_under1k',           label: 'Comprehensive Claim – Under $1,000' },
  { value: 'comp_over1k',            label: 'Comprehensive Claim – $1,000 or More' },
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
  { id: 'dateOfBirth', type: 'date', label: 'Date of Birth', helpText: 'Format: MM/DD/YYYY', required: true, max: new Date().toISOString().slice(0, 10) },
  {
    id: 'gender', type: 'radio', label: 'Gender', required: true,
    helpText: 'Most carriers use this as a rating factor',
    options: [
      { value: 'male',   label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'x',      label: 'Non-binary / X' },
    ],
  },
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
  { id: 'address', type: 'text', labelKey: 'contact.address', label: 'Street Address', placeholder: '123 Main St', required: true },
  {
    id: 'cityStateGrid', type: '_grid',
    fields: [
      { id: 'city',    type: 'text',   labelKey: 'contact.city', label: 'City', placeholder: 'Hollywood', required: true },
      { id: 'state',   type: 'select', label: 'State',    placeholder: '— State —', required: true },
    ],
  },
  { id: 'zipCode', type: 'text', label: 'ZIP Code', placeholder: '33021', required: true },
  {
    id: 'yearsAtAddress', type: 'select', label: 'How long have you lived at this address?', required: true,
    options: [
      { value: 'under1', label: 'Less than 1 year' },
      { value: '1to2',   label: '1–2 years' },
      { value: '3to5',   label: '3–5 years' },
      { value: 'over5',  label: 'More than 5 years' },
    ],
  },
  { id: 'priorAddress', type: 'text', label: 'Prior Street Address', placeholder: '123 Main St', required: true, showWhen: { field: 'yearsAtAddress', includesInSet: ['under1', '1to2'] } },
  {
    id: 'priorCityStateGrid', type: '_grid', showWhen: { field: 'yearsAtAddress', includesInSet: ['under1', '1to2'] },
    fields: [
      { id: 'priorCity',  type: 'text',   label: 'Prior City',  placeholder: 'Hollywood', required: true },
      { id: 'priorState', type: 'select', label: 'Prior State', placeholder: '— State —', required: true },
    ],
  },
  { id: 'priorZipCode', type: 'text', label: 'Prior ZIP Code', placeholder: '33021', required: true, showWhen: { field: 'yearsAtAddress', includesInSet: ['under1', '1to2'] } },
  {
    id: 'homeownerStatus', type: 'radio', labelKey: 'contact.homeownerStatus', label: 'Do you own or rent your home?',
    helpTextKey: 'contact.homeownerHint', helpText: 'Bundling home + auto can save you up to 15%',
    options: [
      { value: 'own',   labelKey: 'contact.own',   label: '🏠 Own' },
      { value: 'rent',  labelKey: 'contact.rent',  label: '🏢 Rent' },
      { value: 'other', labelKey: 'contact.other', label: 'Other' },
    ],
  },
  {
    id: 'occupation', type: 'select', label: 'Occupation', required: true,
    options: [
      { value: 'accountant',        label: 'Accountant / CPA'                         },
      { value: 'attorney',          label: 'Attorney / Lawyer'                         },
      { value: 'business_owner',    label: 'Business Owner'                            },
      { value: 'construction',      label: 'Construction Worker'                       },
      { value: 'customer_service',  label: 'Customer Service'                          },
      { value: 'delivery_driver',   label: 'Delivery Driver'                           },
      { value: 'doctor',            label: 'Doctor / Physician'                        },
      { value: 'commercial_driver', label: 'Driver (Truck / Commercial)'               },
      { value: 'engineer',          label: 'Engineer'                                  },
      { value: 'farmer',            label: 'Farmer / Agricultural Worker'              },
      { value: 'financial_advisor', label: 'Financial Advisor'                         },
      { value: 'firefighter',       label: 'Firefighter'                               },
      { value: 'government',        label: 'Government Employee'                       },
      { value: 'homemaker',         label: 'Homemaker'                                 },
      { value: 'it',                label: 'IT / Technology Professional'              },
      { value: 'insurance',         label: 'Insurance Professional'                    },
      { value: 'manager',           label: 'Manager / Supervisor'                      },
      { value: 'marketing_sales',   label: 'Marketing / Sales'                         },
      { value: 'military',          label: 'Military / Veteran'                        },
      { value: 'nurse',             label: 'Nurse / Healthcare Worker'                 },
      { value: 'office',            label: 'Office / Administrative Staff'             },
      { value: 'law_enforcement',   label: 'Police / Law Enforcement'                  },
      { value: 'real_estate',       label: 'Real Estate Agent'                         },
      { value: 'retiree',           label: 'Retired'                                   },
      { value: 'self_employed',     label: 'Self-Employed / Freelancer'                },
      { value: 'student',           label: 'Student'                                   },
      { value: 'teacher',           label: 'Teacher / Educator'                        },
      { value: 'tradesperson',      label: 'Tradesperson (Electrician / Plumber / HVAC)'},
      { value: 'warehouse',         label: 'Warehouse / Logistics Worker'              },
      { value: 'other',             label: 'Other'                                     },
    ],
  },
  {
    id: 'industry', type: 'select', label: 'Industry', required: true,
    options: [
      { value: 'agriculture_forestry_fishing', label: 'Agriculture / Forestry / Fishing'         },
      { value: 'art_design_media',             label: 'Art / Design / Media'                     },
      { value: 'banking_finance_real_estate',  label: 'Banking / Finance / Real Estate'          },
      { value: 'business_sales_office',        label: 'Business / Sales / Office'                },
      { value: 'construction_energy_trades',   label: 'Construction / Energy Trades'             },
      { value: 'education_library',            label: 'Education / Library'                      },
      { value: 'engineer_architect_science',   label: 'Engineer / Architect / Science / Math'    },
      { value: 'government',                   label: 'Government / Public Administration'       },
      { value: 'healthcare_medical',           label: 'Healthcare / Medical'                     },
      { value: 'hospitality_food_service',     label: 'Hospitality / Food Service'               },
      { value: 'legal',                        label: 'Legal'                                    },
      { value: 'manufacturing_production',     label: 'Manufacturing / Production'               },
      { value: 'military',                     label: 'Military'                                 },
      { value: 'personal_care_service',        label: 'Personal Care / Service'                  },
      { value: 'protective_service',           label: 'Protective Service (Police / Fire / Security)' },
      { value: 'retail',                       label: 'Retail'                                   },
      { value: 'technology_it',                label: 'Technology / IT'                          },
      { value: 'transportation_logistics',     label: 'Transportation / Logistics'               },
      { value: 'retired',                      label: 'Retired'                                  },
      { value: 'disabled',                     label: 'Disabled'                                 },
      { value: 'unemployed',                   label: 'Unemployed'                               },
      { value: 'student',                      label: 'Student'                                  },
      { value: 'homemaker',                    label: 'Homemaker'                                },
      { value: 'other',                        label: 'Other'                                    },
    ],
  },
  {
    id: 'militaryStatus', type: 'radio', label: 'Are you active military, active duty, or have you ever served in the military?', required: true,
    helpText: 'Many carriers offer a military discount.',
    options: [
      { value: 'active_duty',   label: 'Active Duty'              },
      { value: 'reserve_guard', label: 'Reserve / National Guard' },
      { value: 'veteran',       label: 'Veteran (previously served)' },
      { value: 'none',          label: 'Never served'             },
    ],
  },
  {
    id: 'education', type: 'select', label: 'Highest Level of Education', required: true,
    helpText: 'Many carriers offer a discount based on education',
    options: [
      { value: 'no_hs',       label: 'No high school diploma'        },
      { value: 'hs',          label: 'High school diploma / GED'     },
      { value: 'some_college',label: 'Some college (no degree)'      },
      { value: 'associate',   label: "Associate degree"              },
      { value: 'bachelors',   label: "Bachelor's degree"             },
      { value: 'masters',     label: "Master's degree"               },
      { value: 'doctorate',   label: 'Doctorate / Professional degree'},
    ],
  },
  {
    id: 'preferredContact', type: 'radio', label: 'How would you prefer we reach you?',
    options: [
      { value: 'call',     label: '📞 Phone call' },
      { value: 'text',     label: '💬 Text' },
      { value: 'whatsapp', label: '🟢 WhatsApp' },
      { value: 'email',    label: '✉️ Email' },
    ],
  },
  {
    id: 'bestTimeToContact', type: 'select', label: 'Best time to reach you',
    options: [
      { value: 'morning',   label: 'Morning (8am – 12pm)'   },
      { value: 'afternoon', label: 'Afternoon (12pm – 5pm)' },
      { value: 'evening',   label: 'Evening (5pm – 8pm)'    },
      { value: 'anytime',   label: 'Anytime'                },
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
    id: 'paymentPreference', type: 'radio', label: 'How would you like to pay?',
    helpText: 'Paying in full or enrolling in autopay usually lowers your premium',
    options: [
      { value: 'full',            label: 'Pay in full'          },
      { value: 'monthly_autopay', label: 'Monthly — autopay'    },
      { value: 'monthly_manual',  label: 'Monthly — pay manually' },
      { value: 'unsure',          label: 'Not sure yet'         },
    ],
  },
  {
    id: 'paperless', type: 'radio', label: 'Interested in paperless documents?',
    helpText: 'Most carriers give a small discount for going paperless',
    options: YES_NO,
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
