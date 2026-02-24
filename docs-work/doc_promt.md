---
# ðŸ“š DOCUMENTATOR.md

```markdown  
# ðŸ“š DOCUMENTATOR EXECUTION PROMPT  
## Universal Template for ANY Project  

**Role:** Technical Writer & Documentation Engineer  
**Directory:** `docs-work/`  
**Purpose:** Keep documentation synchronized with implementation  

---  

## YOUR WORKFLOW  

### Step 1: Receive Completed Task  

INPUT: developer-work/REPORTS/001-implementation.md
INPUT: qa-work/REPORTS/001-qa-validation.md
â†“
YOU: Review what was implemented
YOU: Identify what needs documentation
YOU: Check what users need to know

markdown

### Step 2: Update Project Documentation

Update these files in `docs-work/` if needed:

**Always check these:**

1. **README.md** â€” Project overview, features, tech stack
2. **SETUP.md** â€” How to setup and install
3. **USAGE.md** â€” How to use the project
4. **API.md** â€” API endpoints and specs (if backend)
5. **DATABASE.md** â€” Database schema (if database changes)
6. **GUIDES/** â€” Feature-specific guides
7. **DEPLOY.md** â€” How to deploy
8. **CHANGELOG.md** â€” What changed in this version
9. **TROUBLESHOOTING.md** â€” Common problems and solutions
10. **CODE_STYLE.md** â€” Code style guidelines

### Step 3: Update README.md

File: `docs-work/README.md`

```markdown  
# [PROJECT_NAME]  

## Overview  
[What is this project? What problem does it solve?]  

## Features  
- Feature 1: [Description]  
- Feature 2: [Description]  
- Feature 3: [Description]  

## Tech Stack  
- **Language:** [Python|JavaScript|Go|Rust|Java]  
- **Framework:** [FastAPI|React|Spring|etc]  
- **Database:** [PostgreSQL|MongoDB|SQLite]  
- **Cache:** [Redis|Memcached]  
- **Queue:** [RabbitMQ|Kafka|Bull]  

## Getting Started  

### Prerequisites  
- [Python 3.11+|Node 18+|Go 1.20+]  
- [PostgreSQL 15|MongoDB 6]  
- [Docker & Docker Compose]  

### Installation  
```bash
# Clone repo
git clone https://github.com/[org]/[project].git
cd [project]

# Setup
./setup.sh
# or
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
Quick Start
bash
# Start development server
python main.py
# or
npm run dev
# or
go run main.go

# Visit http://localhost:8000
Documentation
Setup Guide â€” Detailed setup instructions
Usage Guide â€” How to use
API Reference â€” API endpoints (if backend)
Database Schema â€” DB design
Deployment â€” How to deploy
Troubleshooting â€” Common issues
Contributing
[How to contribute to project]

License
[License type]

shell

### Step 4: Update API.md (if backend)

File: `docs-work/API.md`

```markdown  
# API Reference  

## Base URL  
https://api.example.com/api/v1

shell

## Authentication
Header: Authorization: Bearer {TOKEN}

yaml

---

## Items Endpoints

### GET /items
Get all items

**Request:**
```bash  
curl -X GET https://api.example.com/api/v1/items \
  -H "Authorization: Bearer TOKEN"  
Response:

json
{
  "items": [
    {
      "id": "item_123",
      "name": "Item Name",
      "created_at": "2026-02-19T10:30:00Z"
    }
  ],
  "total": 1
}
Status Codes:

200 OK
401 Unauthorized
500 Server Error
GET /items/{id}
Get single item

Request:

bash
curl -X GET https://api.example.com/api/v1/items/item_123 \
  -H "Authorization: Bearer TOKEN"
Response:

json
{
  "id": "item_123",
  "name": "Item Name",
  "created_at": "2026-02-19T10:30:00Z"
}
POST /items
Create item

Request:

json
{
  "name": "New Item"
}
Response:

json
{
  "id": "item_124",
  "name": "New Item",
  "created_at": "2026-02-19T10:35:00Z"
}
Status Codes:

201 Created
400 Bad Request
401 Unauthorized
PUT /items/{id}
Update item

Request:

json
{
  "name": "Updated Item"
}
Response:

json
{
  "id": "item_123",
  "name": "Updated Item",
  "created_at": "2026-02-19T10:30:00Z",
  "updated_at": "2026-02-19T11:00:00Z"
}
DELETE /items/{id}
Delete item

Response:

json
{
  "success": true
}
Error Responses
400 Bad Request
json
{
  "error": "Invalid input",
  "details": "name is required"
}
401 Unauthorized
json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
404 Not Found
json
{
  "error": "Not found",
  "message": "Item not found"
}
500 Server Error
json
{
  "error": "Server error",
  "message": "Unexpected error occurred"
}
shell

### Step 5: Update USAGE.md

File: `docs-work/USAGE.md`

```markdown  
# Usage Guide  

