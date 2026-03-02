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
import { Textarea } from "@/components/ui/textarea";
import { Eye, Plus, Tag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { IndentStatus } from "../backend.d";
import type { SampleIndent } from "../data/sampleData";
import { useActor } from "../hooks/useActor";

interface IndentsPageProps {
  indents: SampleIndent[];
  setIndents: (indents: SampleIndent[]) => void;
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

const departments = [
  "Engineering",
  "Product",
  "Sales",
  "Finance",
  "Marketing",
  "Human Resources",
  "Operations",
  "Design",
  "Legal",
];

export default function IndentsPage({ indents, setIndents }: IndentsPageProps) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [viewIndent, setViewIndent] = useState<SampleIndent | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    department: "",
    role: "",
    positions: "",
    experienceRange: "",
    jobDescription: "",
    requiredSkills: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const { actor } = useActor();

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.requiredSkills.includes(s)) {
      setForm((f) => ({ ...f, requiredSkills: [...f.requiredSkills, s] }));
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      requiredSkills: f.requiredSkills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async () => {
    if (
      !form.department ||
      !form.role ||
      !form.positions ||
      !form.jobDescription
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      if (actor) {
        await actor.createIndent(
          form.department,
          form.role,
          BigInt(Number.parseInt(form.positions)),
          form.jobDescription,
          form.requiredSkills,
          form.experienceRange,
        );
      }
      const newIndent: SampleIndent = {
        id: Math.max(...indents.map((i) => i.id), 0) + 1,
        department: form.department,
        role: form.role,
        positions: Number.parseInt(form.positions),
        experienceRange: form.experienceRange,
        jobDescription: form.jobDescription,
        requiredSkills: form.requiredSkills,
        status: IndentStatus.Draft,
        createdDate: new Date().toISOString().split("T")[0],
      };
      setIndents([...indents, newIndent]);
      toast.success("Indent created successfully");
      setShowNewModal(false);
      setForm({
        department: "",
        role: "",
        positions: "",
        experienceRange: "",
        jobDescription: "",
        requiredSkills: [],
      });
    } catch {
      toast.error("Failed to create indent");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Indents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage hiring requisitions across departments
          </p>
        </div>
        <Button onClick={() => setShowNewModal(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Indent
        </Button>
      </div>

      {/* Status Summary */}
      <div className="flex gap-2 flex-wrap">
        {Object.values(IndentStatus).map((status) => {
          const count = indents.filter((i) => i.status === status).length;
          return (
            <div
              key={status}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-md text-xs"
            >
              <IndentStatusBadge status={status} />
              <span className="font-semibold text-foreground">{count}</span>
            </div>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-12 text-xs">ID</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs">Department</TableHead>
                <TableHead className="text-xs">Positions</TableHead>
                <TableHead className="text-xs">Experience</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Created</TableHead>
                <TableHead className="text-xs text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indents.map((indent) => (
                <TableRow key={indent.id} className="data-table-row">
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    #{indent.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-foreground">
                      {indent.role}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-48">
                      {indent.jobDescription.slice(0, 60)}…
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{indent.department}</TableCell>
                  <TableCell className="text-sm text-center">
                    {indent.positions}
                  </TableCell>
                  <TableCell className="text-sm">
                    {indent.experienceRange}
                  </TableCell>
                  <TableCell>
                    <IndentStatusBadge status={indent.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {indent.createdDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={() => setViewIndent(indent)}
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Indent Dialog */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Create New Indent
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Department *</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, department: v }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Role Title *</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="e.g. Senior Engineer"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Number of Positions *</Label>
                <Input
                  className="h-9 text-sm"
                  type="number"
                  min="1"
                  placeholder="e.g. 2"
                  value={form.positions}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, positions: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Experience Range</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="e.g. 3-6 years"
                  value={form.experienceRange}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, experienceRange: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Job Description *</Label>
              <Textarea
                className="text-sm min-h-24 resize-none"
                placeholder="Describe the role, responsibilities, and requirements..."
                value={form.jobDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, jobDescription: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  className="h-9 text-sm"
                  placeholder="Add a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSkill}
                  className="h-9 px-3"
                >
                  <Tag className="w-3.5 h-3.5" />
                </Button>
              </div>
              {form.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.requiredSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="gap-1 text-xs"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Creating..." : "Create Indent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Indent Dialog */}
      {viewIndent && (
        <Dialog open={!!viewIndent} onOpenChange={() => setViewIndent(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {viewIndent.role}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {viewIndent.department}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <IndentStatusBadge status={viewIndent.status} />
              </div>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/40 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Positions</div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {viewIndent.positions}
                  </div>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">
                    Experience
                  </div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {viewIndent.experienceRange || "—"}
                  </div>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {viewIndent.createdDate}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1.5">
                  JOB DESCRIPTION
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {viewIndent.jobDescription}
                </p>
              </div>
              {viewIndent.requiredSkills.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1.5">
                    REQUIRED SKILLS
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {viewIndent.requiredSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {viewIndent.approver && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Approved by:</span>{" "}
                  {viewIndent.approver}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
