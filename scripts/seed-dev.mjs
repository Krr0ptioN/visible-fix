#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedFilePath = path.resolve(rootDir, 'scripts/mock-data/dev-seed.json');
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/visiblefix';

const seed = JSON.parse(readFileSync(seedFilePath, 'utf8'));

const toDbCoordinate = (value) => Math.round(Number(value) * 1_000_000);
const toDateOrNull = (value) => (value ? new Date(value) : null);

const sql = postgres(databaseUrl, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
});

const municipalityCodeToId = new Map();
for (const municipality of seed.municipalities) {
  municipalityCodeToId.set(municipality.code, municipality.id);
}

async function run() {
  const passwordHashByEmail = new Map();

  for (const user of seed.users) {
    passwordHashByEmail.set(user.email, await bcrypt.hash(user.password, 10));
  }

  await sql.begin(async (tx) => {
    for (const municipality of seed.municipalities) {
      await tx`
        insert into municipalities (id, name, code, region, province, population, active)
        values (
          ${municipality.id},
          ${municipality.name},
          ${municipality.code},
          ${municipality.region},
          ${municipality.province},
          ${municipality.population ?? null},
          ${municipality.active ?? true}
        )
        on conflict (id) do update set
          name = excluded.name,
          code = excluded.code,
          region = excluded.region,
          province = excluded.province,
          population = excluded.population,
          active = excluded.active
      `;
    }

    const userIdByEmail = new Map();
    for (const user of seed.users) {
      const municipalityId = user.municipalityCode
        ? municipalityCodeToId.get(user.municipalityCode) ?? null
        : null;

      const [savedUser] = await tx`
        insert into users (email, name, role, password_hash, municipality_id, is_active)
        values (
          ${user.email},
          ${user.name ?? null},
          ${user.role},
          ${passwordHashByEmail.get(user.email)},
          ${municipalityId},
          ${user.isActive ?? true}
        )
        on conflict (email) do update set
          name = excluded.name,
          role = excluded.role,
          password_hash = excluded.password_hash,
          municipality_id = excluded.municipality_id,
          is_active = excluded.is_active,
          updated_at = now()
        returning id, email
      `;
      userIdByEmail.set(savedUser.email, savedUser.id);
    }

    for (const issue of seed.issues) {
      const municipalityId = municipalityCodeToId.get(issue.municipalityCode) ?? 1;
      const reporterUserId = issue.reporterEmail ? userIdByEmail.get(issue.reporterEmail) ?? null : null;

      await tx`
        insert into issues (
          id,
          title,
          description,
          category,
          status,
          image_url,
          latitude,
          longitude,
          address,
          municipality_id,
          user_id,
          device_id,
          acknowledged_at,
          in_progress_at,
          resolved_at,
          rejected_at,
          reject_reason,
          created_at,
          updated_at
        )
        values (
          ${issue.id},
          ${issue.title},
          ${issue.description ?? null},
          ${issue.category},
          ${issue.status},
          ${issue.imageUrl ?? null},
          ${toDbCoordinate(issue.latitude)},
          ${toDbCoordinate(issue.longitude)},
          ${issue.address ?? null},
          ${municipalityId},
          ${reporterUserId},
          ${issue.deviceId},
          ${toDateOrNull(issue.acknowledgedAt)},
          ${toDateOrNull(issue.inProgressAt)},
          ${toDateOrNull(issue.resolvedAt)},
          ${toDateOrNull(issue.rejectedAt)},
          ${issue.rejectReason ?? null},
          ${toDateOrNull(issue.createdAt) ?? new Date()},
          now()
        )
        on conflict (id) do update set
          title = excluded.title,
          description = excluded.description,
          category = excluded.category,
          status = excluded.status,
          image_url = excluded.image_url,
          latitude = excluded.latitude,
          longitude = excluded.longitude,
          address = excluded.address,
          municipality_id = excluded.municipality_id,
          user_id = excluded.user_id,
          device_id = excluded.device_id,
          acknowledged_at = excluded.acknowledged_at,
          in_progress_at = excluded.in_progress_at,
          resolved_at = excluded.resolved_at,
          rejected_at = excluded.rejected_at,
          reject_reason = excluded.reject_reason,
          updated_at = now()
      `;
    }

    const seededIssueIds = seed.issues.map((issue) => issue.id);
    for (const issueId of seededIssueIds) {
      await tx`delete from upvotes where issue_id = ${issueId}`;
    }

    for (const upvote of seed.upvotes) {
      await tx`
        insert into upvotes (issue_id, device_id, created_at)
        values (${upvote.issueId}, ${upvote.deviceId}, ${toDateOrNull(upvote.createdAt) ?? new Date()})
        on conflict (issue_id, device_id) do nothing
      `;
    }

    await tx`
      select setval(
        pg_get_serial_sequence('municipalities', 'id'),
        coalesce((select max(id) from municipalities), 1),
        true
      )
    `;
    await tx`
      select setval(
        pg_get_serial_sequence('users', 'id'),
        coalesce((select max(id) from users), 1),
        true
      )
    `;
    await tx`
      select setval(
        pg_get_serial_sequence('issues', 'id'),
        coalesce((select max(id) from issues), 1),
        true
      )
    `;
    await tx`
      select setval(
        pg_get_serial_sequence('upvotes', 'id'),
        coalesce((select max(id) from upvotes), 1),
        true
      )
    `;
  });

  const [issueCountRow] = await sql`select count(*)::int as total from issues`;
  const [upvoteCountRow] = await sql`select count(*)::int as total from upvotes`;
  const [userCountRow] = await sql`select count(*)::int as total from users`;

  console.log('[db:seed:dev] completed');
  console.log(`[db:seed:dev] users=${userCountRow.total} issues=${issueCountRow.total} upvotes=${upvoteCountRow.total}`);
}

run()
  .catch((error) => {
    console.error('[db:seed:dev] failed');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end({ timeout: 5 });
  });
