import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Handshake,
  Mail,
  ThumbsUp,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import type { PageId } from "../App";
import {
  IndentStatus,
  OfferStage,
  OnboardingStatus,
  ScreeningResult,
} from "../backend.d";
import {
  type SampleCandidate,
  type SampleIndent,
  recentActivities,
} from "../data/sampleData";

interface DashboardProps {
  indents: SampleIndent[];
  candidates: SampleCandidate[];
  setCurrentPage: (page: PageId) => void;
}

export default function Dashboard({
  indents,
  candidates,
  setCurrentPage,
}: DashboardProps) {
  const openIndents = indents.filter(
    (i) =>
      i.status !== IndentStatus.Rejected && i.status !== IndentStatus.Draft,
  ).length;
  const pendingApprovals = indents.filter(
    (i) =>
      i.status === IndentStatus.BusinessHeadPending ||
      i.status === IndentStatus.DirectorPending,
  ).length;
  const inPipeline = candidates.filter(
    (c) => c.screeningResult === ScreeningResult.Shortlisted,
  ).length;
  const offersSent = candidates.filter(
    (c) => c.offerStage && c.offerStage !== OfferStage.Draft,
  ).length;
  const onboarded = candidates.filter(
    (c) => c.onboardingDays && c.onboardingDays.length > 0,
  ).length;

  const pipelineStages = [
    {
      label: "Indents",
      count: indents.length,
      color: "oklch(0.48 0.18 265)",
      page: "indents" as PageId,
    },
    {
      label: "CV Database",
      count: candidates.length,
      color: "oklch(0.5 0.17 240)",
      page: "cv-database" as PageId,
    },
    {
      label: "Screened",
      count: candidates.filter((c) => c.screeningResult).length,
      color: "oklch(0.52 0.16 220)",
      page: "screening" as PageId,
    },
    {
      label: "Shortlisted",
      count: candidates.filter(
        (c) => c.screeningResult === ScreeningResult.Shortlisted,
      ).length,
      color: "oklch(0.5 0.15 200)",
      page: "ai-interview" as PageId,
    },
    {
      label: "AI Interview",
      count: candidates.filter((c) => c.aiInterviewStatus === "Completed")
        .length,
      color: "oklch(0.52 0.17 180)",
      page: "ai-interview" as PageId,
    },
    {
      label: "Interview Done",
      count: candidates.filter((c) => c.round1Status === "Completed").length,
      color: "oklch(0.54 0.18 160)",
      page: "interview-lineup" as PageId,
    },
    {
      label: "Offered",
      count: offersSent,
      color: "oklch(0.55 0.17 145)",
      page: "offer-management" as PageId,
    },
    {
      label: "Onboarded",
      count: onboarded,
      color: "oklch(0.56 0.18 130)",
      page: "onboarding" as PageId,
    },
  ];

  const maxCount = Math.max(...pipelineStages.map((s) => s.count), 1);

  const activityIcons: Record<string, React.ReactNode> = {
    check: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    calendar: <Clock className="w-4 h-4 text-blue-500" />,
    bot: <Bot className="w-4 h-4 text-purple-500" />,
    file: <FileText className="w-4 h-4 text-indigo-500" />,
    thumbsup: <ThumbsUp className="w-4 h-4 text-amber-500" />,
    user: <UserCheck className="w-4 h-4 text-cyan-500" />,
    mail: <Mail className="w-4 h-4 text-orange-500" />,
    graduation: <GraduationCap className="w-4 h-4 text-teal-500" />,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
            Recruitment Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of your hiring pipeline —{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button onClick={() => setCurrentPage("indents")} className="gap-2">
          <FileText className="w-4 h-4" />
          New Indent
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            label: "Open Indents",
            value: openIndents,
            icon: FileText,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
            page: "indents" as PageId,
          },
          {
            label: "In Pipeline",
            value: inPipeline,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-50",
            page: "cv-database" as PageId,
          },
          {
            label: "Pending Approvals",
            value: pendingApprovals,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50",
            page: "approvals" as PageId,
          },
          {
            label: "Offers Sent",
            value: offersSent,
            icon: Handshake,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            page: "offer-management" as PageId,
          },
          {
            label: "Onboarded",
            value: onboarded,
            icon: GraduationCap,
            color: "text-teal-500",
            bg: "bg-teal-50",
            page: "onboarding" as PageId,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className="cursor-pointer hover:shadow-card-hover transition-shadow border-border"
              onClick={() => setCurrentPage(kpi.page)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${kpi.color}`} />
                    </div>
                    <div className="text-2xl font-display font-bold text-foreground">
                      {kpi.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {kpi.label}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 mt-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Recruitment Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {pipelineStages.map((stage) => {
                const pct = (stage.count / maxCount) * 100;
                return (
                  <button
                    type="button"
                    key={stage.label}
                    className="flex items-center gap-3 cursor-pointer group w-full text-left"
                    onClick={() => setCurrentPage(stage.page)}
                  >
                    <div className="w-28 text-xs text-muted-foreground text-right truncate group-hover:text-foreground transition-colors">
                      {stage.label}
                    </div>
                    <div className="flex-1 h-7 bg-muted/50 rounded-md overflow-hidden relative">
                      <div
                        className="h-full rounded-md transition-all duration-700 flex items-center justify-end pr-2.5"
                        style={{
                          width: `${Math.max(pct, 8)}%`,
                          background: stage.color,
                        }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {stage.count}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
              <span>Conversion rate:</span>
              <span className="font-semibold text-emerald-600">
                {candidates.length > 0
                  ? Math.round((onboarded / candidates.length) * 100)
                  : 0}
                % (Indents to Onboarded)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentActivities.slice(0, 6).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {activityIcons[activity.icon]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">
                      {activity.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indent Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base">
                Active Indents
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setCurrentPage("indents")}
              >
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {indents.slice(0, 5).map((indent) => (
                <div
                  key={indent.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {indent.role}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {indent.department} · {indent.positions} position
                      {indent.positions > 1 ? "s" : ""}
                    </div>
                  </div>
                  <IndentStatusBadge status={indent.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base">
                Candidates in Progress
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setCurrentPage("cv-database")}
              >
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {candidates
                .filter(
                  (c) => c.screeningResult === ScreeningResult.Shortlisted,
                )
                .slice(0, 5)
                .map((c) => {
                  const stage = c.onboardingDays?.length
                    ? "Onboarding"
                    : c.inductionStatus
                      ? "Induction"
                      : c.offerStage
                        ? `Offer: ${c.offerStage}`
                        : c.finalDecision
                          ? `Final: ${c.finalDecision}`
                          : c.round2Status
                            ? "Round 2"
                            : c.round1Status
                              ? "Round 1"
                              : c.aiInterviewStatus === "Completed"
                                ? "AI Interview Done"
                                : "Shortlisted";
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{
                            background: `oklch(${0.45 + ((c.id * 0.07) % 0.3)} 0.18 ${200 + c.id * 30})`,
                          }}
                        >
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {c.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {c.role}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs shrink-0 badge-shortlisted"
                      >
                        {stage}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function IndentStatusBadge({ status }: { status: IndentStatus }) {
  const map: Record<IndentStatus, { label: string; cls: string }> = {
    [IndentStatus.Draft]: { label: "Draft", cls: "badge-draft" },
    [IndentStatus.BusinessHeadPending]: {
      label: "BH Pending",
      cls: "badge-bh-pending",
    },
    [IndentStatus.DirectorPending]: {
      label: "Dir. Pending",
      cls: "badge-dir-pending",
    },
    [IndentStatus.Approved]: { label: "Approved", cls: "badge-approved" },
    [IndentStatus.Rejected]: { label: "Rejected", cls: "badge-rejected" },
  };
  const { label, cls } = map[status];
  return (
    <Badge variant="outline" className={`text-xs ${cls}`}>
      {label}
    </Badge>
  );
}
