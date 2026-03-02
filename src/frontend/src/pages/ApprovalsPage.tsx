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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserRole } from "../App";
import { IndentStatus } from "../backend.d";
import type { SampleIndent } from "../data/sampleData";
import { useActor } from "../hooks/useActor";

interface ApprovalsPageProps {
  indents: SampleIndent[];
  setIndents: (indents: SampleIndent[]) => void;
  currentRole: UserRole;
}

export default function ApprovalsPage({
  indents,
  setIndents,
  currentRole,
}: ApprovalsPageProps) {
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectTarget, setRejectTarget] = useState<{
    indent: SampleIndent;
    level: "bh" | "dir";
  } | null>(null);
  const { actor } = useActor();

  const bhQueue = indents.filter(
    (i) => i.status === IndentStatus.BusinessHeadPending,
  );
  const dirQueue = indents.filter(
    (i) => i.status === IndentStatus.DirectorPending,
  );

  const handleApprove = async (indent: SampleIndent, level: "bh" | "dir") => {
    const newStatus =
      level === "bh" ? IndentStatus.DirectorPending : IndentStatus.Approved;
    const approver = level === "bh" ? "Business Head" : "Director";
    try {
      if (actor) {
        await actor.updateIndentStatus(BigInt(indent.id), newStatus, approver);
      }
      setIndents(
        indents.map((i) =>
          i.id === indent.id ? { ...i, status: newStatus, approver } : i,
        ),
      );
      toast.success(
        `Indent approved${level === "bh" ? ", forwarded to Director" : " — Ready to hire!"}`,
      );
    } catch {
      toast.error("Action failed");
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      if (actor) {
        await actor.updateIndentStatus(
          BigInt(rejectTarget.indent.id),
          IndentStatus.Rejected,
          "System",
        );
      }
      setIndents(
        indents.map((i) =>
          i.id === rejectTarget.indent.id
            ? { ...i, status: IndentStatus.Rejected }
            : i,
        ),
      );
      toast.success("Indent rejected");
    } catch {
      toast.error("Action failed");
    }
    setRejectTarget(null);
    setRejectNotes("");
  };

  const canActBH = currentRole === "Business Head" || currentRole === "HR";
  const canActDir = currentRole === "Director" || currentRole === "HR";

  const IndentApprovalCard = ({
    indent,
    level,
  }: { indent: SampleIndent; level: "bh" | "dir" }) => {
    const canAct = level === "bh" ? canActBH : canActDir;
    return (
      <Card className="border-border hover:shadow-card transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-semibold text-foreground text-base">
                  {indent.role}
                </h3>
                {level === "dir" && (
                  <Badge
                    variant="outline"
                    className="text-xs badge-dir-pending"
                  >
                    Dir. Review
                  </Badge>
                )}
                {level === "bh" && (
                  <Badge variant="outline" className="text-xs badge-bh-pending">
                    BH Review
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {indent.department}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {indent.positions} position
                  {indent.positions > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {indent.experienceRange}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {indent.createdDate}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-2">
                {indent.jobDescription}
              </p>
              {indent.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {indent.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          {canAct ? (
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                size="sm"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleApprove(indent, level)}
              >
                <CheckCircle2 className="w-4 h-4" />
                {level === "bh"
                  ? "Approve & Send to Director"
                  : "Final Approve"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setRejectTarget({ indent, level })}
              >
                <XCircle className="w-4 h-4" /> Reject
              </Button>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3.5 h-3.5" />
              Switch role to {level === "bh" ? "Business Head" : "Director"} to
              take action
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Approvals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve hiring indents
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          Viewing as:{" "}
          <span className="font-semibold text-foreground">{currentRole}</span>
        </div>
      </div>

      <Tabs defaultValue="bh">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="bh" className="text-sm gap-2">
            Business Head
            {bhQueue.length > 0 && (
              <Badge className="text-xs h-4 px-1.5 bg-amber-500 text-white">
                {bhQueue.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="dir" className="text-sm gap-2">
            Director
            {dirQueue.length > 0 && (
              <Badge className="text-xs h-4 px-1.5 bg-orange-500 text-white">
                {dirQueue.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bh" className="mt-5 space-y-4">
          {bhQueue.length === 0 ? (
            <EmptyQueue label="No indents awaiting Business Head approval" />
          ) : (
            bhQueue.map((indent) => (
              <IndentApprovalCard key={indent.id} indent={indent} level="bh" />
            ))
          )}
        </TabsContent>

        <TabsContent value="dir" className="mt-5 space-y-4">
          {dirQueue.length === 0 ? (
            <EmptyQueue label="No indents awaiting Director approval" />
          ) : (
            dirQueue.map((indent) => (
              <IndentApprovalCard key={indent.id} indent={indent} level="dir" />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-red-600">
              Reject Indent
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Rejecting:{" "}
              <span className="font-medium text-foreground">
                {rejectTarget?.indent.role}
              </span>{" "}
              ({rejectTarget?.indent.department})
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Rejection Notes</Label>
              <Textarea
                id="reject-notes"
                className="text-sm min-h-20 resize-none"
                placeholder="Reason for rejection..."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyQueue({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg bg-muted/20">
      <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">All caught up!</p>
    </div>
  );
}
