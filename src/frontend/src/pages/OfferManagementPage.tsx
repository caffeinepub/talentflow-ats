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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  ChevronRight,
  Mail,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OfferStage } from "../backend.d";
import type { SampleCandidate } from "../data/sampleData";
import { useActor } from "../hooks/useActor";

interface OfferManagementPageProps {
  candidates: SampleCandidate[];
  setCandidates: (c: SampleCandidate[]) => void;
}

function OfferStageBadge({ stage }: { stage?: OfferStage }) {
  if (!stage) return null;
  const map: Record<OfferStage, { cls: string; label: string }> = {
    [OfferStage.Draft]: { cls: "badge-draft", label: "Draft" },
    [OfferStage.Sent]: { cls: "badge-sent", label: "Sent" },
    [OfferStage.Accepted]: { cls: "badge-accepted", label: "Accepted" },
    [OfferStage.Rejected]: { cls: "badge-rejected", label: "Rejected" },
    [OfferStage.Negotiating]: {
      cls: "badge-negotiating",
      label: "Negotiating",
    },
  };
  const { cls, label } = map[stage];
  return (
    <Badge variant="outline" className={`text-xs ${cls}`}>
      {label}
    </Badge>
  );
}

export default function OfferManagementPage({
  candidates,
  setCandidates,
}: OfferManagementPageProps) {
  const [createTarget, setCreateTarget] = useState<SampleCandidate | null>(
    null,
  );
  const [form, setForm] = useState({ ctc: "", joiningDate: "" });
  const [submitting, setSubmitting] = useState(false);
  const { actor } = useActor();

  const eligible = candidates.filter(
    (c) => c.finalDecision === "Proceed to Offer",
  );

  const handleCreate = async () => {
    if (!createTarget || !form.ctc || !form.joiningDate) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      if (actor) {
        await actor.addOffer(
          BigInt(createTarget.id),
          form.ctc,
          BigInt(new Date(form.joiningDate).getTime() * 1000000),
          OfferStage.Draft,
        );
      }
      setCandidates(
        candidates.map((c) =>
          c.id === createTarget.id
            ? {
                ...c,
                offerCTC: form.ctc,
                offerJoiningDate: form.joiningDate,
                offerStage: OfferStage.Draft,
                offerCreatedDate: new Date().toISOString().split("T")[0],
              }
            : c,
        ),
      );
      toast.success("Offer created");
      setCreateTarget(null);
      setForm({ ctc: "", joiningDate: "" });
    } catch {
      toast.error("Failed to create offer");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStage = async (
    candidate: SampleCandidate,
    newStage: OfferStage,
  ) => {
    try {
      if (actor) {
        await actor.addOffer(
          BigInt(candidate.id),
          candidate.offerCTC || "",
          BigInt(
            new Date(candidate.offerJoiningDate || "").getTime() * 1000000,
          ),
          newStage,
        );
      }
      setCandidates(
        candidates.map((c) =>
          c.id === candidate.id ? { ...c, offerStage: newStage } : c,
        ),
      );
      toast.success(`Offer marked as ${newStage}`);
    } catch {
      toast.error("Action failed");
    }
  };

  const stageActions = (c: SampleCandidate) => {
    if (!c.offerStage) return null;
    switch (c.offerStage) {
      case OfferStage.Draft:
        return (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => updateStage(c, OfferStage.Sent)}
          >
            <Mail className="w-3.5 h-3.5" /> Mark Sent
          </Button>
        );
      case OfferStage.Sent:
        return (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => updateStage(c, OfferStage.Accepted)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => updateStage(c, OfferStage.Negotiating)}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Negotiate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => updateStage(c, OfferStage.Rejected)}
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </Button>
          </div>
        );
      case OfferStage.Negotiating:
        return (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => updateStage(c, OfferStage.Accepted)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => updateStage(c, OfferStage.Rejected)}
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  // Stage progress indicator
  const StageProgress = ({ stage }: { stage?: OfferStage }) => {
    if (!stage) return null;
    const mainFlow = [OfferStage.Draft, OfferStage.Sent, OfferStage.Accepted];

    return (
      <div className="flex items-center gap-1">
        {mainFlow.map((s, i) => {
          const isActive = s === stage;
          const isPast = mainFlow.indexOf(stage) > i;
          return (
            <div key={s} className="flex items-center gap-1">
              <div
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : isPast
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {s}
              </div>
              {i < mainFlow.length - 1 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          );
        })}
        {stage === OfferStage.Negotiating && (
          <span className="text-xs text-amber-600 ml-1">↻ Negotiating</span>
        )}
        {stage === OfferStage.Rejected && (
          <span className="text-xs text-red-600 ml-1">✕ Rejected</span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Offer Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track offer letters and candidate decisions
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
            {
              eligible.filter((c) => c.offerStage === OfferStage.Accepted)
                .length
            }{" "}
            Accepted
          </span>
          <span className="px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-medium">
            {
              eligible.filter((c) => c.offerStage === OfferStage.Negotiating)
                .length
            }{" "}
            Negotiating
          </span>
          <span className="px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium">
            {
              eligible.filter((c) => c.offerStage === OfferStage.Rejected)
                .length
            }{" "}
            Rejected
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Candidate</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs">CTC</TableHead>
                <TableHead className="text-xs">Joining Date</TableHead>
                <TableHead className="text-xs">Stage</TableHead>
                <TableHead className="text-xs">Progress</TableHead>
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
                  <TableCell className="font-semibold text-sm">
                    {c.offerCTC || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.offerJoiningDate || "—"}
                  </TableCell>
                  <TableCell>
                    <OfferStageBadge stage={c.offerStage} />
                  </TableCell>
                  <TableCell>
                    <StageProgress stage={c.offerStage} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1.5 justify-end">
                      {!c.offerStage && (
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1.5"
                          onClick={() => setCreateTarget(c)}
                        >
                          <Plus className="w-3.5 h-3.5" /> Create Offer
                        </Button>
                      )}
                      {stageActions(c)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {eligible.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground text-sm"
                  >
                    No candidates approved for offer yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Offer Dialog */}
      <Dialog open={!!createTarget} onOpenChange={() => setCreateTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Create Offer — {createTarget?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-muted-foreground">Role</span>
                  <div className="font-medium">{createTarget?.role}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    Department
                  </span>
                  <div className="font-medium">{createTarget?.department}</div>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CTC (Cost to Company) *</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g. 32 LPA"
                value={form.ctc}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctc: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Joining Date *</Label>
              <Input
                type="date"
                className="h-9 text-sm"
                value={form.joiningDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, joiningDate: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? "Creating..." : "Create Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
