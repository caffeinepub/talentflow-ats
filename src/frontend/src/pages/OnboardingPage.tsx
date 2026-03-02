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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InductionStatus, OfferStage, OnboardingStatus } from "../backend.d";
import type { OnboardingDay, SampleCandidate } from "../data/sampleData";
import { useActor } from "../hooks/useActor";

interface OnboardingPageProps {
  candidates: SampleCandidate[];
  setCandidates: (c: SampleCandidate[]) => void;
}

const DEFAULT_DAYS: OnboardingDay[] = [
  {
    dayNumber: 1,
    moduleName: "Company Culture & Systems Overview",
    trainer: "",
    status: OnboardingStatus.Pending,
    notes: "",
  },
  {
    dayNumber: 2,
    moduleName: "Role-Specific Tools & Processes",
    trainer: "",
    status: OnboardingStatus.Pending,
    notes: "",
  },
  {
    dayNumber: 3,
    moduleName: "First Project Kickoff & Team Integration",
    trainer: "",
    status: OnboardingStatus.Pending,
    notes: "",
  },
];

function DayStatusBadge({ status }: { status: OnboardingStatus }) {
  const map: Record<
    OnboardingStatus,
    { cls: string; icon: React.ReactNode; label: string }
  > = {
    [OnboardingStatus.Pending]: {
      cls: "badge-pending",
      icon: <Clock className="w-3 h-3" />,
      label: "Pending",
    },
    [OnboardingStatus.InProgress]: {
      cls: "badge-scheduled",
      icon: <Loader2 className="w-3 h-3" />,
      label: "In Progress",
    },
    [OnboardingStatus.Completed]: {
      cls: "badge-completed",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Completed",
    },
  };
  const { cls, icon, label } = map[status];
  return (
    <Badge
      variant="outline"
      className={`text-xs flex items-center gap-1 ${cls}`}
    >
      {icon}
      {label}
    </Badge>
  );
}

