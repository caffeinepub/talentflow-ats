import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MessageSquare, Star, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InterviewStatus } from "../backend.d";
import type { SampleCandidate } from "../data/sampleData";
import { useActor } from "../hooks/useActor";

interface InterviewLineupPageProps {
  candidates: SampleCandidate[];
  setCandidates: (c: SampleCandidate[]) => void;
}

interface ScheduleForm {
  interviewer: string;
  date: string;
}

interface FeedbackForm {
  technical: number;
  communication: number;
  cultural: number;
  overall: number;
  comments: string;
  recommendation: string;
}

function StarRating({
  value,
  onChange,
}: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`transition-colors ${star <= value ? "text-amber-400" : "text-gray-300"} ${onChange ? "hover:text-amber-300 cursor-pointer" : "cursor-default"}`}
        >
          <Star className="w-4 h-4 fill-current" />
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status?: InterviewStatus | string }) {
  if (!status)
    return (
      <Badge variant="outline" className="text-xs badge-pending">
        Not Scheduled
      </Badge>
    );
  const map: Record<string, string> = {
    [InterviewStatus.Scheduled]: "badge-scheduled",
    [InterviewStatus.Completed]: "badge-completed",
    [InterviewStatus.Cancelled]: "badge-rejected",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs ${map[status] || "badge-pending"}`}
    >
      {status}
    </Badge>
  );
}

export default function InterviewLineupPage({
  candidates,
  setCandidates,
}: InterviewLineupPageProps) {
  const [scheduleTarget, setScheduleTarget] = useState<{
    candidate: SampleCandidate;
    round: 1 | 2;
  } | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<{
    candidate: SampleCandidate;
    round: 1 | 2;
  } | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    interviewer: "",
    date: "",
  });
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    technical: 0,
    communication: 0,
    cultural: 0,
    overall: 0,
    comments: "",
    recommendation: "Proceed",
  });
  const [submitting, setSubmitting] = useState(false);
  const { actor } = useActor();

  const aiDoneCandidates = candidates.filter(
    (c) => c.aiInterviewStatus === "Completed",
  );

  const round2Eligible = candidates.filter(
    (c) => c.round1Status === InterviewStatus.Completed,
  );

  const handleSchedule = async () => {
    if (!scheduleTarget || !scheduleForm.interviewer || !scheduleForm.date) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      const { candidate, round } = scheduleTarget;
      if (actor) {
        await actor.addInterviewRound(
          BigInt(round),
          BigInt(candidate.id),
          scheduleForm.interviewer,
          BigInt(new Date(scheduleForm.date).getTime() * 1000000),
          InterviewStatus.Scheduled,
          BigInt(0),
          BigInt(0),
          BigInt(0),
          BigInt(0),
          "",
          "",
        );
      }
      const update =
        round === 1
          ? {
              round1Status: InterviewStatus.Scheduled,
              round1Interviewer: scheduleForm.interviewer,
              round1Date: scheduleForm.date,
            }
          : {
              round2Status: InterviewStatus.Scheduled,
              round2Interviewer: scheduleForm.interviewer,
              round2Date: scheduleForm.date,
            };
      setCandidates(
        candidates.map((c) =>
          c.id === candidate.id ? { ...c, ...update } : c,
        ),
      );
      toast.success(`Round ${round} interview scheduled`);
      setScheduleTarget(null);
    } catch {
      toast.error("Failed to schedule");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedback = async () => {
    if (!feedbackTarget) return;
    if (!feedbackForm.technical || !feedbackForm.overall) {
      toast.error("Please add ratings");
      return;
    }
    setSubmitting(true);
    try {
      const { candidate, round } = feedbackTarget;
      if (actor) {
        await actor.addInterviewRound(
          BigInt(round),
          BigInt(candidate.id),
          round === 1
            ? candidate.round1Interviewer!
            : candidate.round2Interviewer!,
          BigInt(Date.now() * 1000000),
          InterviewStatus.Completed,
          BigInt(feedbackForm.technical),
          BigInt(feedbackForm.communication),
          BigInt(feedbackForm.cultural),
          BigInt(feedbackForm.overall),
          feedbackForm.comments,
          feedbackForm.recommendation,
        );
      }
      const update =
        round === 1
          ? {
              round1Status: InterviewStatus.Completed,
              round1Technical: feedbackForm.technical,
              round1Communication: feedbackForm.communication,
              round1Cultural: feedbackForm.cultural,
              round1Overall: feedbackForm.overall,
              round1Comments: feedbackForm.comments,
              round1Recommendation: feedbackForm.recommendation,
            }
          : {
              round2Status: InterviewStatus.Completed,
              round2Technical: feedbackForm.technical,
              round2Communication: feedbackForm.communication,
              round2Cultural: feedbackForm.cultural,
              round2Overall: feedbackForm.overall,
              round2Comments: feedbackForm.comments,
              round2Recommendation: feedbackForm.recommendation,
            };
      setCandidates(
        candidates.map((c) =>
          c.id === candidate.id ? { ...c, ...update } : c,
        ),
      );
      toast.success(`Round ${round} feedback saved`);
      setFeedbackTarget(null);
    } catch {
      toast.error("Failed to save feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const CandidateRow = ({ c, round }: { c: SampleCandidate; round: 1 | 2 }) => {
    const status = round === 1 ? c.round1Status : c.round2Status;
    const interviewer = round === 1 ? c.round1Interviewer : c.round2Interviewer;
    const date = round === 1 ? c.round1Date : c.round2Date;
    const overall = round === 1 ? c.round1Overall : c.round2Overall;
    const isScheduled = status === InterviewStatus.Scheduled;
    const isCompleted = status === InterviewStatus.Completed;

    return (
      <TableRow className="data-table-row">
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
              <div className="text-xs text-muted-foreground">{c.role}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-sm">{interviewer || "—"}</TableCell>
        <TableCell className="text-sm">{date || "—"}</TableCell>
        <TableCell>
          <StatusBadge status={status} />
        </TableCell>
        <TableCell>
          {overall ? (
            <div className="flex items-center gap-1.5">
              <StarRating value={overall} />
              <span className="text-xs text-muted-foreground">{overall}/5</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex gap-1.5 justify-end">
            {!status && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                onClick={() => setScheduleTarget({ candidate: c, round })}
              >
                <Calendar className="w-3.5 h-3.5" /> Schedule
              </Button>
            )}
            {isScheduled && (
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setFeedbackTarget({ candidate: c, round })}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Add Feedback
              </Button>
            )}
            {isCompleted && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1.5"
                onClick={() => setFeedbackTarget({ candidate: c, round })}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Edit Feedback
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Interview Lineup</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Schedule interviews and collect structured feedback
          </p>
        </div>
      </div>

      <Tabs defaultValue="round1">
        <TabsList>
          <TabsTrigger value="round1" className="gap-2">
            <Users className="w-4 h-4" /> Round 1
            <Badge variant="secondary" className="text-xs">
              {aiDoneCandidates.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="round2" className="gap-2">
            <Users className="w-4 h-4" /> Round 2
            <Badge variant="secondary" className="text-xs">
              {round2Eligible.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="round1" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Round 1 — Technical/Functional Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">Candidate</TableHead>
                    <TableHead className="text-xs">Interviewer</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Overall Rating</TableHead>
                    <TableHead className="text-xs text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aiDoneCandidates.map((c) => (
                    <CandidateRow key={c.id} c={c} round={1} />
                  ))}
                  {aiDoneCandidates.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground text-sm"
                      >
                        Complete AI interviews first
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="round2" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Round 2 — Leadership/Culture Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">Candidate</TableHead>
                    <TableHead className="text-xs">Interviewer</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Overall Rating</TableHead>
                    <TableHead className="text-xs text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {round2Eligible.map((c) => (
                    <CandidateRow key={c.id} c={c} round={2} />
                  ))}
                  {round2Eligible.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground text-sm"
                      >
                        Complete Round 1 interviews to unlock Round 2
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog
        open={!!scheduleTarget}
        onOpenChange={() => setScheduleTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Schedule Round {scheduleTarget?.round} Interview
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Candidate:{" "}
              <span className="font-medium text-foreground">
                {scheduleTarget?.candidate.name}
              </span>
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Interviewer Name *</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g. Vikram Patel"
                value={scheduleForm.interviewer}
                onChange={(e) =>
                  setScheduleForm((f) => ({
                    ...f,
                    interviewer: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Interview Date *</Label>
              <Input
                type="date"
                className="h-9 text-sm"
                value={scheduleForm.date}
                onChange={(e) =>
                  setScheduleForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={submitting}>
              {submitting ? "Saving..." : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog
        open={!!feedbackTarget}
        onOpenChange={() => setFeedbackTarget(null)}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Round {feedbackTarget?.round} Feedback —{" "}
              {feedbackTarget?.candidate.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { key: "technical" as const, label: "Technical Skills" },
              { key: "communication" as const, label: "Communication" },
              { key: "cultural" as const, label: "Cultural Fit" },
              { key: "overall" as const, label: "Overall Rating" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
                <StarRating
                  value={feedbackForm[key]}
                  onChange={(v) => setFeedbackForm((f) => ({ ...f, [key]: v }))}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs">Comments</Label>
              <Textarea
                className="text-sm min-h-20 resize-none"
                placeholder="Detailed feedback..."
                value={feedbackForm.comments}
                onChange={(e) =>
                  setFeedbackForm((f) => ({ ...f, comments: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Recommendation</Label>
              <Select
                value={feedbackForm.recommendation}
                onValueChange={(v) =>
                  setFeedbackForm((f) => ({ ...f, recommendation: v }))
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proceed">Proceed</SelectItem>
                  <SelectItem value="Proceed with consideration">
                    Proceed with consideration
                  </SelectItem>
                  <SelectItem value="Hold">Hold</SelectItem>
                  <SelectItem value="Reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleFeedback} disabled={submitting}>
              {submitting ? "Saving..." : "Save Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
