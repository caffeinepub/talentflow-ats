import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, CheckCircle2, Clock, User, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScreeningResult } from "../backend.d";
import type { SampleCandidate, SampleIndent } from "../data/sampleData";
import { useActor } from "../hooks/useActor";

interface ScreeningPageProps {
  candidates: SampleCandidate[];
  setCandidates: (c: SampleCandidate[]) => void;
  indents: SampleIndent[];
}

function ScreeningBadge({ result }: { result?: ScreeningResult }) {
  if (!result)
    return (
      <Badge variant="outline" className="text-xs badge-pending">
        Not Screened
      </Badge>
    );
  const map = {
    [ScreeningResult.Shortlisted]: (
      <Badge variant="outline" className="text-xs badge-shortlisted">
        Shortlisted
      </Badge>
    ),
    [ScreeningResult.Rejected]: (
      <Badge variant="outline" className="text-xs badge-rejected">
        Rejected
      </Badge>
    ),
    [ScreeningResult.OnHold]: (
      <Badge variant="outline" className="text-xs badge-onhold">
        On Hold
      </Badge>
    ),
  };
  return map[result];
}

export default function ScreeningPage({
  candidates,
  setCandidates,
  indents,
}: ScreeningPageProps) {
  const [selectedId, setSelectedId] = useState<number | null>(
    candidates[0]?.id ?? null,
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { actor } = useActor();

  const selected = candidates.find((c) => c.id === selectedId);
  const linkedIndent = selected
    ? indents.find((i) => i.id === selected.indentId)
    : null;

  const skillMatch = (() => {
    if (!selected || !linkedIndent) return [];
    return linkedIndent.requiredSkills.map((skill) => ({
      skill,
      matched: selected.skills.some(
        (s) =>
          s.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(s.toLowerCase()),
      ),
    }));
  })();

  const matchScore =
    skillMatch.length > 0
      ? Math.round(
          (skillMatch.filter((s) => s.matched).length / skillMatch.length) *
            100,
        )
      : 0;

  const handleScreen = async (result: ScreeningResult) => {
    if (!selected) return;
    setLoading(true);
    try {
      if (actor) {
        await actor.addScreening(BigInt(selected.id), result, notes);
      }
      setCandidates(
        candidates.map((c) =>
          c.id === selected.id
            ? { ...c, screeningResult: result, screeningNotes: notes }
            : c,
        ),
      );
      toast.success(
        `Candidate ${result === ScreeningResult.Shortlisted ? "shortlisted" : result === ScreeningResult.Rejected ? "rejected" : "put on hold"}`,
      );
      setNotes("");
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">First Level Screening</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Screen candidates against job descriptions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Candidate List */}
        <div className="lg:col-span-2 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground px-1 mb-2">
            CANDIDATES ({candidates.length})
          </div>
          {candidates.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full text-left rounded-lg border p-3 transition-all ${
                selectedId === c.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between">
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
                    <div className="text-sm font-medium text-foreground">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.experienceYears}y · {c.currentCompany}
                    </div>
                  </div>
                </div>
                <ScreeningBadge result={c.screeningResult} />
              </div>
              <div className="mt-1.5 ml-10.5 text-xs text-muted-foreground">
                {c.role}
              </div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        {selected ? (
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Candidate Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{
                      background: `oklch(${0.45 + ((selected.id * 0.07) % 0.3)} 0.18 ${200 + selected.id * 30})`,
                    }}
                  >
                    {selected.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-foreground text-lg">
                      {selected.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selected.currentCompany} · {selected.experienceYears}{" "}
                      years experience
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>{selected.email}</span>
                      <span>·</span>
                      <span>{selected.phone}</span>
                    </div>
                  </div>
                  <ScreeningBadge result={selected.screeningResult} />
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-2">
                    CANDIDATE SKILLS
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selected.screeningNotes && (
                  <div className="bg-muted/40 rounded-lg p-3 text-sm">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Previous Notes:{" "}
                    </span>
                    {selected.screeningNotes}
                  </div>
                )}
              </CardContent>
            </Card>

            {linkedIndent && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Job Description — {linkedIndent.role}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 text-xs">
                    <span className="text-muted-foreground">
                      Department:{" "}
                      <span className="font-medium text-foreground">
                        {linkedIndent.department}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Experience:{" "}
                      <span className="font-medium text-foreground">
                        {linkedIndent.experienceRange}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {linkedIndent.jobDescription}
                  </p>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        SKILLS MATCH
                      </div>
                      <div
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${matchScore >= 70 ? "bg-emerald-50 text-emerald-700" : matchScore >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}
                      >
                        {matchScore}% match
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skillMatch.map(({ skill, matched }) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className={`text-xs ${matched ? "badge-approved" : "badge-rejected"}`}
                        >
                          {matched ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Panel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">
                  Screening Decision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  className="text-sm min-h-20 resize-none"
                  placeholder="Add screening notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                    onClick={() => handleScreen(ScreeningResult.Shortlisted)}
                    disabled={loading}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Shortlist
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 flex-1"
                    onClick={() => handleScreen(ScreeningResult.OnHold)}
                    disabled={loading}
                  >
                    <Clock className="w-4 h-4" /> On Hold
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-red-600 border-red-200 hover:bg-red-50 flex-1"
                    onClick={() => handleScreen(ScreeningResult.Rejected)}
                    disabled={loading}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-3 flex items-center justify-center border border-dashed border-border rounded-lg text-muted-foreground text-sm">
            Select a candidate to view details
          </div>
        )}
      </div>
    </div>
  );
}
