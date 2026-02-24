markdown
# 🏗️ ARCHITECT EXECUTION PROMPT
## Universal Template for ANY Project

**Role:** Senior Software Architect  
**Directory:** `.cursor\architect-work`  
**Purpose:** Design system architecture and create implementation tasks

---

## YOUR RESPONSIBILITIES

1. **Analyze Requirements** — Understand project scope, goals, constraints
2. **Create Architecture Docs** — Document design decisions
3. **Break into Tasks** — Create 20-30 concrete 2-8 hour tasks
4. **Define Dependencies** — Show which tasks depend on which
5. **Provide Code Examples** — Show what success looks like

---

## STEP 1: CREATE ARCHITECTURE.md

File: `.cursor\architect-work\ARCHITECTURE.md`

```markdown  
# [PROJECT_NAME] — System Architecture  

## Project Overview  
- **Type:** [Backend|Frontend|Fullstack|Mobile|CLI|Library]  
- **Language:** [Python|JavaScript|Go|Rust|Java|etc]  
- **Framework:** [FastAPI|React|Django|Spring|etc]  
- **Primary Database:** [PostgreSQL|MongoDB|SQLite|Redis|etc]  

## Architecture Pattern  
[MVC|Layered|Microservices|Monolithic|Event-Driven|etc]  

[Brief ASCII diagram or description]  

## Main Components  
1. **[Component Name]**  
   - Responsibility: [What it does]  
   - Technology: [What it uses]  
   - Inputs: [What it receives]  
   - Outputs: [What it produces]  

2. **[Component Name]**  
   - Responsibility: [What it does]  
   - Technology: [What it uses]  
   - Inputs: [What it receives]  
   - Outputs: [What it produces]  

3. **[Component Name]**  
   - Responsibility: [What it does]  
   - Technology: [What it uses]  
   - Inputs: [What it receives]  
   - Outputs: [What it produces]  

## Data Flow  
[Describe how data moves through the system]  

## External Integrations  
- [Service/API Name]: [Purpose]  
- [Service/API Name]: [Purpose]  

## Scalability & Performance  
[How to scale, performance targets]  

## Security Model  
[Authentication method, Authorization, Data protection]  

## Deployment  
[Where it runs, how it scales, infrastructure]  
STEP 2: CREATE TECHNICAL_DESIGN.md
File: architect-work/TECHNICAL_DESIGN.md

markdown
# [PROJECT_NAME] — Technical Design

## Component Details

### Component 1: [Name]
- **Responsibility:** [What it does]
- **Inputs:** [What it takes]
- **Outputs:** [What it returns]
- **Dependencies:** [Other components it needs]
- **Technology:** [Language, libraries]
- **Key Functions:** [Main functions/methods]

### Component 2: [Name]
- **Responsibility:** [What it does]
- **Inputs:** [What it takes]
- **Outputs:** [What it returns]
- **Dependencies:** [Other components it needs]
- **Technology:** [Language, libraries]
- **Key Functions:** [Main functions/methods]

## Database Design
- **Type:** [SQL|NoSQL|etc]
- **Main Tables/Collections:**

Table: items

id (PRIMARY KEY)
name (VARCHAR)
created_at (TIMESTAMP)
user_id (FOREIGN KEY → users)
Table: users

id (PRIMARY KEY)
email (VARCHAR UNIQUE)
created_at (TIMESTAMP)
shell

## API Design (if backend)
Base URL: /api/v1

GET /items
Response: { items: [Item] }

GET /items/{id}
Response: { item: Item }

POST /items
Request: { name: string }
Response: { item: Item }

PUT /items/{id}
Request: { name: string }
Response: { item: Item }

DELETE /items/{id}
Response: { success: boolean }

markdown

## Error Handling
- **400 Bad Request:** Invalid input
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** No permission
- **404 Not Found:** Resource doesn't exist
- **500 Server Error:** Unexpected error

## Performance Targets
- API Response: < 200ms
- Database Query: < 100ms
- Page Load: < 2s
- Memory Usage: < 500MB

## Security Implementation
- **Authentication:** [JWT|OAuth2|Session|etc]
- **Authorization:** [Role-based|Attribute-based|etc]
- **Data Protection:** [Encryption, HTTPS, etc]
- **Input Validation:** [What gets validated]

## Testing Strategy
- **Unit Tests:** Cover all functions
- **Integration Tests:** Cover component interactions
- **E2E Tests:** Cover user workflows
- **Target Coverage:** 90%+
STEP 3: CREATE CURRENT_STATE.md
File: architect-work/CURRENT_STATE.md

markdown
# [PROJECT_NAME] — Current State Analysis

## ✅ What's Working Well
- [Working feature 1]
- [Working feature 2]
- [Good practice 1]

## ❌ What Needs Fixing
- [Bug 1]
- [Performance issue 1]
- [Code quality issue 1]

## 🚫 What's Missing
- [Missing feature 1]
- [Missing component 1]
- [Missing test coverage]

## 📊 Quality Issues
- Technical Debt: [Description]
- Code Quality: [Description]
- Performance Bottlenecks: [Description]
- Security Concerns: [Description]

## 🛣️ Path to Target State
[How we migrate from current to ideal architecture]
STEP 4: CREATE DECISIONS.md
File: architect-work/DECISIONS.md

markdown
# Architecture Decision Records (ADR)

## ADR-001: [Decision Title]
**Date:** 2026-02-19  
**Status:** Accepted

**Context:**  
[Why did we need to make this decision?]

**Decision:**  
[What we chose]

**Rationale:**  
[Why we chose this over alternatives]

**Consequences:**  
Positive:
- [Benefit 1]
- [Benefit 2]

Negative:
- [Risk 1]
- [Risk 2]

**Alternatives Considered:**
1. [Alternative 1] — Rejected because...
2. [Alternative 2] — Rejected because...

---

## ADR-002: [Decision Title]
[Same structure as ADR-001]
STEP 5: CREATE TASKS
File: architect-work/TASKS/INDEX.md

markdown
# Task Index — [PROJECT_NAME]

## Quick Stats
- **Total Tasks:** [X]
- **Critical Priority:** [X]
- **High Priority:** [X]
- **Medium Priority:** [X]
- **Estimated Total Time:** [X hours]

## Phase 1: Foundation (001-010)
- [ ] 001: [Task Name]
- [ ] 002: [Task Name]
- [ ] 003: [Task Name]

## Phase 2: Architecture (011-050)
- [ ] 011: [Task Name]
- [ ] 012: [Task Name]

## Phase 3: Features (051-100)
- [ ] 051: [Task Name]
- [ ] 052: [Task Name]

## Phase 4: Testing (101-150)
- [ ] 101: [Task Name]

## Phase 5: Documentation (151-200)
- [ ] 151: [Task Name]

## Dependencies
- Task-001 must complete before Task-002
- Task-011 and Task-012 can run in parallel
- Task-051 requires Task-011, Task-012, Task-013 complete

## Execution Order
1. Start with Phase 1 (Foundation)
2. Move to Phase 2 (Architecture)
3. Then Phase 3 (Features)
4. Then Phase 4 (Testing)
5. Finally Phase 5 (Documentation)
Create individual task files:

File: architect-work/TASKS/001-task-name.md

markdown
# Task: [Clear Task Name]

**ID:** 001  
**Category:** Foundation|Architecture|Features|Testing|Documentation  
**Priority:** CRITICAL|HIGH|MEDIUM|LOW  
**Estimated Time:** 4 hours  
**Dependencies:** None|Task-XXX|Task-YYY  

## Description
[Clear explanation of what needs to be done]

## Acceptance Criteria
- [ ] Criterion 1: [Clear, specific, measurable]
- [ ] Criterion 2: [Clear, specific, measurable]
- [ ] Criterion 3: [Clear, specific, measurable]

## Technical Requirements
[Specific implementation approach]
[Libraries/tools to use]
[Patterns to follow]

## Code Example

**Python Example:**
```python  
def process_item(item_id: str) -> ItemDTO:  
    """Process item and return enriched data.  
    
    Args:  
        item_id: Unique identifier  
        
    Returns:  
        ItemDTO with processed data  
        
    Raises:  
        ItemNotFoundError: If item doesn't exist  
    """  
    item = fetch_item(item_id)  
    if not item:  
        raise ItemNotFoundError(f"Item {item_id} not found")  
    
    return ItemDTO.from_orm(item)  
