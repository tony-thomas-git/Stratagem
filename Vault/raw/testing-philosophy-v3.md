# Testing Philosophy - Claude Code Orchestrated Development

## Overview

This document defines our testing philosophy for a Claude Code orchestrated development workflow. Our approach prioritizes practical, purposeful testing that emerges naturally from our development cycle.

## Core Principles

### 1. Tests Are Collected, Not Written First

- Tests emerge from completed features (post-AX) and fixed bugs (post-FX)
- No speculative testing - every test addresses a real scenario
- The working feature is our source of truth

### 2. Integration Over Unit

- Integration tests capture system behavior
- Unit tests only target specific bugs that occurred
- One good integration test prevents more issues than ten unit tests

### 3. Behavior Over Implementation

- Test WHAT the system does, not HOW Claude implemented it
- Tests should pass regardless of implementation details
- Focus on user outcomes and system contracts

### 4. Failing Tests as Living TODOs

- **When XE/FX analysis reveals issues that won't be fixed immediately**: Write the test that demonstrates the expected behavior
- **Let the test fail** (use `it.skip()` if needed to prevent CI failures)
- **Failing tests become**:
  - ✅ **Living reminder** of what needs fixing
  - ✅ **Exact specification** of expected behavior
  - ✅ **Automatic TODO list** every time tests run
  - ✅ **Ready-to-pass** once the fix is implemented
- **The Cycle**:
  ```
  1. XE: Document the issue
  2. Write failing test that demonstrates what SHOULD work
  3. Leave test failing (skip if needed: it.skip())
  4. Test becomes the specification + reminder
  5. Future FX: Fix implementation → test passes ✅
  ```
- **Example**:
  ```javascript
  it.skip('should cascade customer selection to filter appliances correctly', async () => {
    // This test will pass once we enhance from smoke tests to real behavioral tests
    const allAppliances = await getFilterOptions('appliances')
    await selectCustomer('ACME Corp') 
    const acmeAppliances = await getFilterOptions('appliances')
    
    expect(acmeAppliances.length).toBeLessThan(allAppliances.length)
    expect(acmeAppliances.every(app => app.customerId === 'acme')).toBe(true)
  })
  ```
- **Benefits**: More actionable than documentation that gets stale - failing tests are living specifications that remind us what needs attention

## Development Workflow & Test Collection Points

### PF (Plan Features) Phase

**No tests are written during this phase**

- Focus on comprehensive feature planning and research
- Explore existing codebase patterns and architectural approaches
- Identify integration points and testing strategy requirements
- Create high-level testing approach as part of overall feature plan

### CP (Create Plan) Phase

**Testing strategy is documented during this phase**

- Break down approved feature plan into manageable tasks
- **MANDATORY**: Include testing strategy in plan file structure:
  ```markdown
  ### Testing Strategy

  - **Integration Tests**: Define main workflow tests needed post-AX
  - **Unit Test Areas**: Identify components likely to need unit tests
  - **Critical Paths**: Mark business-critical workflows requiring tests
  - **Test Data**: Plan test scenarios and data requirements
  ```
- Each task should include testing considerations in acceptance criteria
- Identify which tasks will generate integration tests (working features)
- Identify which tasks are likely to generate unit tests (bug fixes)
- Plan test file locations and naming conventions

### PX (Preview-Execute) Phase

**No tests are written during this phase**

- Focus on implementation strategy for selected task
- Review testing strategy from CP plan for the specific task
- Include testing approach in implementation plan
- Define contracts and interfaces with testing in mind

### AX (Approved-Execute) Phase

**Claude implements the feature - no tests written during execution**

- Focus on building the feature
- Manual testing to verify it works
- **Decision point after AX completion** (see below)

### Post-AX Decision Tree

After AX implementation, evaluate the feature against the CP testing strategy:

#### Scenario 1: Feature Fully Works ✅

```
AX → [Feature Works] → Execute CP Testing Strategy → Integration Test Should Pass → Update Plan → Done
```

