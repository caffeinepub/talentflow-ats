# ATS Dashboard (Applicant Tracking System)

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Indent Management**: Create hiring requests/indents with job details, department, role, number of positions, and justification.
- **Two-Level Approval Workflow**: Each indent goes through Business Head approval, then Director approval. Status transitions: Draft -> Business Head Pending -> Director Pending -> Approved / Rejected.
- **CV Database**: Manual CV upload with candidate profile data (name, contact, skills, experience). Also a "Website Applications" intake that simulates candidates applying via company website link.
- **First-Level Screening**: HR reviews CVs against JD criteria, marks candidates as Shortlisted / Rejected / On Hold with screening notes.
- **AI Interview**: Simulate AI-driven interview round -- schedule, record AI interview completion status, and store AI-generated interview summary/score per candidate.
- **Interview Lineup**: Two interview rounds. Each round has interviewer assignment, scheduled date, status, and post-round feedback form. Feedback covers: technical skills, communication, cultural fit, rating (1-5), recommendation.
- **Final Feedback**: Consolidated view of all round feedbacks per candidate. HR marks final decision: Proceed to Offer / Reject / Hold.
- **Pre-Offer Documents**: Upload/attach documents required before offer (background check consent, reference check, salary slip uploads).
- **Offer Management**: Generate offer with CTC, role, joining date. Candidate acceptance/rejection tracking. Offer stages: Draft -> Sent -> Accepted / Rejected / Negotiating.
- **Post-Offer Documentation**: Collect documents after offer acceptance (relieving letter, education certificates, ID proofs).
- **Pre-Joining Forms**: Digital forms for new joinees -- personal info, bank details, emergency contacts, address proof.
- **Induction**: Schedule and track induction sessions. Mark completion status.
- **Onboarding (3-Day Process Training)**: Day 1, Day 2, Day 3 training modules. Track completion per day. Mark overall onboarding status as complete.
- **Dashboard Home**: Overview metrics -- open indents, active candidates, pending approvals, pipeline stage counts.
- **Role-based views**: HR, Business Head, Director roles with appropriate access to approval and pipeline stages.

### Modify
None (new project).

### Remove
None (new project).

## Implementation Plan
1. **Backend (Motoko)**:
   - Data models: Indent, Candidate, CVEntry, ScreeningResult, AIInterview, InterviewRound, InterviewFeedback, FinalDecision, OfferLetter, Document, PreJoiningForm, InductionRecord, OnboardingRecord
   - CRUD operations for all entities
   - Approval workflow state machine for indents (Draft -> BH Approved -> Director Approved / Rejected)
   - Candidate pipeline stage transitions
   - Role-based query filters (HR, Business Head, Director)

2. **Frontend (React)**:
   - Sidebar navigation with all pipeline stages
   - Dashboard home with KPI cards and pipeline overview
   - Indent form and approval queue views
   - CV database with manual add + simulated website applications tab
   - Screening workspace: CV viewer + JD sidebar + shortlist/reject/hold actions
   - AI Interview page: list candidates, schedule, mark complete, view AI summary
   - Interview Lineup: Round 1 and Round 2 scheduling + feedback forms
   - Final Feedback consolidation view
   - Pre-offer documents checklist/upload
   - Offer letter management with stage tracking
   - Post-offer documents collection
   - Pre-joining forms
   - Induction scheduler
   - Onboarding 3-day training tracker
   - Role switcher for demo purposes
