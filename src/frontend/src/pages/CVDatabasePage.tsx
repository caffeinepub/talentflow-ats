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
import { Eye, Globe, Plus, Tag, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Source } from "../backend.d";
import type { SampleCandidate, SampleIndent } from "../data/sampleData";
import { useActor } from "../hooks/useActor";

interface CVDatabasePageProps {
  candidates: SampleCandidate[];
  setCandidates: (candidates: SampleCandidate[]) => void;
  indents: SampleIndent[];
}

export default function CVDatabasePage({
  candidates,
  setCandidates,
  indents,
}: CVDatabasePageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewCandidate, setViewCandidate] = useState<SampleCandidate | null>(
    null,
  );
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    experienceYears: "",
    skills: [] as string[],
    currentCompany: "",
    indentId: "",
    source: "Manual",
  });
  const [submitting, setSubmitting] = useState(false);
  const { actor } = useActor();

  const manualCandidates = candidates.filter((c) => c.source === Source.Manual);
  const websiteCandidates = candidates.filter(
    (c) => c.source === Source.Website,
  );

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    }
    setSkillInput("");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.indentId) {
      toast.error("Please fill required fields");
      return;
    }
    setSubmitting(true);
    try {
      const indent = indents.find(
        (i) => i.id === Number.parseInt(form.indentId),
      );
      if (!indent) throw new Error("Indent not found");
      if (actor) {
        await actor.createCandidate(
          form.name,
          form.email,
          form.phone,
          BigInt(Number.parseInt(form.experienceYears) || 0),
          form.skills,
          form.currentCompany,
          form.source === "Website" ? Source.Website : Source.Manual,
          BigInt(Number.parseInt(form.indentId)),
        );
      }
      const newCandidate: SampleCandidate = {
        id: Math.max(...candidates.map((c) => c.id), 0) + 1,
        name: form.name,
        email: form.email,
        phone: form.phone,
        experienceYears: Number.parseInt(form.experienceYears) || 0,
        skills: form.skills,
        currentCompany: form.currentCompany,
        source: form.source === "Website" ? Source.Website : Source.Manual,
        indentId: Number.parseInt(form.indentId),
        role: indent.role,
        department: indent.department,
      };
      setCandidates([...candidates, newCandidate]);
      toast.success("Candidate added successfully");
      setShowAddModal(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        experienceYears: "",
        skills: [],
        currentCompany: "",
        indentId: "",
        source: "Manual",
      });
    } catch {
      toast.error("Failed to add candidate");
    } finally {
      setSubmitting(false);
    }
  };

  const CandidateTable = ({ list }: { list: SampleCandidate[] }) => (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30">
          <TableHead className="text-xs">Candidate</TableHead>
          <TableHead className="text-xs">Contact</TableHead>
          <TableHead className="text-xs">Experience</TableHead>
          <TableHead className="text-xs">Current Company</TableHead>
          <TableHead className="text-xs">Linked Role</TableHead>
          <TableHead className="text-xs">Source</TableHead>
          <TableHead className="text-xs text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((c) => (
          <TableRow key={c.id} className="data-table-row">
            <TableCell>
              <div className="flex items-center gap-2.5">
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
                  <div className="font-medium text-sm text-foreground">
                    {c.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.skills.slice(0, 2).join(", ")}
                    {c.skills.length > 2 ? ` +${c.skills.length - 2}` : ""}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-xs">{c.email}</div>
              <div className="text-xs text-muted-foreground">{c.phone}</div>
            </TableCell>
            <TableCell className="text-sm">{c.experienceYears} yrs</TableCell>
            <TableCell className="text-sm">{c.currentCompany}</TableCell>
            <TableCell>
              <div className="text-xs font-medium text-foreground">
                {c.role}
              </div>
              <div className="text-xs text-muted-foreground">
                {c.department}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={`text-xs ${c.source === Source.Website ? "badge-info text-blue-700 bg-blue-50 border-blue-200" : "badge-pending"}`}
              >
                {c.source === Source.Website ? (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    Website
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3 mr-1" />
                    Manual
                  </>
                )}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setViewCandidate(c)}
              >
                <Eye className="w-3.5 h-3.5" /> View
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {list.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center py-12 text-muted-foreground text-sm"
            >
              No candidates found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">CV Database</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {candidates.length} candidates · {manualCandidates.length} manual ·{" "}
            {websiteCandidates.length} website applications
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Candidate
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All CVs ({candidates.length})</TabsTrigger>
          <TabsTrigger value="manual">
            Manual ({manualCandidates.length})
          </TabsTrigger>
          <TabsTrigger value="website">
            Website Applications ({websiteCandidates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <CandidateTable list={candidates} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="manual" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <CandidateTable list={manualCandidates} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="website" className="mt-4">
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Candidates who applied directly via the company website career
            portal
          </div>
          <Card>
            <CardContent className="p-0">
              <CandidateTable list={websiteCandidates} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Candidate Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Add Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name *</Label>
                <Input
                  className="h-9 text-sm"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Arjun Sharma"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email *</Label>
                <Input
                  className="h-9 text-sm"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="arjun@email.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Phone *</Label>
                <Input
                  className="h-9 text-sm"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Experience (Years)</Label>
                <Input
                  className="h-9 text-sm"
                  type="number"
                  value={form.experienceYears}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, experienceYears: e.target.value }))
                  }
                  placeholder="5"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Current Company</Label>
                <Input
                  className="h-9 text-sm"
                  value={form.currentCompany}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currentCompany: e.target.value }))
                  }
                  placeholder="Infosys"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Source</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Link to Indent *</Label>
              <Select
                value={form.indentId}
                onValueChange={(v) => setForm((f) => ({ ...f, indentId: v }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select an approved indent" />
                </SelectTrigger>
                <SelectContent>
                  {indents.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      #{i.id} — {i.role} ({i.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Skills</Label>
              <div className="flex gap-2">
                <Input
                  className="h-9 text-sm"
                  placeholder="Add skill, press Enter"
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
                  className="h-9 px-3"
                  onClick={addSkill}
                >
                  <Tag className="w-3.5 h-3.5" />
                </Button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {form.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="gap-1 text-xs"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            skills: f.skills.filter((s) => s !== skill),
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Adding..." : "Add Candidate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Candidate Dialog */}
      {viewCandidate && (
        <Dialog
          open={!!viewCandidate}
          onOpenChange={() => setViewCandidate(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                {viewCandidate.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Email</span>
                  <div className="font-medium">{viewCandidate.email}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Phone</span>
                  <div className="font-medium">{viewCandidate.phone}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Experience
                  </span>
                  <div className="font-medium">
                    {viewCandidate.experienceYears} years
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Current Company
                  </span>
                  <div className="font-medium">
                    {viewCandidate.currentCompany}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Applied For
                  </span>
                  <div className="font-medium">{viewCandidate.role}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Department
                  </span>
                  <div className="font-medium">{viewCandidate.department}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">
                  SKILLS
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {viewCandidate.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
