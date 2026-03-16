import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..');

function readFile(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

// ── Migration files ────────────────────────────────────────────────────────

describe('migrations/001_create_service_types.sql', () => {
  const sql = readFile('migrations/001_create_service_types.sql');
  it('file exists', () => expect(fileExists('migrations/001_create_service_types.sql')).toBe(true));
  it('creates service_types table', () => expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS service_types/i));
  it('has id SERIAL PRIMARY KEY', () => expect(sql).toMatch(/id\s+SERIAL\s+PRIMARY KEY/i));
  it('has name VARCHAR(100) NOT NULL UNIQUE', () => expect(sql).toMatch(/name\s+VARCHAR\(100\)\s+NOT NULL\s+UNIQUE/i));
  it('has created_at TIMESTAMPTZ (or TIMESTAMP WITH TIME ZONE)', () =>
    expect(sql).toMatch(/created_at\s+(TIMESTAMPTZ|TIMESTAMP WITH TIME ZONE)/i));
});

describe('migrations/002_seed_service_types.sql', () => {
  const sql = readFile('migrations/002_seed_service_types.sql');
  it('file exists', () => expect(fileExists('migrations/002_seed_service_types.sql')).toBe(true));
  it('inserts Manicure', () => expect(sql).toMatch(/Manicure/));
  it('inserts Pedicure', () => expect(sql).toMatch(/Pedicure/));
  it('inserts Gel Nails', () => expect(sql).toMatch(/Gel Nails/));
  it('inserts Acrylic Nails', () => expect(sql).toMatch(/Acrylic Nails/));
  it('inserts Nail Art', () => expect(sql).toMatch(/Nail Art/));
  it('inserts Eyebrow Shaping', () => expect(sql).toMatch(/Eyebrow Shaping/));
  it('inserts Eyelash Treatment', () => expect(sql).toMatch(/Eyelash Treatment/));
  it('inserts Facial', () => expect(sql).toMatch(/Facial/));
  it('inserts Other', () => expect(sql).toMatch(/Other/));
  it('uses ON CONFLICT DO NOTHING or similar idempotent insert', () =>
    expect(sql).toMatch(/ON CONFLICT|INSERT INTO service_types/i));
});

describe('migrations/003_create_income_entries.sql', () => {
  const sql = readFile('migrations/003_create_income_entries.sql');
  it('file exists', () => expect(fileExists('migrations/003_create_income_entries.sql')).toBe(true));
  it('creates income_entries table', () => expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS income_entries/i));
  it('has id SERIAL PRIMARY KEY', () => expect(sql).toMatch(/id\s+SERIAL\s+PRIMARY KEY/i));
  it('has service_name VARCHAR(255) NOT NULL', () => expect(sql).toMatch(/service_name\s+VARCHAR\(255\)\s+NOT NULL/i));
  it('has service_type_id INTEGER NOT NULL', () => expect(sql).toMatch(/service_type_id\s+INTEGER\s+NOT NULL/i));
  it('has FK reference to service_types', () => expect(sql).toMatch(/REFERENCES service_types\(id\)/i));
  it('service_type_id is NOT nullable (no ON DELETE SET NULL)', () =>
    expect(sql).not.toMatch(/ON DELETE SET NULL/i));
  it('has date DATE NOT NULL', () => expect(sql).toMatch(/date\s+DATE\s+NOT NULL/i));
  it('has duration_minutes INTEGER NOT NULL', () => expect(sql).toMatch(/duration_minutes\s+INTEGER\s+NOT NULL/i));
  it('has CHECK (duration_minutes > 0)', () => expect(sql).toMatch(/CHECK\s*\(\s*duration_minutes\s*>\s*0\s*\)/i));
  it('has amount NUMERIC(10,2) NOT NULL', () => expect(sql).toMatch(/amount\s+NUMERIC\(10,2\)\s+NOT NULL/i));
  it('has CHECK (amount > 0)', () => expect(sql).toMatch(/CHECK\s*\(\s*amount\s*>\s*0\s*\)/i));
  it('has index on date', () => expect(sql).toMatch(/CREATE INDEX.*income_entries.*date/i));
  it('has index on service_type_id', () => expect(sql).toMatch(/CREATE INDEX.*income_entries.*service_type/i));
});