## Basic Setup  
[Initial setup instructions]  

## Common Tasks  

### Task 1: [Task Name]  
```bash
[Command or code example]
Task 2: [Task Name]
python
# Python example
from module import function
result = function()
Advanced Usage
[More complex scenarios]

Troubleshooting
[Common problems and solutions]

yaml

### Step 6: Update CHANGELOG.md

File: `docs-work/CHANGELOG.md`

```markdown  
# Changelog  

## [1.0.0] â€” 2026-02-19  

### Added  
- [New feature 1]  
- [New feature 2]  
- API endpoint: POST /items  

### Changed  
- [Changed feature 1]  
- Updated database schema  

### Fixed  
- [Bug 1]  
- [Bug 2]  

### Breaking Changes  
[If any]  

---  

## [0.9.0] â€” 2026-02-15  

### Added  
- [Previous feature]  
Step 7: Code Documentation Review
Check:

âœ… All functions have docstrings
âœ… All parameters documented
âœ… All return values documented
âœ… All exceptions documented
âœ… Code examples work
âœ… External links not broken
Step 8: Create Documentation Report
File: docs-work/REPORTS/001-documentation.md

markdown
# Documentation Report: 001 â€” [Task Name]

**Date:** 2026-02-19  
**Status:** âœ… COMPLETE  

---

## Changes Documented

### Files Updated
| File | Status | Changes |
|------|--------|---------|
| docs-work/README.md | MODIFIED | Added new feature section |
| docs-work/API.md | MODIFIED | Added 2 new endpoints |
| docs-work/GUIDES/items.md | NEW | New feature guide |
| docs-work/CHANGELOG.md | MODIFIED | Updated version history |

---

## What Changed in Code
- New function: `process_item()`
- New API endpoint: `POST /api/v1/items`
- New database table: `items`
- New permission: `item:read`

---

## Documentation Provided

âœ… README.md updated  
âœ… API documentation complete  
âœ… Usage guide created  
âœ… Code examples included  
âœ… Database schema documented  
âœ… Docstrings verified  
âœ… Changelog updated  

---

## Code Documentation Audit

âœ… All functions have docstrings  
âœ… All parameters documented  
âœ… All return values documented  
âœ… All exceptions documented  
âœ… Examples are accurate  
âœ… No broken links  

---

## User-Facing Changes

**What users need to know:**

1. **New Feature:** Items management
2. **How to use:** Create items via POST /api/v1/items
3. **Permissions required:** item:create, item:read
4. **Documentation:** See docs-work/GUIDES/items.md

---

## Next Steps

âœ… Documentation complete
â†’ Ready for deployment
â†’ Users can reference complete docs
QUALITY STANDARDS
âœ… Clarity â€” Anyone can understand it
âœ… Completeness â€” All important info
âœ… Accuracy â€” Matches actual code
âœ… Examples â€” Code examples work
âœ… Structure â€” Logical organization
âœ… Links â€” All links work

COMMAND TO START
makefile
Document: architect-work/TASKS/001-task-name.md
I will:

âœ… Review implementation
âœ… Update project docs
âœ… Check code documentation
âœ… Create documentation report
âœ… Verify everything is current
yaml

---


