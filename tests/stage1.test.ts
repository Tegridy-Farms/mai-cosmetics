/**
 * Stage 1 - Structural/file-content tests (TDD - written BEFORE implementation)
 * These tests verify the scaffolding and configuration are correct.
 */

import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');

// ─── Helper ────────────────────────────────────────────────────────────────
function readFile(relPath: string): string {
  return fs.readFileSync(path.join(root, relPath), 'utf-8');
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(root, relPath));
}

// ─── 1. src/types/index.ts exports all required types ──────────────────────
describe('src/types/index.ts', () => {
  it('file exists', () => {
    expect(fileExists('src/types/index.ts')).toBe(true);
  });

  it('exports ServiceType interface', () => {
    // Import check via dynamic require (ts-jest compiles on the fly)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const types = require('../src/types/index');
    // Interfaces don't survive at runtime, but exported type-guard values
    // or constants would. Instead we verify the source contains the declaration.
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/interface\s+ServiceType|type\s+ServiceType/);
  });

  it('exports IncomeEntry interface', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/interface\s+IncomeEntry|type\s+IncomeEntry/);
  });

  it('exports ExpenseEntry interface', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/interface\s+ExpenseEntry|type\s+ExpenseEntry/);
  });

  it('ServiceType has id and name fields', () => {
    const src = readFile('src/types/index.ts');
    // Loose check: both fields should appear in the file
    expect(src).toMatch(/id[?]?\s*:/);
    expect(src).toMatch(/name[?]?\s*:/);
  });

  it('IncomeEntry has amount and date fields', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/amount[?]?\s*:/);
    expect(src).toMatch(/date[?]?\s*:/);
  });

  it('ExpenseEntry has category field', () => {
    const src = readFile('src/types/index.ts');
    expect(src).toMatch(/category[?]?\s*:/);
  });
});