describe('migrations/004_create_expense_entries.sql', () => {
  const sql = readFile('migrations/004_create_expense_entries.sql');
  it('file exists', () => expect(fileExists('migrations/004_create_expense_entries.sql')).toBe(true));
  it('creates expense_entries table', () => expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS expense_entries/i));
  it('has id SERIAL PRIMARY KEY', () => expect(sql).toMatch(/id\s+SERIAL\s+PRIMARY KEY/i));
  it('has description VARCHAR(255) NOT NULL', () => expect(sql).toMatch(/description\s+VARCHAR\(255\)\s+NOT NULL/i));
  it('has category VARCHAR(50) NOT NULL', () => expect(sql).toMatch(/category\s+VARCHAR\(50\)\s+NOT NULL/i));
  it('has CHECK constraint with equipment', () => expect(sql).toMatch(/CHECK.*equipment/i));
  it('has CHECK constraint with materials', () => expect(sql).toMatch(/CHECK.*materials/i));
  it('has CHECK constraint with consumables', () => expect(sql).toMatch(/CHECK.*consumables/i));
  it('has CHECK constraint with other', () => expect(sql).toMatch(/CHECK.*other/i));
  it('has date DATE NOT NULL', () => expect(sql).toMatch(/date\s+DATE\s+NOT NULL/i));
  it('has amount NUMERIC(10,2) NOT NULL', () => expect(sql).toMatch(/amount\s+NUMERIC\(10,2\)\s+NOT NULL/i));
  it('has CHECK (amount > 0)', () => expect(sql).toMatch(/CHECK\s*\(\s*amount\s*>\s*0\s*\)/i));
  it('has index on date', () => expect(sql).toMatch(/CREATE INDEX.*expense_entries.*date/i));
  it('has index on category', () => expect(sql).toMatch(/CREATE INDEX.*expense_entries.*category/i));
});

// ── TypeScript types ───────────────────────────────────────────────────────

describe('src/types/index.ts', () => {
  it('file exists', () => expect(fileExists('src/types/index.ts')).toBe(true));

  it('exports ServiceType with id and name', async () => {
    const types = await import(path.join(ROOT, 'src/types/index'));
    expect(types).toBeDefined();
    // Check by inspecting the source for required field names
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/interface ServiceType/);
    expect(src).toMatch(/id:\s*number/);
    expect(src).toMatch(/name:\s*string/);
  });

  it('IncomeEntry has service_name: string', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/interface IncomeEntry/);
    expect(src).toMatch(/service_name:\s*string/);
  });

  it('IncomeEntry has duration_minutes: number', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/duration_minutes:\s*number/);
  });

  it('IncomeEntry has service_type_id: number', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/service_type_id:\s*number/);
  });

  it('IncomeEntry has amount: number', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/amount:\s*number/);
  });

  it('ExpenseEntry has description: string', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/interface ExpenseEntry/);
    expect(src).toMatch(/description:\s*string/);
  });

  it("ExpenseEntry has category union type with 'equipment'", () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/equipment/);
  });

  it("ExpenseEntry has category union type with 'materials'", () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/materials/);
  });

  it("ExpenseEntry has category union type with 'consumables'", () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/consumables/);
  });

  it('exports DashboardMetrics', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/interface DashboardMetrics/);
    expect(src).toMatch(/gross_income:\s*number/);
    expect(src).toMatch(/total_expenses:\s*number/);
    expect(src).toMatch(/net_income:\s*number/);
    expect(src).toMatch(/net_per_hour:\s*number/);
  });

  it('exports MonthlyTrend', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/interface MonthlyTrend/);
    expect(src).toMatch(/month:\s*string/);
    expect(src).toMatch(/gross:\s*number/);
    expect(src).toMatch(/expenses:\s*number/);
  });

  it('exports FilterState', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/interface FilterState/);
    expect(src).toMatch(/date_from/);
    expect(src).toMatch(/date_to/);
  });

  it('exports PaginatedResponse', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/interface PaginatedResponse/);
    expect(src).toMatch(/total:\s*number/);
    expect(src).toMatch(/page:\s*number/);
    expect(src).toMatch(/pageSize:\s*number/);
  });
});

// ── src/lib/db.ts ──────────────────────────────────────────────────────────

describe('src/lib/db.ts', () => {
  it('file exists', () => expect(fileExists('src/lib/db.ts')).toBe(true));
  it('exports sql from @vercel/postgres', () => {
    const src = readFile('src/lib/db.ts');
    expect(src).toMatch(/@vercel\/postgres/);
    expect(src).toMatch(/export.*sql/);
  });
  it('exports a query helper function', () => {
    const src = readFile('src/lib/db.ts');
    expect(src).toMatch(/export.*async function query/);
  });
  it('query helper returns Promise of rows', () => {
    const src = readFile('src/lib/db.ts');
    expect(src).toMatch(/result\.rows/);
  });
});

// ── Config files ──────────────────────────────────────────────────────────

describe('.env.example', () => {
  it('file exists', () => expect(fileExists('.env.example')).toBe(true));
  it('contains DATABASE_URL= line', () => {
    const content = readFile('.env.example');
    expect(content).toMatch(/DATABASE_URL=/);
  });
  it('does not contain a real credential', () => {
    const content = readFile('.env.example');
    expect(content).not.toMatch(/DATABASE_URL=.+/);
  });
});

