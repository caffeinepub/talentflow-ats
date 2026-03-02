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
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Calendar, CheckCircle2, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InductionStatus, OfferStage } from "../backend.d";
import type { SampleCandidate } from "../data/sampleData";
import { useActor } from "../hooks/useActor";

interface InductionPageProps {
  candidates: SampleCandidate[];
  setCandidates: (c: SampleCandidate[]) => void;
}

const DEFAULT_TOPICS = [
  "Company Overview",
  "HR Policies",
  "IT Setup",
  "Compliance Training",
  "Team Introduction",
  "Safety & Security",
];

export default function InductionPage({
  candidates,
  setCandidates,
}: InductionPageProps) {
  const [scheduleTarget, setScheduleTarget] = useState<SampleCandidate | null>(
    null,
  );
  const [form, setForm] = useState({
    date: "",
    topics: [] as string[],
    notes: "",
  });
  const [customTopic, setCustomTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { actor } = useActor();

  const eligible = candidates.filter(
    (c) => c.offerStage === OfferStage.Accepted,
  );

  const toggleTopic = (topic: string) => {
    setForm((f) => ({
      ...f,
      topics: f.topics.includes(topic)
        ? f.topics.filter((t) => t !== topic)
        : [...f.topics, topic],
    }));
  };

  const addCustomTopic = () => {
    const t = customTopic.trim();
    if (t && !form.topics.includes(t)) {
      setForm((f) => ({ ...f, topics: [...f.topics, t] }));
    }
    setCustomTopic("");
  };

  const handleSchedule = async () => {
    if (!scheduleTarget || !form.date || form.topics.length === 0) {
      toast.error("Please fill date and select topics");
      return;
    }
    setSubmitting(true);
    try {
      if (actor) {
        await actor.addInduction(
          BigInt(scheduleTarget.id),
          BigInt(new Date(form.date).getTime() * 1000000),
          form.topics,
          InductionStatus.Scheduled,
          form.notes,
        );
      }
      setCandidates(
        candidates.map((c) =>
          c.id === scheduleTarget.id
            ? {
                ...c,
                inductionStatus: InductionStatus.Scheduled,
                inductionDate: form.date,
                inductionTopics: form.topics,
                inductionNotes: form.notes,
              }
            : c,
        ),
      );
      toast.success("Induction scheduled");
      setScheduleTarget(null);
      setForm({ date: "", topics: [], notes: "" });
    } catch {
      toast.error("Failed to schedule induction");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (candidate: SampleCandidate) => {
    try {
      if (actor) {
        await actor.addInduction(
          BigInt(candidate.id),
          BigInt(new Date(candidate.inductionDate || "").getTime() * 1000000),
          candidate.inductionTopics || [],
          InductionStatus.Completed,
          candidate.inductionNotes || "",
        );
      }
      setCandidates(
        candidates.map((c) =>
          c.id === candidate.id
            ? { ...c, inductionStatus: InductionStatus.Completed }
            : c,
        ),
      );
      toast.success("Induction marked as completed");
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Induction</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Schedule and manage induction sessions for new joiners
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="px-2.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
            {
              eligible.filter(
                (c) => c.inductionStatus === InductionStatus.Scheduled,
              ).length
            }{" "}
            Scheduled
          </span>
          <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
            {
              eligible.filter(
                (c) => c.inductionStatus === InductionStatus.Completed,
              ).length
            }{" "}
            Completed
          </span>
        </div>
      </div>

      {eligible.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-lg text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No candidates with accepted offers</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eligible.map((c) => (
          <Card
            key={c.id}
            className="border-border hover:shadow-card transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
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
                    <div className="font-display font-semibold text-foreground">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.role} · Joining: {c.offerJoiningDate || "TBD"}
                    </div>
                  </div>
                </div>
                {c.inductionStatus ? (
                  <Badge
                    variant="outline"
                    className={`text-xs ${c.inductionStatus === InductionStatus.Completed ? "badge-completed" : "badge-scheduled"}`}
                  >
                    {c.inductionStatus}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs badge-pending">
                    Not Scheduled
                  </Badge>
                )}
              </div>

              {c.inductionDate && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium text-foreground">
                      {c.inductionDate}
                    </span>
                  </div>
                  {c.inductionTopics && c.inductionTopics.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1.5">
                        Topics:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {c.inductionTopics.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="text-xs"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.inductionNotes && (
                    <p className="text-xs text-muted-foreground italic bg-muted/30 rounded p-2">
                      {c.inductionNotes}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {!c.inductionStatus && (
                  <Button
                    size="sm"
                    className="gap-1.5 flex-1 h-8 text-xs"
                    onClick={() => setScheduleTarget(c)}
                  >
                    <Plus className="w-3.5 h-3.5" /> Schedule Induction
                  </Button>
                )}
                {c.inductionStatus === InductionStatus.Scheduled && (
                  <Button
                    size="sm"
                    className="gap-1.5 flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleComplete(c)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                  </Button>
                )}
                {c.inductionStatus === InductionStatus.Completed && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Induction Completed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Dialog */}
      <Dialog
        open={!!scheduleTarget}
        onOpenChange={() => setScheduleTarget(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              Schedule Induction — {scheduleTarget?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Induction Date *</Label>
              <Input
                type="date"
                className="h-9 text-sm"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Topics *</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_TOPICS.map((topic) => (
                  <button
                    type="button"
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.topics.includes(topic)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  className="h-8 text-xs"
                  placeholder="Custom topic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTopic();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={addCustomTopic}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
              {form.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.topics
                    .filter((t) => !DEFAULT_TOPICS.includes(t))
                    .map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="gap-1 text-xs"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              topics: f.topics.filter((x) => x !== t),
                            }))
                          }
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea
                className="text-sm min-h-16 resize-none"
                placeholder="Additional notes..."
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={submitting}>
              {submitting ? "Scheduling..." : "Schedule Induction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
