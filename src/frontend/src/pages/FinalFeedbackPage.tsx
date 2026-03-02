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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, Star, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InterviewStatus } from "../backend.d";
import type { SampleCandidate } from "../data/sampleData";

interface FinalFeedbackPageProps {
  candidates: SampleCandidate[];
  setCandidates: (c: SampleCandidate[]) => void;
}

function StarRow({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${s <= (value || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function FinalFeedbackPage({
  candidates,
  setCandidates,
}: FinalFeedbackPageProps) {
  const [decisionTarget, setDecisionTarget] = useState<SampleCandidate | null>(
    null,
  );
  const [decision, setDecision] = useState<
    "Proceed to Offer" | "Reject" | "Hold"
  >("Proceed to Offer");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const eligible = candidates.filter(
    (c) =>
      c.round2Status === InterviewStatus.Completed ||
      c.round1Status === InterviewStatus.Completed,
  );

  const handleDecision = async () => {
    if (!decisionTarget) return;
    setSubmitting(true);
    try {
      setCandidates(
        candidates.map((c) =>
          c.id === decisionTarget.id
            ? { ...c, finalDecision: decision, finalNotes: notes }
            : c,
        ),
      );
      toast.success(`Decision recorded: ${decision}`);
      setDecisionTarget(null);
      setNotes("");
    } catch {
      toast.error("Failed to save decision");
    } finally {
      setSubmitting(false);
    }
  };

  const decisionBadge = (d?: string) => {
    if (!d)
      return (
        <Badge variant="outline" className="text-xs badge-pending">
          Pending
        </Badge>
      );
    const map: Record<string, string> = {
      "Proceed to Offer": "badge-approved",
      Reject: "badge-rejected",
      Hold: "badge-onhold",
    };
    return (
      <Badge
        variant="outline"
        className={`text-xs ${map[d] || "badge-pending"}`}
      >
        {d}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Final Feedback</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consolidated interview feedback and final hiring decisions
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
            {
              eligible.filter((c) => c.finalDecision === "Proceed to Offer")
                .length
            }{" "}
            Proceeding
          </span>
          <span className="px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-medium">
            {eligible.filter((c) => c.finalDecision === "Hold").length} On Hold
          </span>
          <span className="px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium">
            {eligible.filter((c) => c.finalDecision === "Reject").length}{" "}
            Rejected
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {eligible.map((c) => (
          <Card
            key={c.id}
            className="border-border hover:shadow-card transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-foreground">
                      {c.name}
                    </h3>
                    {decisionBadge(c.finalDecision)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {c.role} · {c.department} · {c.currentCompany}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Round 1 */}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground">
                          Round 1
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${c.round1Status === InterviewStatus.Completed ? "badge-completed" : "badge-pending"}`}
                        >
                          {c.round1Status || "Pending"}
                        </Badge>
                      </div>
                      {c.round1Status === InterviewStatus.Completed ? (
                        <>
                          <div className="text-xs text-muted-foreground mb-2">
                            Interviewer: {c.round1Interviewer}
                          </div>
                          <StarRow
                            label="Technical"
                            value={c.round1Technical}
                          />
                          <StarRow
                            label="Communication"
                            value={c.round1Communication}
                          />
                          <StarRow
                            label="Cultural Fit"
                            value={c.round1Cultural}
                          />
                          <StarRow label="Overall" value={c.round1Overall} />
                          {c.round1Comments && (
                            <p className="text-xs text-muted-foreground mt-2 italic border-t border-border pt-2">
                              "{c.round1Comments}"
                            </p>
                          )}
                          {c.round1Recommendation && (
                            <div className="text-xs mt-1.5">
                              <span className="text-muted-foreground">
                                Recommendation:{" "}
                              </span>
                              <span className="font-medium text-foreground">
                                {c.round1Recommendation}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Interview not yet completed
                        </p>
                      )}
                    </div>

                    {/* Round 2 */}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground">
                          Round 2
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${c.round2Status === InterviewStatus.Completed ? "badge-completed" : "badge-pending"}`}
                        >
                          {c.round2Status || "Pending"}
                        </Badge>
                      </div>
                      {c.round2Status === InterviewStatus.Completed ? (
                        <>
                          <div className="text-xs text-muted-foreground mb-2">
                            Interviewer: {c.round2Interviewer}
                          </div>
                          <StarRow
                            label="Technical"
                            value={c.round2Technical}
                          />
                          <StarRow
                            label="Communication"
                            value={c.round2Communication}
                          />
                          <StarRow
                            label="Cultural Fit"
                            value={c.round2Cultural}
                          />
                          <StarRow label="Overall" value={c.round2Overall} />
                          {c.round2Comments && (
                            <p className="text-xs text-muted-foreground mt-2 italic border-t border-border pt-2">
                              "{c.round2Comments}"
                            </p>
                          )}
                          {c.round2Recommendation && (
                            <div className="text-xs mt-1.5">
                              <span className="text-muted-foreground">
                                Recommendation:{" "}
                              </span>
                              <span className="font-medium text-foreground">
                                {c.round2Recommendation}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Interview not yet completed
                        </p>
                      )}
                    </div>
                  </div>

                  {c.finalNotes && (
                    <div className="mt-3 text-sm text-muted-foreground bg-muted/30 rounded p-2.5">
                      <span className="font-medium text-foreground text-xs">
                        HR Notes:{" "}
                      </span>
                      {c.finalNotes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => {
                      setDecisionTarget(c);
                      setDecision(c.finalDecision || "Proceed to Offer");
                      setNotes(c.finalNotes || "");
                    }}
                  >
                    {c.finalDecision ? "Update Decision" : "Record Decision"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {eligible.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-lg text-muted-foreground">
            <p className="text-sm">
              No candidates have completed interviews yet
            </p>
          </div>
        )}
      </div>

      {/* Decision Dialog */}
      <Dialog
        open={!!decisionTarget}
        onOpenChange={() => setDecisionTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Final Decision — {decisionTarget?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Decision *</Label>
              <Select
                value={decision}
                onValueChange={(v) => setDecision(v as typeof decision)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proceed to Offer">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                      Proceed to Offer
                    </span>
                  </SelectItem>
                  <SelectItem value="Hold">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" /> Hold
                    </span>
                  </SelectItem>
                  <SelectItem value="Reject">
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" /> Reject
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">HR Notes</Label>
              <Textarea
                className="text-sm min-h-20 resize-none"
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleDecision} disabled={submitting}>
              {submitting ? "Saving..." : "Save Decision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
