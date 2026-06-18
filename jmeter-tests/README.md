# JMeter Tests — QuickCommerce

## Prerequisites
- **Apache JMeter** installed (`brew install jmeter` on macOS)

## Setup
1. Start the backend: `cd ../app/backend && npm start`
2. Start the frontend: `cd ../app/frontend && npm run dev`

## Running via CLI (Headless)
Execute the load test from this directory and compile an HTML dashboard:
```bash
jmeter -n -t quickcommerce.jmx -l results.jtl -e -o report/
```
- `-n` — non-GUI mode
- `-t` — test plan file
- `-l` — log results to JTL file
- `-e -o report/` — generate HTML dashboard report

## Running via GUI
Open the graphical test plan:
```bash
jmeter -t quickcommerce.jmx
```

## Test Plan Details
| Thread Group | Threads | Ramp-up | Loops | Endpoints |
|---|---|---|---|---|
| API Functional Flow | 1 | 0s | 1 | POST /api/auth/signup, POST /api/auth/login |
| Load Test Search | 10 | 5s | 5 | GET /api/products?search=fresh |
