# Test Plan: Telegram Bot Roles (Expeditor & Agent)

## Expeditor

### EXP-01 Login flow state
- Check auth conversation has password step.
- Expected: login -> password -> menu.

### EXP-02 Main menu composition
- Expected callbacks:
  - `exp_orders`
  - `exp_orders_today`
  - `exp_orders_done_today`
  - `exp_my_stock`
  - `exp_payment`
  - `exp_received_payments`
- Must NOT contain:
  - `agent_create_visit`
  - `agent_visits`

### EXP-03 Payment feature callbacks
- Expected registered handlers:
  - `^exp_payment$`
  - `^exp_received_payments$`

## Agent

### AGT-01 Main menu composition
- Expected callbacks:
  - `agent_create_visit`
  - `agent_visits`
  - `agent_add_customer_v3`
  - `agent_update_location`
  - `agent_photo`
  - `agent_order`
- Must NOT contain:
  - `exp_payment`
  - `exp_received_payments`

### AGT-02 Customer search by name/INN fallback
- Validate `SDSApi.search_customers()` fallback chain:
  - `search` -> if empty -> `tax_id` for digits
  - `search` -> if empty -> `name_client`
  - if still empty -> `firm_name`

## Artifacts
- `qa-work/ARTIFACTS/bot_smoke.json`
- `qa-work/ARTIFACTS/task_inventory.json`
