import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Type
  public type UserProfile = {
    name : Text;
    department : ?Text;
    role : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // TYPES

  public type IndentStatus = {
    #Draft;
    #BusinessHeadPending;
    #DirectorPending;
    #Approved;
    #Rejected;
  };

  public type ScreeningResult = {
    #Shortlisted;
    #Rejected;
    #OnHold;
  };

  public type InterviewStatus = {
    #Scheduled;
    #Completed;
    #Cancelled;
  };

  public type FinalDecision = {
    #ProceedToOffer;
    #Reject;
    #Hold;
  };

  public type OfferStage = {
    #Draft;
    #Sent;
    #Accepted;
    #Rejected;
    #Negotiating;
  };

  public type DocumentStatus = {
    #Pending;
    #Uploaded;
    #Verified;
  };

  public type DocumentPhase = {
    #PreOffer;
    #PostOffer;
    #PreJoining;
  };

  public type InductionStatus = {
    #Scheduled;
    #Completed;
  };

  public type OnboardingStatus = {
    #Pending;
    #InProgress;
    #Completed;
  };

  public type Source = {
    #Manual;
    #Website;
  };

  public type Indent = {
    id : Nat;
    department : Text;
    role : Text;
    positions : Nat;
    jobDescription : Text;
    requiredSkills : [Text];
    experienceRange : Text;
    status : IndentStatus;
    approver : ?Text;
    createdTimestamp : Time.Time;
  };

  module Indent {
    public func compare(i1 : Indent, i2 : Indent) : Order.Order {
      Nat.compare(i1.id, i2.id);
    };
  };

  public type Candidate = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    experienceYears : Nat;
    skills : [Text];
    currentCompany : Text;
    source : Source;
    indentId : Nat;
  };

  module Candidate {
    public func compare(c1 : Candidate, c2 : Candidate) : Order.Order {
      Nat.compare(c1.id, c2.id);
    };
  };

  public type Screening = {
    candidateId : Nat;
    result : ScreeningResult;
    notes : Text;
  };

  module Screening {
    public func compare(s1 : Screening, s2 : Screening) : Order.Order {
      Nat.compare(s1.candidateId, s2.candidateId);
    };
  };

  public type AIInterview = {
    candidateId : Nat;
    scheduledDate : Time.Time;
    completed : Bool;
    score : Nat;
    summary : Text;
  };

  module AIInterview {
    public func compare(ai1 : AIInterview, ai2 : AIInterview) : Order.Order {
      Nat.compare(ai1.candidateId, ai2.candidateId);
    };
  };

  public type InterviewRound = {
    roundNumber : Nat;
    candidateId : Nat;
    interviewer : Text;
    scheduledDate : Time.Time;
    status : InterviewStatus;
    technical : Nat;
    communication : Nat;
    cultural : Nat;
    overall : Nat;
    comments : Text;
    recommendation : Text;
  };

  module InterviewRound {
    public func compare(ir1 : InterviewRound, ir2 : InterviewRound) : Order.Order {
      switch (Nat.compare(ir1.roundNumber, ir2.roundNumber)) {
        case (#equal) { Nat.compare(ir1.candidateId, ir2.candidateId) };
        case (order) { order };
      };
    };
  };

  public type Offer = {
    candidateId : Nat;
    ctc : Text;
    joiningDate : Time.Time;
    stage : OfferStage;
  };

  module Offer {
    public func compare(o1 : Offer, o2 : Offer) : Order.Order {
      Nat.compare(o1.candidateId, o2.candidateId);
    };
  };

  public type Document = {
    candidateId : Nat;
    phase : DocumentPhase;
    docType : Text;
    status : DocumentStatus;
    blobKey : ?Storage.ExternalBlob;
  };

  module Document {
    public func compare(d1 : Document, d2 : Document) : Order.Order {
      switch (Text.compare(d1.docType, d2.docType)) {
        case (#equal) { Nat.compare(d1.candidateId, d2.candidateId) };
        case (order) { order };
      };
    };
  };

  public type Induction = {
    candidateId : Nat;
    scheduledDate : Time.Time;
    topics : [Text];
    status : InductionStatus;
    notes : Text;
  };

  module Induction {
    public func compare(i1 : Induction, i2 : Induction) : Order.Order {
      Nat.compare(i1.candidateId, i2.candidateId);
    };
  };

  public type OnboardingDay = {
    dayNumber : Nat;
    candidateId : Nat;
    moduleName : Text;
    status : OnboardingStatus;
    trainer : Text;
    notes : Text;
  };

  module OnboardingDay {
    public func compare(o1 : OnboardingDay, o2 : OnboardingDay) : Order.Order {
      Nat.compare(o1.dayNumber, o2.dayNumber);
    };
  };

  public type DashboardStats = {
    indents : Nat;
    candidates : Nat;
    pendingApprovals : Nat;
  };

  module DashboardStats {
    public func compare(ds1 : DashboardStats, ds2 : DashboardStats) : Order.Order {
      Nat.compare(ds1.indents, ds2.indents);
    };
  };

  public type IdState = {
    nextCandidateId : Nat;
    nextIndentId : Nat;
  };

  // STORAGE
  let screening = Map.empty<Nat, Screening>();
  let aiInterviews = Map.empty<Nat, AIInterview>();
  let interviews = Map.empty<Nat, List.List<InterviewRound>>();
  let offers = Map.empty<Nat, Offer>();
  let documents = Map.empty<Nat, List.List<Document>>();
  let onboarding = Map.empty<Nat, List.List<OnboardingDay>>();
  let inductions = Map.empty<Nat, Induction>();
  let idState = Map.empty<Principal, IdState>();

  let indents = Map.empty<Nat, Indent>();
  let candidates = Map.empty<Nat, Candidate>();

  // HELPERS
  public shared ({ caller }) func getNextCandidateId() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate candidate IDs");
    };
    switch (idState.get(caller)) {
      case (?state) {
        let id = state.nextCandidateId;
        let newState = { state with nextCandidateId = id + 1 };
        idState.add(caller, newState);
        id;
      };
      case (null) {
        idState.add(
          caller,
          {
            nextCandidateId = 2;
            nextIndentId = 1;
          },
        );
        1;
      };
    };
  };

  public shared ({ caller }) func getNextIndentId() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate indent IDs");
    };
    switch (idState.get(caller)) {
      case (?state) {
        let id = state.nextIndentId;
        let newState = { state with nextIndentId = id + 1 };
        idState.add(caller, newState);
        id;
      };
      case (null) {
        idState.add(
          caller,
          {
            nextCandidateId = 1;
            nextIndentId = 2;
          },
        );
        1;
      };
    };
  };

  // Indent Functions
  public shared ({ caller }) func createIndent(department : Text, role : Text, positions : Nat, jobDescription : Text, requiredSkills : [Text], experienceRange : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create indents");
    };
    let id = await getNextIndentId();
    let indent : Indent = {
      id;
      department;
      role;
      positions;
      jobDescription;
      requiredSkills;
      experienceRange;
      status = #Draft;
      approver = null;
      createdTimestamp = Time.now();
    };
    indents.add(id, indent);
    id;
  };

  public shared ({ caller }) func updateIndentStatus(id : Nat, newStatus : IndentStatus, approver : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update indent status");
    };
    switch (indents.get(id)) {
      case (null) { Runtime.trap("Indent not found") };
      case (?indent) {
        let updatedIndent = { indent with status = newStatus; approver = ?approver };
        indents.add(id, updatedIndent);
      };
    };
  };

  public query ({ caller }) func getIndentsByStatus(status : IndentStatus) : async [Indent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view indents");
    };
    let filteredIndents = indents.values().toArray().filter(
      func(i) { i.status == status }
    );
    filteredIndents.sort();
  };

  // Candidate Functions
  public shared ({ caller }) func createCandidate(name : Text, email : Text, phone : Text, experienceYears : Nat, skills : [Text], currentCompany : Text, source : Source, indentId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create candidates");
    };
    let id = await getNextCandidateId();
    let candidate : Candidate = {
      id;
      name;
      email;
      phone;
      experienceYears;
      skills;
      currentCompany;
      source;
      indentId;
    };
    candidates.add(id, candidate);
    id;
  };

  public shared ({ caller }) func addScreening(candidateId : Nat, result : ScreeningResult, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add screening results");
    };
    let screeningData : Screening = {
      candidateId;
      result;
      notes;
    };
    screening.add(candidateId, screeningData);
  };

  public shared ({ caller }) func addAIInterview(candidateId : Nat, scheduledDate : Time.Time, completed : Bool, score : Nat, summary : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add AI interview records");
    };
    let aiInterview : AIInterview = {
      candidateId;
      scheduledDate;
      completed;
      score;
      summary;
    };
    aiInterviews.add(candidateId, aiInterview);
  };

  public shared ({ caller }) func addInterviewRound(roundNumber : Nat, candidateId : Nat, interviewer : Text, scheduledDate : Time.Time, status : InterviewStatus, technical : Nat, communication : Nat, cultural : Nat, overall : Nat, comments : Text, recommendation : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add interview rounds");
    };
    let round : InterviewRound = {
      roundNumber;
      candidateId;
      interviewer;
      scheduledDate;
      status;
      technical;
      communication;
      cultural;
      overall;
      comments;
      recommendation;
    };

    switch (interviews.get(candidateId)) {
      case (null) {
        let newList = List.empty<InterviewRound>();
        newList.add(round);
        interviews.add(candidateId, newList);
      };
      case (?rounds) {
        rounds.add(round);
      };
    };
  };

  public shared ({ caller }) func addOffer(candidateId : Nat, ctc : Text, joiningDate : Time.Time, stage : OfferStage) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create offers");
    };
    let offer : Offer = {
      candidateId;
      ctc;
      joiningDate;
      stage;
    };
    offers.add(candidateId, offer);
  };

  public shared ({ caller }) func addDocument(candidateId : Nat, phase : DocumentPhase, docType : Text, status : DocumentStatus, blobKey : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add documents");
    };
    let document : Document = {
      candidateId;
      phase;
      docType;
      status;
      blobKey;
    };
    switch (documents.get(candidateId)) {
      case (null) {
        let newList = List.empty<Document>();
        newList.add(document);
        documents.add(candidateId, newList);
      };
      case (?docs) {
        docs.add(document);
      };
    };
  };

  public shared ({ caller }) func addInduction(candidateId : Nat, scheduledDate : Time.Time, topics : [Text], status : InductionStatus, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add induction records");
    };
    let induction : Induction = {
      candidateId;
      scheduledDate;
      topics;
      status;
      notes;
    };
    inductions.add(candidateId, induction);
  };

  public shared ({ caller }) func addOnboardingDay(dayNumber : Nat, candidateId : Nat, moduleName : Text, status : OnboardingStatus, trainer : Text, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add onboarding records");
    };
    let day : OnboardingDay = {
      dayNumber;
      candidateId;
      moduleName;
      status;
      trainer;
      notes;
    };
    switch (onboarding.get(candidateId)) {
      case (null) {
        let newList = List.empty<OnboardingDay>();
        newList.add(day);
        onboarding.add(candidateId, newList);
      };
      case (?days) {
        days.add(day);
      };
    };
  };

  public query ({ caller }) func getDashboardStats() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };
    let indentsByStatus = indents.values().toArray().map(
      func(i) { switch (i.status) { case (#BusinessHeadPending) { 1 }; case (_) { 0 } } }
    );
    let candidatesBySource = candidates.values().toArray().map(func(c) { switch (c.source) { case (#Website) { 1 }; case (_) { 0 } } });
    let pendingApprovals = indentsByStatus.foldLeft(0, Nat.add);

    [indents.size(), candidates.size(), pendingApprovals];
  };

  // Document Functions
  public query ({ caller }) func getCandidateDocuments(candidateId : Nat) : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view documents");
    };
    switch (documents.get(candidateId)) {
      case (null) { [] };
      case (?docs) { docs.toArray().sort() };
    };
  };
};
