import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bot, Calendar, CheckCircle2, Eye, PlayCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScreeningResult } from "../backend.d";
import type { SampleCandidate } from "../data/sampleData";
import { useActor } from "../hooks/useActor";

interface AIInterviewPageProps {
  candidates: SampleCandidate[];
  setCandidates: (c: SampleCandidate[]) => void;
}

const aiSummaryTemplates = [
  "The candidate demonstrated strong technical depth and clear communication. Problem-solving approach was structured and methodical. Cultural alignment appears positive based on responses to situational questions. Recommend proceeding to technical interview rounds.",
  "Candidate showed good domain knowledge but communication could be more concise. Technical skills are solid for the role requirements. Showed adaptability and learning mindset. Suitable for next interview stage with focus on communication assessment.",
  "Excellent performance across all parameters. Outstanding technical knowledge combined with strong leadership orientation. Stakeholder management skills evident from past experience discussions. Highly recommended for fast-track hiring.",
];

export default function AIInterviewPage({
  candidates,
  setCandidates,
}: AIInterviewPageProps) {
  const [scheduleTarget, setScheduleTarget] = useState<SampleCandidate | null>(
    null,
  );
  const [viewSummary, setViewSummary] = useState<SampleCandidate | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { actor } = useActor();

  const eligible = candidates.filter(
    (c) => c.screeningResult === ScreeningResult.Shortlisted,
  );

  const handleSchedule = async () => {
    if (!scheduleTarget || !scheduleDate) {
      toast.error("Please select a date");
      return;
    }
    setSubmitting(true);
    try {
      if (actor) {
        await actor.addAIInterview(
          BigInt(scheduleTarget.id),
          BigInt(new Date(scheduleDate).getTime() * 1000000),
          false,
          BigInt(0),
          "",
        );
      }
      setCandidates(
        candidates.map((c) =>
          c.id === scheduleTarget.id
            ? {
                ...c,
                aiInterviewStatus: "Scheduled",
                aiInterviewDate: scheduleDate,
              }
            : c,
        ),
      );
      toast.success("AI Interview scheduled");
      setScheduleTarget(null);
      setScheduleDate("");
    } catch {
      toast.error("Failed to schedule");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (candidate: SampleCandidate) => {
    const score = 65 + Math.floor(Math.random() * 30);
    const summary =
      aiSummaryTemplates[Math.floor(Math.random() * aiSummaryTemplates.length)];
    try {
      if (actor) {
        await actor.addAIInterview(
          BigInt(candidate.id),
          BigInt(Date.now() * 1000000),
          true,
          BigInt(score),
          summary,
        );
      }
      setCandidates(
        candidates.map((c) =>
          c.id === candidate.id
            ? {
                ...c,
                aiInterviewStatus: "Completed",
                aiInterviewScore: score,
                aiInterviewSummary: summary,
              }
            : c,
        ),
      );
      toast.success(`AI Interview completed — Score: ${score}/100`);
    } catch {
      toast.error("Failed to mark complete");
    }
  };

  const statusBadge = (c: SampleCandidate) => {
    if (c.aiInterviewStatus === "Completed")
      return (
        <Badge variant="outline" className="text-xs badge-completed">
          Completed
        </Badge>
      );
    if (c.aiInterviewStatus === "Scheduled")
      return (
        <Badge variant="outline" className="text-xs badge-scheduled">
          Scheduled
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-xs badge-pending">
        Not Scheduled
      </Badge>
    );
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 65) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">AI Interview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Schedule and manage AI-powered candidate interviews
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border rounded-lg">
            <Bot className="w-4 h-4 text-purple-500" />
            <span className="font-semibold text-foreground">
              {
                eligible.filter((c) => c.aiInterviewStatus === "Completed")
                  .length
              }
            </span>
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border rounded-lg">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-foreground">
              {
                eligible.filter((c) => c.aiInterviewStatus === "Scheduled")
                  .length
              }
            </span>
            <span className="text-muted-foreground">Scheduled</span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Candidate</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs">Scheduled Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">AI Score</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eligible.map((c) => (
                <TableRow key={c.id} className="data-table-row">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
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
                        <div className="font-medium text-sm">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.currentCompany}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{c.role}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.department}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.aiInterviewDate || "—"}
                  </TableCell>
                  <TableCell>{statusBadge(c)}</TableCell>
                  <TableCell>
                    {c.aiInterviewScore ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-sm ${scoreColor(c.aiInterviewScore)}`}
                        >
                          {c.aiInterviewScore}/100
                        </span>
                        <Progress
                          value={c.aiInterviewScore}
                          className="w-16 h-1.5"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1.5 justify-end">
                      {c.aiInterviewStatus === "Not Scheduled" ||
                      !c.aiInterviewStatus ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5"
                          onClick={() => setScheduleTarget(c)}
                        >
                          <Calendar className="w-3.5 h-3.5" /> Schedule
                        </Button>
                      ) : c.aiInterviewStatus === "Scheduled" ? (
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => handleComplete(c)}
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Mark Complete
                        </Button>
                      ) : null}
                      {c.aiInterviewSummary && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1"
                          onClick={() => setViewSummary(c)}
                        >
                          <Eye className="w-3.5 h-3.5" /> Summary
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {eligible.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground text-sm"
                  >
                    No shortlisted candidates. Screen candidates first.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog
        open={!!scheduleTarget}
        onOpenChange={() => setScheduleTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-500" />
              Schedule AI Interview
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Scheduling for:{" "}
              <span className="font-medium text-foreground">
                {scheduleTarget?.name}
              </span>
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Interview Date *</Label>
              <Input
                type="date"
                className="h-9 text-sm"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-700">
              <Bot className="w-3.5 h-3.5 inline mr-1.5" />
              The AI will conduct a structured interview covering technical,
              behavioral, and cultural fit questions based on the job
              description.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? "Scheduling..." : "Schedule AI Interview"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      {viewSummary && (
        <Dialog open={!!viewSummary} onOpenChange={() => setViewSummary(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                AI Interview Summary — {viewSummary.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center flex-1">
                  <div
                    className={`text-2xl font-display font-bold ${scoreColor(viewSummary.aiInterviewScore!)}`}
                  >
                    {viewSummary.aiInterviewScore}/100
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Overall Score
                  </div>
                </div>
                <div className="flex-1 text-sm text-muted-foreground">
                  <div>Interviewed: {viewSummary.aiInterviewDate}</div>
                  <div className="mt-1">Role: {viewSummary.role}</div>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> AI ASSESSMENT
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {viewSummary.aiInterviewSummary}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