- Execute integration tests planned in CP phase
- Test should pass on first run (feature already works)
- Update CP plan file with test completion status
- Proceed to deployment

#### Scenario 2: Feature Partially Works ⚠️

```
AX → [Some Parts Work] → Write Integration Test for Working Parts (per CP plan)
                    ↓
                   FX for Broken Parts
                    ↓
              Fix Issues + Write Unit Tests (update CP plan)
                    ↓
         Complete CP Testing Strategy for Fixed Parts
```

- Write integration test for working parts per CP testing strategy
- Enter FX cycle for broken parts
- Each fix gets a unit test and updates CP plan
- Complete remaining CP testing strategy after fixes

#### Scenario 3: Feature Completely Fails ❌

```
AX → [Nothing Works] → Skip CP Integration Tests
            ↓
      Enter FX Cycle
            ↓
    Fix Until It Works (log unit tests in CP plan)
            ↓
    Feature Finally Works
            ↓
    Execute CP Testing Strategy
```

- Skip CP integration tests (nothing to document yet)
- FX cycle until feature works
- Log unit tests for each fix in CP plan
- Execute full CP testing strategy only after feature works

### FX (Fix) Phase

**Unit tests are collected after each bug fix and logged in CP plan**

#### Critical Rule: Every FX Cycle Generates Unit Tests + Updates CP Plan

No matter how you got to FX:

- From failed AX implementation
- From partial success needing fixes
- From user-reported bugs later

#### CP Plan Integration:

- Log each unit test in the CP plan's "Error Log" section
- Update CP testing strategy if new test areas are discovered
- Mark test completion status in CP plan file
- Reference specific task that generated the bug

#### What to Test:

1. **The Specific Bug** (logged in CP plan)

   ```javascript
   it('MUST clear customer dropdown when location changes') // This bug happened!
   ```

2. **Edge Cases Discovered** (update CP testing strategy)

   ```javascript
   it('should handle empty location list for new customers')
   ```

3. **Validation Failures** (add to CP unit test areas)
   ```javascript
   it('should prevent submission with invalid date range')
   ```

#### Unit Test Requirements:

- One unit test per bug fixed (mandatory)
- Test targets the specific failure that occurred
- Include the exact scenario that caused the bug
- Name should indicate the critical nature if applicable

### Integration Test Collection

#### When to Write Integration Tests:

- **After AX** - When feature works (execute CP testing strategy)
- **After FX** - When previously broken feature now works (complete CP plan)
- **Never** - When feature is still broken

#### CP Plan Integration:

- Follow testing strategy defined in CP phase
- Update CP plan with test completion status
- Reference specific CP tasks that generated the tests
- Log test file locations in CP plan

#### What Integration Tests Document (per CP strategy):

```javascript
// Documents working behavior (planned in CP)
it('should complete inspection workflow from start to finish', async () => {
  // This test passes because the feature works per CP plan
  await login()
  await selectLocation('Location A')
  await createInspection(validData)
  expect(inspection.status).toBe('completed')
})

// Documents partial implementation with TODOs (update CP plan)
it('should create inspection with basic validation', async () => {
  // This part works per CP strategy
  await createInspection(basicData)
  expect(inspection.id).toBeDefined()

  // TODO: Date validation fixed in FX cycle (logged in CP plan)
  // it.skip('should validate future dates')
})
```

## Test Categories by Priority

### Priority 1: Critical Path Integration Tests

Test the core business workflows that must never break:

- User authentication and authorization
- Core data creation/modification flows
- Payment processing
- Data security boundaries

### Priority 2: Feature Integration Tests

Test how new features integrate with existing systems:

- Component communication
- State management cascades
- API integrations
- Permission inheritance

### Priority 3: Bug Prevention Unit Tests

Test specific issues that have occurred:

- Bugs that reached production
- Bugs that took >1 hour to debug
- Data corruption scenarios
- Security vulnerabilities

### Priority 4: Edge Case Tests

