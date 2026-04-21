# Open Source Platform Evaluation for VisibleFix

## Executive Summary

This report evaluates five categories of open source candidates for potential reuse/integration into the VisibleFix civic tech platform:

1. Specifically named projects (immch, sclable)
2. Civic tech issue reporting platforms
3. Next.js starter templates
4. NestJS backend patterns

**Key Finding:** Neither "immch" nor "sclable" exist as civic tech projects. The searches likely encountered unrelated projects or potential misspellings. However, substantial open source civic tech infrastructure and modern full-stack templates exist that can accelerate VisibleFix development.

---

## 1. Specifically Named Projects

### 1.1 immch

**Finding:** Does NOT exist as a civic tech project.

The closest match is **Immich** (immich.app) — an open-source self-hosted photo/video backup solution, similar to Google Photos. This is entirely unrelated to civic issue reporting.

**Recommendation:** No action needed. This name appears to be a misunderstanding.

---

### 1.2 sclable

**Finding:** Does NOT exist as an open source civic tech platform.

"sclable" refers to sclable.com, a Vienna-based commercial consulting company specializing in AI and workflow automation. It is not an open source project.

**Note:** You may be thinking of **"scalable"** as a descriptor, or another project name. Please clarify if you have additional context.

**Recommendation:** No action needed. This appears to be a commercial entity or misspelling.

---

## 2. Civic Tech Issue Reporting Platforms (Reference)

### 2.1 FixMyStreet (mySociety)

| Attribute | Details |
|-----------|---------|
| **URL** | https://github.com/mysociety/fixmystreet |
| **Stars** | 582 |
| **License** | GPL-2.0 |
| **Tech Stack** | Perl (68.5%), PostgreSQL |
| **Last Release** | v6.0 (November 2024) |
| **Commits** | 16,026 (very active) |

**Features:**
- Map-based problem reporting (pins on map)
- Automatic authority routing (Open311 integration)
- Email/web service report forwarding
- Status updates visible to public
- Email/RSS subscriptions for area alerts
- International deployments (UK, Sweden, Switzerland, USA)

**Compatibility Assessment:**
- ❌ **NOT Compatible** — Perl/PostgreSQL stack incompatible with VisibleFix's Next.js/NestJS/TypeScript/Drizzle architecture
- ✅ **valuable as REFERENCE** — Best-in-class UX patterns for civic issue reporting
- The "pin-drop" workflow, category selection, and status visibility are directly applicable

**Integration Effort:** N/A (architecture incompatible)

**Recommendation:** STUDY ONLY. Extract UX patterns but do not attempt integration.

---

### 2.2 Decidim

| Attribute | Details |
|-----------|---------|
| **Type** | Participatory Democracy Platform |
| **License** | AGPL-3.0 (Copyleft) |
| **Tech Stack** | Ruby on Rails, PostgreSQL |
| **Deployments** | Barcelona, Madrid, Helsinki, 150+ cities |

**Features:**
- Citizen proposals
- Participatory budgeting
- Public consultations
- Comments and debates
- Geolocated proposals

**Compatibility:** ❌ Ruby/RoRS incompatible

---

### 2.3 Mark-a-Spot

| Attribute | Details |
|-----------|---------|
| **Type** | Digital engagement + case management |
| **License** | MIT |
| **Tech Stack** | PHP/Symfony, PostgreSQL |
| **Focus** | Municipal infrastructure, waste management |

**Features:**
- Geolocated reporting with photos
- Case management workflow
- Integration with backend systems

**Compatibility:** ❌ PHP/Symfony incompatible

---

### 2.4 Signalen (Dutch Municipalities)

| Attribute | Details |
|-----------|---------|
| **Type** | 311-style reporting suite |
| **License** | MPL-2.0 |
| **Tech Stack** | Python/Django, PostgreSQL |

**Compatibility:** ❌ Python incompatible

---

## 3. Open Source Next.js Templates with Auth/DB/CRUD

### 3.1 T3 Stack (create-t3-app)

| Attribute | Details |
|-----------|---------|
| **URL** | https://github.com/t3-oss/create-t3-app |
| **Stars** | 28.7k |
| **License** | MIT |
| **Last Updated** | December 2025 |

**Tech Stack:**
- Next.js (App Router)
- TypeScript
- tRPC (type-safe API)
- Prisma ORM
- NextAuth.js
- Tailwind CSS

