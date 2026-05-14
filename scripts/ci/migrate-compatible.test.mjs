import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyStatement, isStatementAllowedForMode } from './migrate-compatible.mjs';

test('classifies additive migration statements as expand-safe', () => {
  for (const statement of [
    'CREATE TABLE "users" ("id" serial PRIMARY KEY NOT NULL)',
    'CREATE TYPE "public"."issue_status" AS ENUM(\'reported\')',
    'CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email")',
    'ALTER TABLE "users" ADD COLUMN "display_name" text',
    'ALTER TYPE "issue_status" ADD VALUE \'archived\'',
  ]) {
    const result = classifyStatement(statement);
    assert.equal(result.compatibility, 'expand');
    assert.equal(isStatementAllowedForMode(result, 'expand'), true);
  }
});

test('classifies destructive migration statements as contract-only', () => {
  for (const statement of [
    'DROP TABLE "users"',
    'ALTER TABLE "users" DROP COLUMN "name"',
    'ALTER TABLE "users" RENAME COLUMN "name" TO "display_name"',
    'ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL',
    'ALTER TABLE "users" ALTER COLUMN "name" TYPE varchar(255)',
    'DROP INDEX "users_email_unique"',
  ]) {
    const result = classifyStatement(statement);
    assert.equal(result.compatibility, 'contract');
    assert.equal(isStatementAllowedForMode(result, 'expand'), false);
    assert.equal(isStatementAllowedForMode(result, 'contract'), true);
  }
});

test('classifies unknown statements as manual-review only', () => {
  const result = classifyStatement('UPDATE users SET name = trim(name)');

  assert.equal(result.compatibility, 'manual');
  assert.equal(isStatementAllowedForMode(result, 'expand'), false);
  assert.equal(isStatementAllowedForMode(result, 'contract'), false);
});

test('does not allow annotations to downgrade destructive statements to expand-safe', () => {
  const result = classifyStatement('-- visiblefix:migration-compatible expand\nDROP TABLE "users"');

  assert.equal(result.compatibility, 'contract');
  assert.equal(isStatementAllowedForMode(result, 'expand'), false);
});
