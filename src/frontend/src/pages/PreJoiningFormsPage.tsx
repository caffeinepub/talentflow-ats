import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Eye,
  MapPin,
  Phone,
  Send,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OfferStage } from "../backend.d";
import type { FormSection, SampleCandidate } from "../data/sampleData";

interface PreJoiningFormsPageProps {
  candidates: SampleCandidate[];
  setCandidates: (c: SampleCandidate[]) => void;
}

const DEFAULT_SECTIONS: FormSection[] = [
  { section: "Personal Information", status: "Not Started", completionPct: 0 },
  { section: "Bank Details", status: "Not Started", completionPct: 0 },
  { section: "Emergency Contact", status: "Not Started", completionPct: 0 },
  { section: "Address Proof", status: "Not Started", completionPct: 0 },
];

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "Personal Information": <User className="w-4 h-4" />,
  "Bank Details": <CreditCard className="w-4 h-4" />,
  "Emergency Contact": <Phone className="w-4 h-4" />,
  "Address Proof": <MapPin className="w-4 h-4" />,
};

export default function PreJoiningFormsPage({
  candidates,
  setCandidates,
}: PreJoiningFormsPageProps) {
  const [viewCandidate, setViewCandidate] = useState<SampleCandidate | null>(
    null,
  );

  const eligible = candidates.filter(
    (c) =>
      c.offerStage === OfferStage.Accepted || c.offerStage === OfferStage.Sent,
  );

  const getOverallProgress = (c: SampleCandidate) => {
    const forms = c.preJoiningForms || DEFAULT_SECTIONS;
    return Math.round(
      forms.reduce((acc, f) => acc + f.completionPct, 0) / forms.length,
    );
  };

  const handleSendForm = (candidateId: number) => {
    setCandidates(
      candidates.map((c) => {
        if (c.id !== candidateId) return c;
        const forms = DEFAULT_SECTIONS.map((s) => ({
          ...s,
          status: "In Progress" as const,
          completionPct: 10,
        }));
        return { ...c, preJoiningForms: forms };
      }),
    );
    toast.success("Pre-joining form link sent to candidate");
  };

  const handleMarkSectionComplete = (
    candidateId: number,
    sectionName: string,
  ) => {
    setCandidates(
      candidates.map((c) => {
        if (c.id !== candidateId) return c;
        const forms = (c.preJoiningForms || DEFAULT_SECTIONS).map((f) =>
          f.section === sectionName
            ? { ...f, status: "Completed" as const, completionPct: 100 }
            : f,
        );
        return { ...c, preJoiningForms: forms };
      }),
    );
    toast.success(`${sectionName} marked as complete`);
  };

  const sectionStatusBadge = (status: FormSection["status"]) => {
    const map = {
      "Not Started": "badge-pending",
      "In Progress": "badge-scheduled",
      Completed: "badge-completed",
    };
    return (
      <Badge variant="outline" className={`text-xs ${map[status]}`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Pre-Joining Forms</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Collect onboarding information before joining date
          </p>
        </div>
      </div>

      {eligible.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-lg text-muted-foreground">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm">No candidates with accepted offers</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eligible.map((c) => {
          const forms = c.preJoiningForms || DEFAULT_SECTIONS;
          const overallProgress = getOverallProgress(c);
          const formsSent = forms.some((f) => f.status !== "Not Started");

          return (
            <Card
              key={c.id}
              className="border-border hover:shadow-card transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
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
                      <CardTitle className="font-display text-sm">
                        {c.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={overallProgress}
                        className="w-16 h-1.5"
                      />
                      <span className="text-xs font-semibold text-foreground">
                        {overallProgress}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Form completion
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {forms.map((section) => (
                  <div
                    key={section.section}
                    className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center ${
                          section.status === "Completed"
                            ? "bg-emerald-50 text-emerald-500"
                            : section.status === "In Progress"
                              ? "bg-blue-50 text-blue-500"
                              : "bg-gray-50 text-gray-400"
                        }`}
                      >
                        {SECTION_ICONS[section.section]}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground">
                          {section.section}
                        </div>
                        {section.status === "In Progress" && (
                          <Progress
                            value={section.completionPct}
                            className="w-20 h-1 mt-1"
                          />
                        )}
                      </div>
                    </div>
                    {sectionStatusBadge(section.status)}
                  </div>
                ))}

                <Separator className="my-3" />

                <div className="flex gap-2">
                  {!formsSent ? (
                    <Button
                      size="sm"
                      className="gap-1.5 flex-1 h-8 text-xs"
                      onClick={() => handleSendForm(c.id)}
                    >
                      <Send className="w-3.5 h-3.5" /> Send Forms to Candidate
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 flex-1 h-8 text-xs"
                        onClick={() => setViewCandidate(c)}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Responses
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => handleSendForm(c.id)}
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View Responses Dialog */}
      {viewCandidate && (
        <Dialog
          open={!!viewCandidate}
          onOpenChange={() => setViewCandidate(null)}
        >
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                Pre-Joining Form — {viewCandidate.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-2">
              {(viewCandidate.preJoiningForms || DEFAULT_SECTIONS).map(
                (section) => (
                  <div key={section.section} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                        {SECTION_ICONS[section.section]}
                        {section.section}
                      </h4>
                      <div className="flex items-center gap-2">
                        {section.status !== "Completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs px-2 gap-1"
                            onClick={() => {
                              handleMarkSectionComplete(
                                viewCandidate.id,
                                section.section,
                              );
                              const updatedForms = (
                                viewCandidate.preJoiningForms ||
                                DEFAULT_SECTIONS
                              ).map((f) =>
                                f.section === section.section
                                  ? {
                                      ...f,
                                      status: "Completed" as const,
                                      completionPct: 100,
                                    }
                                  : f,
                              );
                              setViewCandidate({
                                ...viewCandidate,
                                preJoiningForms: updatedForms,
                              });
                            }}
                          >
                            <CheckCircle2 className="w-3 h-3" /> Mark Done
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {section.section === "Personal Information" && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs">Full Name</Label>
                            <Input
                              className="h-8 text-xs"
                              value={viewCandidate.name}
                              readOnly
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Date of Birth</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="DD/MM/YYYY"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Father's Name</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="Father's name"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nationality</Label>
                            <Input className="h-8 text-xs" value="Indian" />
                          </div>
                        </>
                      )}
                      {section.section === "Bank Details" && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs">Bank Name</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="HDFC Bank"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Account Number</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="Account number"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">IFSC Code</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="HDFC0001234"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Branch</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="Branch name"
                            />
                          </div>
                        </>
                      )}
                      {section.section === "Emergency Contact" && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs">Contact Name</Label>
                            <Input className="h-8 text-xs" placeholder="Name" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Relationship</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="Spouse / Parent"
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs">Phone Number</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="+91 98765 43210"
                            />
                          </div>
                        </>
                      )}
                      {section.section === "Address Proof" && (
                        <>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs">Current Address</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="Complete address"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">City</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="Mumbai"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Pincode</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="400001"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <Separator />
                  </div>
                ),
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
