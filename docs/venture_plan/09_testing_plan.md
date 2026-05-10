# DELIVERABLE 9 — Testing Plan

## Test Strategy Overview

### Testing Philosophy
- **Quality over quantity:** Fewer comprehensive tests beat many shallow ones
- **Critical path focus:** Test what matters most to users
- **Automation-first:** CI gates catch regressions before deployment
- **Practical:** Don't over-engineer for an MVP

---

## Test Pyramid

```
         /\
        /  \       E2E (Cypress)
       /    \      10 scenarios
      /------\
     /        \    Integration
    /   20     \   API tests + component tests
   /            \
  /--------------\
 /                \ Unit
/    50 tests      \ 80% coverage
```

### Distribution

| Level | Count | Coverage Target |
|-------|-------|-----------------|
| Unit | 50+ | 80% of backend, 70% frontend |
| Integration | 20 | Key flows + API contracts |
| E2E | 10 | Critical user journeys |

---

## Unit Tests

### Backend (NestJS + Jest)

**Test Files Location:** `apps/api/src/**/*.spec.ts`

| Module | Test Focus | Sample Tests |
|--------|------------|--------------|
| IssuesService | Business logic | createIssue, getIssue, updateStatus |
| UpvotesService | Vote management | createUpvote, removeUpvote, getUpvoteCount |
| IssuesRepository | Data access | findAll, findById, create, update |

**Example Unit Test:**

```typescript
describe('IssuesService', () => {
  let service: IssuesService;
  let mockRepository: jest.Mocked<IssuesRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as any;
    service = new IssuesService(mockRepository);
  });

  describe('createIssue', () => {
    it('should create issue with generated id', async () => {
      const dto = {
        title: 'Pothole on main street',
        category: 'pothole',
        latitude: 38.4,
        longitude: 27.1,
      };
      mockRepository.create.mockResolvedValue({
        id: 'uuid-123',
        ...dto,
        status: 'reported',
      });

      const result = await service.createIssue(dto);

      expect(result.id).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: dto.title,
          category: dto.category,
          status: 'reported',
        })
      );
    });
  });
});
```

### Frontend (Vitest + React Testing Library)

**Test Files Location:** `apps/web/**/*.test.tsx`

| Component | Test Focus | Sample Tests |
|-----------|------------|---------------|
| IssueForm | Form validation | Invalid submission blocked, fields work |
| StatusBadge | Display logic | Correct color for status |
| UpvoteButton | Interaction | Click increments, toggles off |
| MapView | Rendering | Pins display, clusters work |

---

## Integration Tests

### API Contract Tests

**Location:** `apps/api/src/**/*.integration.spec.ts`

**Test Scope:**
- End-to-end request/response flow
- Database operations
- Error handling
- Rate limiting (optional)

**Example:**