describe('migrate.sh', () => {
  it('file exists', () => expect(fileExists('migrate.sh')).toBe(true));
  it('is executable', () => {
    const stats = fs.statSync(path.join(ROOT, 'migrate.sh'));
    // Check user execute bit
    expect(stats.mode & 0o100).toBeTruthy();
  });
  it('runs psql with $DATABASE_URL', () => {
    const content = readFile('migrate.sh');
    expect(content).toMatch(/psql.*DATABASE_URL/);
  });
  it('loops over migrations/*.sql files', () => {
    const content = readFile('migrate.sh');
    expect(content).toMatch(/migrations\/\*\.sql/);
  });
});

describe('tailwind.config.ts', () => {
  const src = readFile('tailwind.config.ts');
  it('file exists', () => expect(fileExists('tailwind.config.ts')).toBe(true));
  it('has primary color #1A56DB', () => expect(src).toMatch(/#1A56DB/i));
  it('has primary dark #1E429F', () => expect(src).toMatch(/#1E429F/i));
  it('has accent green #057A55', () => expect(src).toMatch(/#057A55/i));
  it('has accent red #C81E1E', () => expect(src).toMatch(/#C81E1E/i));
  it('has chart blue #3F83F8', () => expect(src).toMatch(/#3F83F8/i));
  it('has chart slate #9CA3AF', () => expect(src).toMatch(/#9CA3AF/i));
  it('has chart green #31C48D', () => expect(src).toMatch(/#31C48D/i));
  it('has background #F9FAFB', () => expect(src).toMatch(/#F9FAFB/i));
  it('has border #E5E7EB', () => expect(src).toMatch(/#E5E7EB/i));
  it('has text primary #111827', () => expect(src).toMatch(/#111827/i));
  it('has text muted #6B7280', () => expect(src).toMatch(/#6B7280/i));
  it('has focus ring #3F83F8', () => expect(src).toMatch(/#3F83F8/i));
  it('has custom font family heebo', () => expect(src).toMatch(/heebo/i));
  it('has custom font family mono', () => expect(src).toMatch(/mono/i));
});

describe('src/app/layout.tsx', () => {
  const src = readFile('src/app/layout.tsx');
  it('file exists', () => expect(fileExists('src/app/layout.tsx')).toBe(true));
  it('imports from next/font/google', () => expect(src).toMatch(/from ['"]next\/font\/google['"]/));
  it('loads Heebo font', () => expect(src).toMatch(/Heebo/));
  it('loads JetBrains_Mono font', () => expect(src).toMatch(/JetBrains_Mono|JetBrainsMono/));
});

describe('next.config', () => {
  it('next.config.ts or next.config.mjs exists', () => {
    const hasMjs = fileExists('next.config.mjs');
    const hasTs = fileExists('next.config.ts');
    expect(hasMjs || hasTs).toBe(true);
  });
});

describe('tsconfig.json', () => {
  it('file exists', () => expect(fileExists('tsconfig.json')).toBe(true));
  it('has strict mode', () => {
    const content = readFile('tsconfig.json');
    expect(content).toMatch(/"strict"\s*:\s*true/);
  });
  it('has path alias @/*', () => {
    const content = readFile('tsconfig.json');
    expect(content).toMatch(/@\/\*/);
  });
});

describe('package.json', () => {
  it('file exists', () => expect(fileExists('package.json')).toBe(true));
  it('has next ^14', () => {
    const pkg = JSON.parse(readFile('package.json'));
    expect(pkg.dependencies?.next ?? '').toMatch(/\^14/);
  });
  it('has @vercel/postgres dependency', () => {
    const pkg = JSON.parse(readFile('package.json'));
    expect(pkg.dependencies?.['@vercel/postgres']).toBeDefined();
  });
  it('has zod dependency', () => {
    const pkg = JSON.parse(readFile('package.json'));
    expect(pkg.dependencies?.zod).toBeDefined();
  });
  it('has recharts dependency', () => {
    const pkg = JSON.parse(readFile('package.json'));
    expect(pkg.dependencies?.recharts).toBeDefined();
  });
  it('has jest devDependency', () => {
    const pkg = JSON.parse(readFile('package.json'));
    expect(pkg.devDependencies?.jest ?? pkg.dependencies?.jest).toBeDefined();
  });
  it('has test script', () => {
    const pkg = JSON.parse(readFile('package.json'));
    expect(pkg.scripts?.test).toBeDefined();
  });
  it('has build script', () => {
    const pkg = JSON.parse(readFile('package.json'));
    expect(pkg.scripts?.build).toBeDefined();
  });
});
