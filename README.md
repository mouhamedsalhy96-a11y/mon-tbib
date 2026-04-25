# Mon Tbib - Medical Practice Management System

A lightweight, secure SaaS application designed to help independent medical practitioners manage their clinic operations. Built for speed, print-readiness, and data security.

## Features

- **Patient Dossiers:** Complete electronic medical records (EMR) with clinical history.
- **Agenda & Scheduling:** Daily appointment tracking and consultation workflow.
- **Clinical Consultations:** Record vitals, symptoms, diagnosis, and treatment plans.
- **Document Generation:** Print-ready prescriptions (ordonnances) and medical certificates.
- **Secure File Uploads:** Upload and manage patient lab results and X-rays.
- **Billing & Invoicing:** Track payments and outstanding balances (DT currency).
- **Global Search:** Command-palette style search to navigate instantly to any patient.
- **Print Optimization:** CSS-optimized views for printing official medical documents.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Buckets (Patient files)
- **Security:** Strict Row-Level Security (RLS) policies

## Environment Variables

To run this project locally, create a `.env.local` file in the root directory and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qubisidtrwizhxmorlgi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_zpGAGS_R4HfV6WITF57IXg_hR0YV-nI