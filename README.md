# Ledger – Timesheet Discrepancy Auditor

Reconciles task-by-task timesheets between Data Pull master sheets and Daily
planning sheets to audit categories and identify discrepancies. Runs entirely
in the browser – uploaded files never leave your machine.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run lint     # type check
npm run build    # outputs to dist/
```

## Deploy (GitHub Pages)

Pushes to `main` build and deploy automatically via
`.github/workflows/deploy.yml`.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
