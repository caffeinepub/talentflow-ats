import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, ShieldCheck, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentPhase, DocumentStatus, OfferStage } from "../backend.d";
import type { DocItem, SampleCandidate } from "../data/sampleData";
import { useActor } from "../hooks/useActor";

interface PostOfferDocsPageProps {
  candidates: SampleCandidate[];
  setCandidates: (c: SampleCandidate[]) => void;
}

const POST_OFFER_DOCS = [
  "Relieving Letter",
  "Education Certificates",
  "ID Proofs",
  "PAN Card",
  "Aadhar Card",
];

function DocStatusBadge({ status }: { status: DocumentStatus }) {
  const map: Record<DocumentStatus, { cls: string; icon: React.ReactNode }> = {
    [DocumentStatus.Pending]: {
      cls: "badge-pending",
      icon: <Clock className="w-3 h-3 mr-1" />,
    },
    [DocumentStatus.Uploaded]: {
      cls: "badge-uploaded",
      icon: <Upload className="w-3 h-3 mr-1" />,
    },
    [DocumentStatus.Verified]: {
      cls: "badge-verified",
      icon: <ShieldCheck className="w-3 h-3 mr-1" />,
    },
  };
  const { cls, icon } = map[status];
  return (
    <Badge variant="outline" className={`text-xs flex items-center ${cls}`}>
      {icon}
      {status}
    </Badge>
  );
}

export default function PostOfferDocsPage({
  candidates,
  setCandidates,
}: PostOfferDocsPageProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { actor } = useActor();

  const eligible = candidates.filter(
    (c) =>
      c.offerStage === OfferStage.Accepted ||
      c.offerStage === OfferStage.Sent ||
      c.offerStage === OfferStage.Negotiating,
  );

  const getDoc = (c: SampleCandidate, docType: string): DocItem | undefined =>
    c.postOfferDocs?.find((d) => d.docType === docType);

  const getProgress = (c: SampleCandidate) => {
    const docs = POST_OFFER_DOCS.map((d) => getDoc(c, d));
    const done = docs.filter(
      (d) => d && d.status !== DocumentStatus.Pending,
    ).length;
    return Math.round((done / POST_OFFER_DOCS.length) * 100);
  };

  const handleUpload = async (candidateId: number, docType: string) => {
    const key = `${candidateId}-${docType}`;
    setLoading(key);
    try {
      if (actor) {
        await actor.addDocument(
          BigInt(candidateId),
          DocumentPhase.PostOffer,
          docType,
          DocumentStatus.Uploaded,
          null,
        );
      }
      setCandidates(
        candidates.map((c) => {
          if (c.id !== candidateId) return c;
          const existing = c.postOfferDocs?.find((d) => d.docType === docType);
          const updated: DocItem = existing
            ? {
                ...existing,
                status: DocumentStatus.Uploaded,
                uploadedDate: new Date().toISOString().split("T")[0],
              }
            : {
                docType,
                status: DocumentStatus.Uploaded,
                phase: DocumentPhase.PostOffer,
                uploadedDate: new Date().toISOString().split("T")[0],
              };
          const docs = c.postOfferDocs
            ? [...c.postOfferDocs.filter((d) => d.docType !== docType), updated]
            : [updated];
          return { ...c, postOfferDocs: docs };
        }),
      );
      toast.success(`${docType} uploaded`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(null);
    }
  };

  const handleVerify = async (candidateId: number, docType: string) => {
    const key = `${candidateId}-${docType}-verify`;
    setLoading(key);
    try {
      if (actor) {
        await actor.addDocument(
          BigInt(candidateId),
          DocumentPhase.PostOffer,
          docType,
          DocumentStatus.Verified,
          null,
        );
      }
      setCandidates(
        candidates.map((c) => {
          if (c.id !== candidateId) return c;
          const docs =
            c.postOfferDocs?.map((d) =>
              d.docType === docType
                ? { ...d, status: DocumentStatus.Verified }
                : d,
            ) || [];
          return { ...c, postOfferDocs: docs };
        }),
      );
      toast.success(`${docType} verified`);
    } catch {
      toast.error("Verification failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="section-title">Post-Offer Documents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Collect joining documents after offer acceptance
          </p>
        </div>
      </div>

      {eligible.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-lg text-muted-foreground">
          <p className="text-sm">No candidates with active offers yet</p>
        </div>
      )}

      <div className="space-y-4">
        {eligible.map((c) => {
          const progress = getProgress(c);
          return (
            <Card key={c.id} className="border-border">
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
                      <CardTitle className="font-display text-base">
                        {c.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {c.role} · Joining: {c.offerJoiningDate || "TBD"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">
                        Completion
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-24 h-2" />
                        <span
                          className={`text-xs font-semibold ${progress === 100 ? "text-emerald-600" : "text-foreground"}`}
                        >
                          {progress}%
                        </span>
                      </div>
                    </div>
                    {progress === 100 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> All Done
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {POST_OFFER_DOCS.map((docType) => {
                    const doc = getDoc(c, docType);
                    const status = doc?.status || DocumentStatus.Pending;
                    const uploadKey = `${c.id}-${docType}`;
                    const verifyKey = `${c.id}-${docType}-verify`;
                    return (
                      <div
                        key={docType}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              status === DocumentStatus.Verified
                                ? "bg-emerald-50"
                                : status === DocumentStatus.Uploaded
                                  ? "bg-blue-50"
                                  : "bg-gray-50"
                            }`}
                          >
                            {status === DocumentStatus.Verified ? (
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            ) : status === DocumentStatus.Uploaded ? (
                              <Upload className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {docType}
                            </div>
                            {doc?.uploadedDate && (
                              <div className="text-xs text-muted-foreground">
                                Uploaded: {doc.uploadedDate}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DocStatusBadge status={status} />
                          {status === DocumentStatus.Pending && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5"
                              disabled={loading === uploadKey}
                              onClick={() => handleUpload(c.id, docType)}
                            >
                              <Upload className="w-3.5 h-3.5" />
                              {loading === uploadKey
                                ? "Uploading..."
                                : "Upload"}
                            </Button>
                          )}
                          {status === DocumentStatus.Uploaded && (
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              disabled={loading === verifyKey}
                              onClick={() => handleVerify(c.id, docType)}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {loading === verifyKey
                                ? "Verifying..."
                                : "Verify"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
