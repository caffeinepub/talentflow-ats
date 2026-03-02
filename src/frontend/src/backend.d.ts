import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Document {
    status: DocumentStatus;
    blobKey?: ExternalBlob;
    phase: DocumentPhase;
    docType: string;
    candidateId: bigint;
}
export interface Indent {
    id: bigint;
    status: IndentStatus;
    jobDescription: string;
    role: string;
    experienceRange: string;
    approver?: string;
    createdTimestamp: Time;
    department: string;
    requiredSkills: Array<string>;
    positions: bigint;
}
export interface UserProfile {
    name: string;
    role?: string;
    department?: string;
}
export enum DocumentPhase {
    PreOffer = "PreOffer",
    PostOffer = "PostOffer",
    PreJoining = "PreJoining"
}
export enum DocumentStatus {
    Uploaded = "Uploaded",
    Verified = "Verified",
    Pending = "Pending"
}
export enum IndentStatus {
    BusinessHeadPending = "BusinessHeadPending",
    DirectorPending = "DirectorPending",
    Approved = "Approved",
    Draft = "Draft",
    Rejected = "Rejected"
}
export enum InductionStatus {
    Scheduled = "Scheduled",
    Completed = "Completed"
}
export enum InterviewStatus {
    Scheduled = "Scheduled",
    Cancelled = "Cancelled",
    Completed = "Completed"
}
export enum OfferStage {
    Sent = "Sent",
    Draft = "Draft",
    Rejected = "Rejected",
    Accepted = "Accepted",
    Negotiating = "Negotiating"
}
export enum OnboardingStatus {
    InProgress = "InProgress",
    Completed = "Completed",
    Pending = "Pending"
}
export enum ScreeningResult {
    OnHold = "OnHold",
    Rejected = "Rejected",
    Shortlisted = "Shortlisted"
}
export enum Source {
    Website = "Website",
    Manual = "Manual"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAIInterview(candidateId: bigint, scheduledDate: Time, completed: boolean, score: bigint, summary: string): Promise<void>;
    addDocument(candidateId: bigint, phase: DocumentPhase, docType: string, status: DocumentStatus, blobKey: ExternalBlob | null): Promise<void>;
    addInduction(candidateId: bigint, scheduledDate: Time, topics: Array<string>, status: InductionStatus, notes: string): Promise<void>;
    addInterviewRound(roundNumber: bigint, candidateId: bigint, interviewer: string, scheduledDate: Time, status: InterviewStatus, technical: bigint, communication: bigint, cultural: bigint, overall: bigint, comments: string, recommendation: string): Promise<void>;
    addOffer(candidateId: bigint, ctc: string, joiningDate: Time, stage: OfferStage): Promise<void>;
    addOnboardingDay(dayNumber: bigint, candidateId: bigint, moduleName: string, status: OnboardingStatus, trainer: string, notes: string): Promise<void>;
    addScreening(candidateId: bigint, result: ScreeningResult, notes: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCandidate(name: string, email: string, phone: string, experienceYears: bigint, skills: Array<string>, currentCompany: string, source: Source, indentId: bigint): Promise<bigint>;
    createIndent(department: string, role: string, positions: bigint, jobDescription: string, requiredSkills: Array<string>, experienceRange: string): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCandidateDocuments(candidateId: bigint): Promise<Array<Document>>;
    getDashboardStats(): Promise<Array<bigint>>;
    getIndentsByStatus(status: IndentStatus): Promise<Array<Indent>>;
    getNextCandidateId(): Promise<bigint>;
    getNextIndentId(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateIndentStatus(id: bigint, newStatus: IndentStatus, approver: string): Promise<void>;
}