Only test realistic edge cases that have occurred or are likely:

- Empty states
- Boundary conditions
- Concurrent operations
- Network failures

## What NOT to Test

### Skip These Tests:

- Simple display components
- Third-party library functionality
- Claude's implementation choices
- Getters/setters without logic
- Code style or patterns

### Never Write These Tests:

```javascript
// Bad: Testing implementation
it('should use Pinia store')
it('should call forEach method')

// Bad: Testing the framework
it('should render without crashing')
it('should have a div element')
```

## The Reality Check

### For Small Teams Using Claude Code:

1. **Week 1-2**: Build fast, no tests
2. **Post-AX**: Add integration test IF feature works
3. **Post-FX**: Add unit tests for EVERY bug fixed
4. **Maintenance**: Add regression tests only for recurring issues

### Minimum Test Requirements:

- Every working feature needs at least one integration test
- Every fixed bug needs at least one unit test
- Every critical business flow needs end-to-end coverage

### Test Naming Conventions:

```javascript
// Integration tests describe behavior
it('should complete checkout process with valid payment')

// Unit tests from bugs include urgency
it('MUST validate email format before API call')

// Critical regression tests are labeled
it('CRITICAL: should never expose customer A data to customer B')
```

## Claude Code Specific Considerations

### CP (Create Plan) Testing Integration

Since testing strategy is planned during CP phase:

1. **Define testing approach upfront** in CP plan file
2. **Plan test scenarios** based on feature requirements
3. **Identify critical paths** that need integration coverage
4. **Estimate test complexity** alongside implementation complexity

### Contract Testing with CP Planning

Since Claude may implement features differently each time:

1. Define clear interfaces in CP testing strategy
2. Plan contract tests in CP phase, not during implementation
3. Allow Claude freedom within boundaries defined in CP plan

### Example CP Testing Strategy Section:

```markdown
### Testing Strategy

#### Integration Tests Required:

- [ ] User login flow with role validation
- [ ] Data creation workflow end-to-end
- [ ] Permission boundary enforcement

#### Unit Test Areas:

- Customer dropdown cascade logic (likely to have edge cases)
- Date validation (user input area)
- State management synchronization

#### Critical Business Flows:

- Payment processing (MUST never break)
- Data security boundaries (customer isolation)
- User session management

#### Test Data Requirements:

- Mock customers with different permission levels
- Sample date ranges for validation testing
- Invalid input scenarios for error handling
```

### Example Contract Test (planned in CP):

```javascript
describe('LocationService Contract (CP Strategy)', () => {
  it('getAllLocations returns array with required fields', async () => {
    // Contract defined in CP testing strategy
    const locations = await LocationService.getAllLocations()
    expect(locations[0]).toHaveProperty('id')
    expect(locations[0]).toHaveProperty('name')
    expect(locations[0]).toHaveProperty('customerId')
  })
})
```

## Test Maintenance

### When to Update Tests:

- When requirements change
- When bugs reveal test gaps
- When refactoring changes contracts

### When to Delete Tests:

- When features are removed
- When tests test implementation details
- When better integration tests make unit tests redundant

## Success Metrics

Our testing approach is successful when:

1. Production bugs decrease over time
2. New features don't break existing features
3. Tests catch issues before users do
4. Test maintenance burden is manageable
5. Claude Code can refactor without breaking tests

## Summary

**The Golden Rule**: If it broke once, test it. If it's critical, integration test it. If users depend on it, never let it break again.

**The Key Decision**: After AX, can you use the feature? If yes, execute CP testing strategy. If no, fix it first.

**The FX Rule**: Every bug fixed gets a unit test and CP plan update. No exceptions.

**The CP Rule**: Every feature gets a testing strategy in the CP plan. Test execution follows the plan.

Tests are not a separate phase but a natural outcome of our development cycle. They document what we've built and protect what matters. The CP (Create Plan) phase ensures testing strategy is considered upfront, making test creation systematic rather than ad-hoc.