// ─── 2. tailwind.config.ts has correct primary color ───────────────────────
describe('tailwind.config.ts', () => {
  it('file exists', () => {
    expect(fileExists('tailwind.config.ts')).toBe(true);
  });

  it('contains primary color #1A56DB', () => {
    const src = readFile('tailwind.config.ts');
    expect(src).toContain('#1A56DB');
  });

  it('contains primary dark color #1E429F', () => {
    const src = readFile('tailwind.config.ts');
    expect(src).toContain('#1E429F');
  });

  it('contains accent green #057A55', () => {
    const src = readFile('tailwind.config.ts');
    expect(src).toContain('#057A55');
  });

  it('contains accent red #C81E1E', () => {
    const src = readFile('tailwind.config.ts');
    expect(src).toContain('#C81E1E');
  });

  it('contains background color #F9FAFB', () => {
    const src = readFile('tailwind.config.ts');
    expect(src).toContain('#F9FAFB');
  });

  it('contains text primary color #111827', () => {
    const src = readFile('tailwind.config.ts');
    expect(src).toContain('#111827');
  });

  it('contains content glob for src/**', () => {
    const src = readFile('tailwind.config.ts');
    expect(src).toMatch(/['"]\.\/src\/\*\*\//);
  });
});

// ─── 3. Migration SQL files have correct CREATE TABLE statements ────────────
describe('migrations/001_create_service_types.sql', () => {
  it('file exists', () => {
    expect(fileExists('migrations/001_create_service_types.sql')).toBe(true);
  });

  it('contains CREATE TABLE service_types', () => {
    const sql = readFile('migrations/001_create_service_types.sql');
    expect(sql).toMatch(/CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?service_types/i);
  });

  it('has an id primary key column', () => {
    const sql = readFile('migrations/001_create_service_types.sql');
    expect(sql).toMatch(/id\s+\w.*PRIMARY\s+KEY/i);
  });

  it('has a name column', () => {
    const sql = readFile('migrations/001_create_service_types.sql');
    expect(sql).toMatch(/name\s+\w/i);
  });
});

describe('migrations/002_seed_service_types.sql', () => {
  it('file exists', () => {
    expect(fileExists('migrations/002_seed_service_types.sql')).toBe(true);
  });

  it('contains INSERT INTO service_types', () => {
    const sql = readFile('migrations/002_seed_service_types.sql');
    expect(sql).toMatch(/INSERT\s+INTO\s+service_types/i);
  });

  it('seeds Manicure', () => {
    const sql = readFile('migrations/002_seed_service_types.sql');
    expect(sql).toContain('Manicure');
  });

  it('seeds Gel Nails', () => {
    const sql = readFile('migrations/002_seed_service_types.sql');
    expect(sql).toContain('Gel Nails');
  });

  it('uses ON CONFLICT DO NOTHING', () => {
    const sql = readFile('migrations/002_seed_service_types.sql');
    expect(sql).toMatch(/ON\s+CONFLICT\s+DO\s+NOTHING/i);
  });

  it('seeds all 9 service types', () => {
    const sql = readFile('migrations/002_seed_service_types.sql');
    const expected = [
      'Manicure', 'Pedicure', 'Gel Nails', 'Acrylic Nails',
      'Nail Art', 'Eyebrow Shaping', 'Eyelash Treatment', 'Facial', 'Other',
    ];
    expected.forEach(name => expect(sql).toContain(name));
  });
});

describe('migrations/003_create_income_entries.sql', () => {
  it('file exists', () => {
    expect(fileExists('migrations/003_create_income_entries.sql')).toBe(true);
  });

  it('contains CREATE TABLE income_entries', () => {
    const sql = readFile('migrations/003_create_income_entries.sql');
    expect(sql).toMatch(/CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?income_entries/i);
  });

  it('has date column', () => {
    const sql = readFile('migrations/003_create_income_entries.sql');
    expect(sql).toMatch(/date\s+\w/i);
  });

  it('has amount column', () => {
    const sql = readFile('migrations/003_create_income_entries.sql');
    expect(sql).toMatch(/amount\s+\w/i);
  });

  it('references service_types', () => {
    const sql = readFile('migrations/003_create_income_entries.sql');
    expect(sql).toMatch(/service_types/i);
  });
});

describe('migrations/004_create_expense_entries.sql', () => {
  it('file exists', () => {
    expect(fileExists('migrations/004_create_expense_entries.sql')).toBe(true);
  });

  it('contains CREATE TABLE expense_entries', () => {
    const sql = readFile('migrations/004_create_expense_entries.sql');
    expect(sql).toMatch(/CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?expense_entries/i);
  });

  it('has category column', () => {
    const sql = readFile('migrations/004_create_expense_entries.sql');
    expect(sql).toMatch(/category\s+\w/i);
  });

  it('has amount column', () => {
    const sql = readFile('migrations/004_create_expense_entries.sql');
    expect(sql).toMatch(/amount\s+\w/i);
  });
});

// ─── 4. .env.example exists and has DATABASE_URL= ──────────────────────────
describe('.env.example', () => {
  it('file exists', () => {
    expect(fileExists('.env.example')).toBe(true);
  });

  it('contains DATABASE_URL= line', () => {
    const content = readFile('.env.example');
    expect(content).toMatch(/^DATABASE_URL=/m);
  });

  it('does NOT contain real credentials (no real URL)', () => {
    const content = readFile('.env.example');
    // Should not contain actual postgres connection strings with passwords
    expect(content).not.toMatch(/postgres:\/\/\w+:\w+@/);
  });
});

// ─── 5. src/app/layout.tsx loads Inter and JetBrains Mono ──────────────────
describe('src/app/layout.tsx', () => {
  it('file exists', () => {
    expect(fileExists('src/app/layout.tsx')).toBe(true);
  });

  it('imports Inter from next/font/google', () => {
    const src = readFile('src/app/layout.tsx');
    expect(src).toMatch(/Inter/);
    expect(src).toMatch(/next\/font\/google/);
  });

  it('imports JetBrains_Mono from next/font/google', () => {
    const src = readFile('src/app/layout.tsx');
    expect(src).toMatch(/JetBrains_Mono/);
  });

  it('exports default RootLayout', () => {
    const src = readFile('src/app/layout.tsx');
    expect(src).toMatch(/export\s+default\s+function\s+RootLayout/);
  });
});

// ─── 6. src/app/page.tsx is the placeholder ────────────────────────────────
describe('src/app/page.tsx', () => {
  it('file exists', () => {
    expect(fileExists('src/app/page.tsx')).toBe(true);
  });

  it('renders Mai Cosmetics heading', () => {
    const src = readFile('src/app/page.tsx');
    expect(src).toContain('Mai Cosmetics');
  });
});

// ─── 7. next.config.mjs exists (Next.js 14 uses .mjs, not .ts) ────────────
describe('next.config.mjs', () => {
  it('file exists', () => {
    expect(fileExists('next.config.mjs')).toBe(true);
  });
});

// ─── 8. .gitignore covers critical paths ───────────────────────────────────
describe('.gitignore', () => {
  it('file exists', () => {
    expect(fileExists('.gitignore')).toBe(true);
  });

  it('ignores .env.local', () => {
    const content = readFile('.gitignore');
    expect(content).toMatch(/\.env\.local/);
  });

  it('ignores .next/', () => {
    const content = readFile('.gitignore');
    expect(content).toMatch(/\.next\//);
  });

  it('ignores node_modules/', () => {
    const content = readFile('.gitignore');
    expect(content).toMatch(/node_modules\//);
  });
});