**Features:**
- Full-stack TypeScript from tip to tail
- Type-safe API calls (tRPC)
- Authentication (NextAuth)
- Database access (Prisma)
- CRUD patterns built-in

**Compatibility with VisibleFix:**
- ✅ **HIGH** — Next.js frontend matches
- ⚠️ **MEDIUM** — Uses Prisma; VisibleFix uses Drizzle (both valid ORMs)
- ⚠️ **MEDIUM** — Uses tRPC; VisibleFix uses REST

**Integration Effort:** Medium (ORM swap from Prisma→Drizzle, API style change from tRPC→REST)

**Recommendation:** ⭐ **RECOMMENDED FOR REFERENCE**. The T3 stack demonstrates best practices for full-stack TypeScript. Extract patterns for:
- Folder structure
- Type definitions
- API error handling
- Authentication flows

---

### 3.2 Cal.com (Scheduling Infrastructure)

| Attribute | Details |
|-----------|---------|
| **URL** | https://github.com/calcom/cal.com |
| **Stars** | 41k |
| **License** | MIT |
| **Active** | Updated April 6, 2026 |

**Tech Stack:**
- Next.js 14+
- TypeScript
- Prisma
- PostgreSQL
- NextAuth.js
- tRPC
- Tailwind CSS

**Features:**
- Authentication system (booking auth flows)
- Database CRUD operations (events, bookings, users)
- Webhook integrations
- Stripe payment integration
- Organization/multi-tenant patterns

**Compatibility with VisibleFix:**
- ✅ **HIGH** — Next.js + TypeScript + PostgreSQL matches
- ⚠️ **MEDIUM** — Prisma vs Drizzle, tRPC vs REST

**Integration Effort:** Medium

**Recommendation:** ⭐ **HIGHLY RECOMMENDED**. Cal.com is a production-grade reference for:
- Organization/tenant patterns (relevant for multi-city support)
- Authentication flows
- Booking/status workflows (direct analogy to issue status tracking)
- Stripe integration patterns

---

### 3.3 Payload CMS

| Attribute | Details |
|-----------|---------|
| **URL** | https://github.com/payloadcms/payload |
| **Stars** | 41.6k |
| **License** | MIT |
| **Active** | Updated April 4, 2026 |

**Tech Stack:**
- Next.js (can be used as backend)
- TypeScript
- MongoDB / PostgreSQL
- Express (embedded)

**Features:**
- Headless CMS
- Admin panel (auto-generated)
- Custom endpoints
- Auth built-in
- Field-level validation

**Compatibility:**
- ⚠️ MEDIUM — Payload is a CMS; VisibleFix is a custom app

**Recommendation:** ⭐ **RECOMMENDED FOR ADMIN PANEL**. Payload can generate the VisibleFix admin dashboard in minutes.

**Integration Effort:** Low — Install Payload, define Issue collection, configure fields matching VisibleFix schema.

---

### 3.4 Refine (React Framework for Internal Tools)

| Attribute | Details |
|-----------|---------|
| **URL** | https://github.com/refinedev/refine |
| **Stars** | 34.4k |
| **License** | MIT |
| **Active** | Updated April 6, 2026 |

**Tech Stack:**
- React / Next.js
- TypeScript
- Multiple backend integrations (REST, GraphQL, custom)
- Ant Design / Material UI / Mantine

**Features:**
- Admin panel generation
- CRUD scaffolding
- Data provider abstraction
- Authentication
- Multi-tenant support

**Compatibility:**
- ⚠️ MEDIUM — Targets internal tools; VisibleFix is consumer-facing

**Recommendation:** ⭐ **RECOMMENDED FOR ADMIN PANEL**. Use Refine to rapidly generate the municipal dashboard.

---

## 4. NestJS Backend Patterns

### 4.1 NestJS Official Sample Applications

| URL | Description |
|-----|-------------|
| https://github.com/nestjs/typescript-starter | Official NestJS + TypeScript starter |
| https://github.com/nestjs/nest-starter | NestJS basic starter |
| https://github.com/nestjs/typeorm-starter | NestJS + TypeORM sample |

**Features demonstrated:**
- Module-based architecture
- TypeScript throughout
- Dependency injection
- Service/repository patterns
- Swagger/OpenAPI integration

**Compatibility:** ✅ FULLY COMPATIBLE

**Recommendation:** ⭐ **HIGHLY RECOMMENDED**. Use NestJS starters as structural reference:
- Module organization (issues, upvotes, admin modules)
- Service layer patterns
- Repository patterns