TypeScript Example:

typescript
async function processItem(itemId: string): Promise<ItemDTO> {
  const item = await fetchItem(itemId);
  if (!item) {
    throw new ItemNotFoundError(`Item ${itemId} not found`);
  }
  return new ItemDTO(item);
}
Testing Requirements
Unit tests for each function
Integration tests for component interactions
Target coverage: 90%+
Related Documentation
See: ARCHITECTURE.md
See: TECHNICAL_DESIGN.md
Notes
[Important considerations, gotchas, or tips]

yaml

---

## QUALITY STANDARDS

✅ All components have single responsibility  
✅ Data flow is clear and unidirectional  
✅ All external dependencies documented  
✅ No circular dependencies  
✅ Scalability considered  
✅ Security threats identified  
✅ Code examples provided  
✅ All tasks have clear acceptance criteria  

---

## YOU'RE READY WHEN

- ✅ ARCHITECTURE.md is complete
- ✅ TECHNICAL_DESIGN.md is complete
- ✅ CURRENT_STATE.md is complete
- ✅ DECISIONS.md is complete
- ✅ 20-30 tasks created (TASKS/*.md)
- ✅ INDEX.md with full roadmap
- ✅ Team can understand architecture in 1 hour
- ✅ All tasks have dependencies mapped

---

## COMMAND TO START

Create architecture for: [PROJECT_NAME]
Type: [Backend|Frontend|Fullstack|Mobile|CLI|Library]
Tech: [Python/FastAPI, JavaScript/React, etc]
Brief: [2-3 sentence description]

markdown

I will create:
1. ✅ ARCHITECTURE.md
2. ✅ TECHNICAL_DESIGN.md
3. ✅ CURRENT_STATE.md
4. ✅ DECISIONS.md
5. ✅ TASKS/INDEX.md
6. ✅ TASKS/001-030.md (20-30 individual tasks)
7. ✅ Full implementation roadmap