export default function OnboardingPage({
  candidates,
  setCandidates,
}: OnboardingPageProps) {
  const [editTarget, setEditTarget] = useState<{
    candidate: SampleCandidate;
    dayIndex: number;
  } | null>(null);
  const [form, setForm] = useState({ moduleName: "", trainer: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const { actor } = useActor();

  const eligible = candidates.filter(
    (c) =>
      c.inductionStatus === InductionStatus.Completed ||
      c.offerStage === OfferStage.Accepted,
  );

  const getDays = (c: SampleCandidate) => c.onboardingDays || DEFAULT_DAYS;

  const getProgress = (c: SampleCandidate) => {
    const days = getDays(c);
    const completed = days.filter(
      (d) => d.status === OnboardingStatus.Completed,
    ).length;
    return Math.round((completed / days.length) * 100);
  };

  const handleStartEdit = (candidate: SampleCandidate, dayIndex: number) => {
    const days = getDays(candidate);
    const day = days[dayIndex];
    setForm({
      moduleName: day.moduleName,
      trainer: day.trainer,
      notes: day.notes,
    });
    setEditTarget({ candidate, dayIndex });
  };

  const handleMarkDay = async (status: OnboardingStatus) => {
    if (!editTarget) return;
    setSubmitting(true);
    const { candidate, dayIndex } = editTarget;
    const days = getDays(candidate);
    const day = days[dayIndex];
    try {
      if (actor) {
        await actor.addOnboardingDay(
          BigInt(day.dayNumber),
          BigInt(candidate.id),
          form.moduleName || day.moduleName,
          status,
          form.trainer || day.trainer,
          form.notes,
        );
      }
      const updatedDays = days.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              moduleName: form.moduleName || d.moduleName,
              trainer: form.trainer || d.trainer,
              status,
              notes: form.notes,
            }
          : d,
      );
      setCandidates(
        candidates.map((c) =>
          c.id === candidate.id ? { ...c, onboardingDays: updatedDays } : c,
        ),
      );
      toast.success(
        `Day ${day.dayNumber} ${status === OnboardingStatus.Completed ? "completed" : "started"}`,
      );
      setEditTarget(null);
    } catch {
      toast.error("Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const initOnboarding = (candidateId: number) => {
    setCandidates(
      candidates.map((c) =>
        c.id === candidateId ? { ...c, onboardingDays: DEFAULT_DAYS } : c,
      ),
    );
    toast.success("Onboarding plan initialized");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Onboarding — 3-Day Training Program</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Structured onboarding process for new joiners
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
            {eligible.filter((c) => getProgress(c) === 100).length} Completed
          </span>
          <span className="px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium">
            {
              eligible.filter((c) => getProgress(c) > 0 && getProgress(c) < 100)
                .length
            }{" "}
            In Progress
          </span>
        </div>
      </div>

      {eligible.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-lg text-muted-foreground">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No candidates ready for onboarding</p>
        </div>
      )}

      <div className="space-y-5">
        {eligible.map((c) => {
          const days = getDays(c);
          const progress = getProgress(c);

          return (
            <Card key={c.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
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
                      <CardTitle className="font-display text-base">
                        {c.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {c.role} · {c.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">
                        Overall Progress
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-28 h-2" />
                        <span
                          className={`text-xs font-bold ${progress === 100 ? "text-emerald-600" : "text-foreground"}`}
                        >
                          {progress}%
                        </span>
                      </div>
                    </div>
                    {progress === 100 && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Onboarded
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!c.onboardingDays ? (
                  <div className="flex items-center justify-center py-6 border border-dashed border-border rounded-lg">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => initOnboarding(c.id)}
                    >
                      <Plus className="w-3.5 h-3.5" /> Initialize Onboarding
                      Plan
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {days.map((day, idx) => (
                      <div
                        key={day.dayNumber}
                        className={`rounded-lg border p-4 transition-all ${
                          day.status === OnboardingStatus.Completed
                            ? "border-emerald-200 bg-emerald-50/30"
                            : day.status === OnboardingStatus.InProgress
                              ? "border-blue-200 bg-blue-50/30"
                              : "border-border bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              day.status === OnboardingStatus.Completed
                                ? "bg-emerald-500 text-white"
                                : day.status === OnboardingStatus.InProgress
                                  ? "bg-blue-500 text-white"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {day.dayNumber}
                          </div>
                          <DayStatusBadge status={day.status} />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Module
                            </div>
                            <div className="text-sm font-medium text-foreground leading-snug">
                              {day.moduleName}
                            </div>
                          </div>
                          {day.trainer && (
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Trainer
                              </div>
                              <div className="text-sm text-foreground">
                                {day.trainer}
                              </div>
                            </div>
                          )}
                          {day.notes && (
                            <p className="text-xs text-muted-foreground italic">
                              {day.notes}
                            </p>
                          )}
                        </div>
                        <div className="mt-3">
                          {day.status === OnboardingStatus.Pending && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-7 text-xs gap-1.5"
                              onClick={() => handleStartEdit(c, idx)}
                            >
                              <Loader2 className="w-3 h-3" /> Start Day{" "}
                              {day.dayNumber}
                            </Button>
                          )}
                          {day.status === OnboardingStatus.InProgress && (
                            <Button
                              size="sm"
                              className="w-full h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleStartEdit(c, idx)}
                            >
                              <CheckCircle2 className="w-3 h-3" /> Mark Complete
                            </Button>
                          )}
                          {day.status === OnboardingStatus.Completed && (
                            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium py-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Day{" "}
                              {day.dayNumber} Complete
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit/Complete Day Dialog */}
      {editTarget && (
        <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                Day{" "}
                {editTarget.candidate.onboardingDays?.[editTarget.dayIndex]
                  ?.dayNumber || editTarget.dayIndex + 1}{" "}
                — {editTarget.candidate.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Module Name</Label>
                <Input
                  className="h-9 text-sm"
                  value={form.moduleName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, moduleName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Trainer</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="Trainer name"
                  value={form.trainer}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trainer: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea
                  className="text-sm min-h-16 resize-none"
                  placeholder="Training notes..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => handleMarkDay(OnboardingStatus.InProgress)}
                disabled={submitting}
              >
                <Loader2 className="w-3.5 h-3.5 mr-1.5" /> Mark In Progress
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleMarkDay(OnboardingStatus.Completed)}
                disabled={submitting}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
