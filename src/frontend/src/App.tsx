import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Sidebar from "./components/ats/Sidebar";
import { sampleCandidates, sampleIndents } from "./data/sampleData";
import type { SampleCandidate, SampleIndent } from "./data/sampleData";
import AIInterviewPage from "./pages/AIInterviewPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import CVDatabasePage from "./pages/CVDatabasePage";
import Dashboard from "./pages/Dashboard";
import FinalFeedbackPage from "./pages/FinalFeedbackPage";
import IndentsPage from "./pages/IndentsPage";
import InductionPage from "./pages/InductionPage";
import InterviewLineupPage from "./pages/InterviewLineupPage";
import OfferManagementPage from "./pages/OfferManagementPage";
import OnboardingPage from "./pages/OnboardingPage";
import PostOfferDocsPage from "./pages/PostOfferDocsPage";
import PreJoiningFormsPage from "./pages/PreJoiningFormsPage";
import PreOfferDocsPage from "./pages/PreOfferDocsPage";
import ScreeningPage from "./pages/ScreeningPage";

export type PageId =
  | "dashboard"
  | "indents"
  | "approvals"
  | "cv-database"
  | "screening"
  | "ai-interview"
  | "interview-lineup"
  | "final-feedback"
  | "pre-offer-docs"
  | "offer-management"
  | "post-offer-docs"
  | "pre-joining-forms"
  | "induction"
  | "onboarding";

export type UserRole = "HR" | "Business Head" | "Director";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard");
  const [currentRole, setCurrentRole] = useState<UserRole>("HR");
  const [indents, setIndents] = useState<SampleIndent[]>(sampleIndents);
  const [candidates, setCandidates] =
    useState<SampleCandidate[]>(sampleCandidates);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            indents={indents}
            candidates={candidates}
            setCurrentPage={setCurrentPage}
          />
        );
      case "indents":
        return <IndentsPage indents={indents} setIndents={setIndents} />;
      case "approvals":
        return (
          <ApprovalsPage
            indents={indents}
            setIndents={setIndents}
            currentRole={currentRole}
          />
        );
      case "cv-database":
        return (
          <CVDatabasePage
            candidates={candidates}
            setCandidates={setCandidates}
            indents={indents}
          />
        );
      case "screening":
        return (
          <ScreeningPage
            candidates={candidates}
            setCandidates={setCandidates}
            indents={indents}
          />
        );
      case "ai-interview":
        return (
          <AIInterviewPage
            candidates={candidates}
            setCandidates={setCandidates}
          />
        );
      case "interview-lineup":
        return (
          <InterviewLineupPage
            candidates={candidates}
            setCandidates={setCandidates}
          />
        );
      case "final-feedback":
        return (
          <FinalFeedbackPage
            candidates={candidates}
            setCandidates={setCandidates}
          />
        );
      case "pre-offer-docs":
        return (
          <PreOfferDocsPage
            candidates={candidates}
            setCandidates={setCandidates}
          />
        );
      case "offer-management":
        return (
          <OfferManagementPage
            candidates={candidates}
            setCandidates={setCandidates}
          />
        );
      case "post-offer-docs":
        return (
          <PostOfferDocsPage
            candidates={candidates}
            setCandidates={setCandidates}
          />
        );
      case "pre-joining-forms":
        return (
          <PreJoiningFormsPage
            candidates={candidates}
            setCandidates={setCandidates}
          />
        );
      case "induction":
        return (
          <InductionPage
            candidates={candidates}
            setCandidates={setCandidates}
          />
        );
      case "onboarding":
        return (
          <OnboardingPage
            candidates={candidates}
            setCandidates={setCandidates}
          />
        );
      default:
        return (
          <Dashboard
            indents={indents}
            candidates={candidates}
            setCurrentPage={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
      />
      <main className="flex-1 overflow-auto">
        <div className="min-h-full p-6 animate-fade-in">{renderPage()}</div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