```typescript
describe('Issues API', () => {
  const api = request(`http://localhost:${PORT}/api/v1`);

  describe('POST /issues', () => {
    it('should create issue and return 201', async () => {
      const response = await api
        .post('/issues')
        .send({
          title: 'Test pothole',
          category: 'pothole',
          latitude: 38.4,
          longitude: 27.1,
          deviceId: 'test-device-123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('reported');
    });

    it('should return 400 for invalid category', async () => {
      const response = await api
        .post('/issues')
        .send({
          title: 'Test',
          category: 'invalid-category',
          latitude: 38.4,
          longitude: 27.1,
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

---

## E2E Tests (Cypress)

### Location
`apps/web/cypress/e2e/`

### Critical Path Test Scenarios

| Scenario | Flow | Priority |
|----------|------|----------|
| Submit new issue | Open → Report → Photo → Location → Category → Submit → See on Map | Critical |
| View issue status | Map → Tap pin → View detail → Check timeline | Critical |
| Upvote issue | Map → Tap issue → Upvote → See count increment | Critical |
| Filter map issues | Map → Apply category filter → Verify pins update | High |
| Share issue | Issue detail → Share → Copy link → Open link → Works | Medium |
| Admin status update | Login → List → Update status → Verify public view | High |

### Example Cypress Test

```typescript
describe('Issue Reporting Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('can submit a new issue end-to-end', () => {
    // Start reporting
    cy.get('[data-testid=report-fab]').click();
    
    // Would need actual photo upload in real test
    // For now, mock or use fixture
    cy.get('[data-testid=location-auto]').should('be.visible');
    
    // Select category
    cy.get('[data-testid=category-pothole]').click();
    
    // Add description
    cy.get('[data-testid=description-input]').type('Large pothole near bus stop');
    
    // Submit
    cy.get('[data-testid=submit-button]').click();
    
    // Verify success
    cy.get('[data-testid=success-message]').should('be.visible');
    
    // Verify on map
    cy.get('[data-testid=map-view]').should('contain', 'Large pothole');
  });
});
```

---

## Smoke Tests

### Purpose
Quick sanity checks that app loads and core features work.

### Run Before Deploy
```bash
npm run test:smoke
```

### Tests Included

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Home page loads | GET / | 200 OK |
| API health | GET /health | 200 OK |
| Map loads | Visual check | No console errors |
| Form validation | Submit empty | Shows errors |
| Database connectivity | Query test | Can fetch data |

---

## Test Data Strategy

### Fixtures
- Location: `apps/api/src/test/fixtures/`
- Sample issues (JSON)
- Sample images (base64 or URLs)

### Factories
```typescript
// issues.factory.ts
function createIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: randomUUID(),
    title: 'Test Issue',
    category: 'pothole',
    status: 'reported',
    latitude: 38.4,
    longitude: 27.1,
    ...overrides,
  };
}
```

### Seed Data
- 10 sample issues across categories
- Mix of statuses
- Various upvote counts

---

## Accessibility Checks

### Automated
- **axe-core:** Run in E2E tests
- **pa11y:** CI integration

### Manual Checklist
- [ ] Tab navigation works through all interactive elements
- [ ] Focus indicators visible
- [ ] Screen reader announces content properly
- [ ] Color contrast meets WCAG AA
- [ ] Form errors announced

---

## CI Gating Recommendations

### Required to Pass

| Gate | Tool | Threshold |
|------|------|-----------|
| Lint | ESLint | Errors only |
| Type check | TypeScript | No errors |
| Unit tests | Jest | >70% coverage |
| Build | Next.js | Success |
| E2E | Cypress | >90% pass rate |

### GitHub Actions Workflow
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm run build
      - run: npm run e2e
```

---

## Test Cases by Feature

### Feature: Issue Reporting

| Test Case | Type | Valid Input | Expected Output |
|-----------|------|------------|-----------------|
| Create with all fields | Unit | Full DTO | Issue created |
| Create with minimum | Unit | Title + category + location | Issue created |
| Create with invalid category | Unit | Invalid category | Validation error |
| Create without location | Unit | Missing lat/lng | Validation error |
| Submit without photo | E2E | No image | Allowed (photo optional) |

### Feature: Upvoting

| Test Case | Type | Valid Input | Expected Output |
|-----------|------|------------|-----------------|
| Upvote new issue | Unit | Issue ID + device | Upvote created |
| Upvote same issue twice | Unit | Same issue + device | Error or no-op |
| Remove upvote | Unit | Upvote ID | Upvote deleted |
| Count shows correctly | Integration | Get upvotes | Correct count |

### Feature: Status Updates

| Test Case | Type | Valid Input | Expected Output |
|-----------|------|------------|-----------------|
| Change reported → acknowledged | Unit | Valid status | Status updated |
| Change reported → resolved | Unit | Invalid transition | Error |
| Change rejected → in_progress | Unit | Invalid transition | Error |
| Timeline shows transitions | Integration | Get issue | Full timeline |

---

## Critical-Path Regression Suite

### What Must Not Break

1. **Issue submission flow**
   - Users can submit issues
   - Issues appear on map
   - Data persists correctly

2. **Map functionality**
   - Map loads and displays
   - Pins render correctly
   - Filters work

3. **Status tracking**
   - Status changes display
   - Timeline accurate
   - Public visibility

4. **Upvoting**
   - Upvotes persist
   - Counts accurate
   - Toggle works

### Running the Suite
```bash
# All tests
npm test

# Fast check (unit only)
npm run test:unit

# Full E2E
npm run test:e2e

# Regression
npm run test:regression
```

---

## Visual Regression (Optional)

### Tool: Chromatic or Playwright Visual

**Scope:** Not required for MVP
**Future:** Consider for design system changes

---

## Testing Standards

### Code Coverage Requirements
- Minimum 70% line coverage
- 100% coverage on critical paths
- New code requires tests

### Test Naming
`[method] should [expected behavior] when [condition]`

### Test Quality
- Each test one assertion focus
- No test interdependencies
- Clean up after tests
- Descriptive test names