---

### 4.2 Awesome NestJS

Search "awesome nestjs" on GitHub for curated lists of:
- Authentication modules (Passport, JWT)
- Database integrations (TypeORM, Prisma, Sequelize)
- API documentation (Swagger)
- Testing utilities

**Recommendation:** Use as reference for selecting NestJS ecosystem libraries.

---

### 4.3 NestJS Drizzle Integration

| Project | URL | Notes |
|---------|-----|-------|
| nestjs-drizzle | https://github.com/nicokempe/nestjs-drizzle | Drizzle ORM integration for NestJS |
| Sample repos | Search "nestjs drizzle postgres" | Several community examples exist |

**Status:** ⚠️ EMERGING — Limited but growing community support. VisibleFix's Drizzle choice is modern and well-supported.

**Recommendation:** Build custom Drizzle repository layer following NestJS patterns (see Technical Architecture doc).

---

## 5. Recommendation Matrix

### 5.1 Final Rankings (Top 5 Candidates)

| Rank | Project | Category | Tech Compatibility | Feature Relevance | License | Recommendation |
|------|---------|----------|-------------------|-------------------|---------|----------------|
| 1 | **Cal.com** | Next.js Template | ⭐⭐⭐ High | ⭐⭐⭐ High | MIT | STUDY & REFERENCE |
| 2 | **T3 Stack** | Next.js Template | ⭐⭐⭐ High | ⭐⭐⭐ High | MIT | STUDY & REFERENCE |
| 3 | **Payload CMS** | Admin Panel | ⭐⭐⭐ High | ⭐⭐⭐ High | MIT | **INTEGRATE** (Admin) |
| 4 | **Refine** | Admin Panel | ⭐⭐ Medium | ⭐⭐⭐ High | MIT | **INTEGRATE** (Admin) |
| 5 | **FixMyStreet** | Civic Reference | ⭐ Low | ⭐⭐⭐ High | GPL-2.0 | STUDY UX ONLY |

### 5.2 Integration Recommendations

#### For Immediate Use:
1. **Admin Dashboard** → Use **Payload CMS** or **Refine**
   - Payload: Install, define Issue collection, auto-generate admin panel
   - Refine: Connect to NestJS API, scaffold CRUD views

2. **Backend Architecture** → Use **NestJS official starters**
   - Reference module structure (issues, upvotes, auth, admin)
   - Apply service/repository patterns

3. **Frontend Architecture** → Use **T3 Stack** patterns
   - Type definitions
   - Error handling
   - Folder structure

#### For Long-term Study:
1. **FixMyStreet** → Extract UX patterns only
   - Pin-drop map interface
   - Status update visibility
   - Email notification flows

2. **Cal.com** → Study booking→status workflow analogies
   - Organization/tenant management
   - Payment integration (future feature)

---

## 6. Additional Resources

### 6.1 Civic Tech Field Guide
- **URL:** https://civictech.guide/
- **Content:** 1,000+ civic tech tools categorized
- **Use:** Ongoing reference for features and competitors

### 6.2 Awesome Civic Tech (GitHub)
- **URL:** https://github.com/brandonhimpfen/awesome-civic-tech
- **Content:** Curated list of civic tech projects
- **Use:** Discovery tool for specific features

### 6.3 Open311 Standard
- **URL:** https://open311.org/
- **Content:** Open standard for civic issue tracking
- **Use:** Future API interoperability with city systems

---

## 7. Conclusion

**Key Takeaways:**

1. The specifically-named projects (immch, sclable) do not exist in civic tech — treat as non-factors.

2. **FixMyStreet** is the most mature civic platform but uses incompatible tech (Perl). Study its UX, do not integrate.

3. **T3 Stack** and **Cal.com** are the best contemporary full-stack references. Both use the same TypeScript-first approach as VisibleFix.

4. For the admin dashboard, **Payload CMS** offers the fastest path to production (minutes to install, hours to configure).

5. The VisibleFix architecture (Next.js + NestJS + Drizzle + PostgreSQL) is sound and well-supported by the ecosystem.

**Recommended Next Steps:**
- [ ] Install Payload CMS for admin panel prototype
- [ ] Clone Cal.com for UX pattern reference
- [ ] Review NestJS starters for backend structure
- [ ] Bookmark civictech.guide for ongoing research

---

*Report generated: April 6, 2026*
*VisibleFix Platform Evaluation*
