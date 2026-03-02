import {
  DocumentPhase,
  DocumentStatus,
  IndentStatus,
  InductionStatus,
  InterviewStatus,
  OfferStage,
  OnboardingStatus,
  ScreeningResult,
  Source,
} from "../backend.d";

export interface SampleIndent {
  id: number;
  department: string;
  role: string;
  positions: number;
  experienceRange: string;
  jobDescription: string;
  requiredSkills: string[];
  status: IndentStatus;
  createdDate: string;
  approver?: string;
}

export interface SampleCandidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  experienceYears: number;
  skills: string[];
  currentCompany: string;
  source: Source;
  indentId: number;
  role: string;
  department: string;
  screeningResult?: ScreeningResult;
  screeningNotes?: string;
  aiInterviewStatus?: "Not Scheduled" | "Scheduled" | "Completed";
  aiInterviewScore?: number;
  aiInterviewSummary?: string;
  aiInterviewDate?: string;
  round1Status?: InterviewStatus;
  round1Interviewer?: string;
  round1Technical?: number;
  round1Communication?: number;
  round1Cultural?: number;
  round1Overall?: number;
  round1Comments?: string;
  round1Recommendation?: string;
  round1Date?: string;
  round2Status?: InterviewStatus;
  round2Interviewer?: string;
  round2Technical?: number;
  round2Communication?: number;
  round2Cultural?: number;
  round2Overall?: number;
  round2Comments?: string;
  round2Recommendation?: string;
  round2Date?: string;
  finalDecision?: "Proceed to Offer" | "Reject" | "Hold";
  finalNotes?: string;
  offerCTC?: string;
  offerJoiningDate?: string;
  offerStage?: OfferStage;
  offerCreatedDate?: string;
  preOfferDocs?: DocItem[];
  postOfferDocs?: DocItem[];
  preJoiningForms?: FormSection[];
  inductionStatus?: InductionStatus;
  inductionDate?: string;
  inductionTopics?: string[];
  inductionNotes?: string;
  onboardingDays?: OnboardingDay[];
}

export interface DocItem {
  docType: string;
  status: DocumentStatus;
  phase: DocumentPhase;
  uploadedDate?: string;
}

export interface FormSection {
  section: string;
  status: "Not Started" | "In Progress" | "Completed";
  completionPct: number;
}

export interface OnboardingDay {
  dayNumber: number;
  moduleName: string;
  trainer: string;
  status: OnboardingStatus;
  notes: string;
}

export const sampleIndents: SampleIndent[] = [
  {
    id: 1,
    department: "Engineering",
    role: "Senior Backend Engineer",
    positions: 2,
    experienceRange: "5-8 years",
    jobDescription:
      "We are looking for a Senior Backend Engineer to lead the development of scalable microservices. You will architect and implement robust APIs, work with distributed systems, and mentor junior engineers. Strong expertise in Node.js or Go required with experience in AWS/GCP.",
    requiredSkills: [
      "Node.js",
      "Go",
      "PostgreSQL",
      "Redis",
      "Kubernetes",
      "AWS",
    ],
    status: IndentStatus.Approved,
    createdDate: "2026-01-15",
  },
  {
    id: 2,
    department: "Product",
    role: "Product Manager - Growth",
    positions: 1,
    experienceRange: "4-7 years",
    jobDescription:
      "Seeking a Product Manager with strong analytical skills to drive growth initiatives. You will define product roadmaps, conduct user research, collaborate with engineering and design, and measure feature impact through data-driven insights.",
    requiredSkills: [
      "Product Strategy",
      "SQL",
      "User Research",
      "A/B Testing",
      "Agile",
      "Figma",
    ],
    status: IndentStatus.DirectorPending,
    createdDate: "2026-01-20",
    approver: "Rajesh Mehta",
  },
  {
    id: 3,
    department: "Sales",
    role: "Enterprise Sales Manager",
    positions: 3,
    experienceRange: "6-10 years",
    jobDescription:
      "Drive enterprise revenue growth by managing key accounts and building a high-performing sales team. Responsibilities include pipeline management, negotiating large deals, and developing strategic partnerships with Fortune 500 companies.",
    requiredSkills: [
      "B2B Sales",
      "CRM",
      "Negotiation",
      "Pipeline Management",
      "Team Leadership",
    ],
    status: IndentStatus.BusinessHeadPending,
    createdDate: "2026-01-25",
  },
  {
    id: 4,
    department: "Finance",
    role: "Finance Controller",
    positions: 1,
    experienceRange: "8-12 years",
    jobDescription:
      "The Finance Controller will oversee all financial operations including statutory compliance, financial reporting, treasury management, and audit coordination. CA qualification required with deep knowledge of Indian accounting standards.",
    requiredSkills: [
      "CA",
      "Financial Reporting",
      "SAP",
      "GST",
      "Audit",
      "Treasury",
    ],
    status: IndentStatus.Approved,
    createdDate: "2025-12-10",
  },
  {
    id: 5,
    department: "Marketing",
    role: "Digital Marketing Lead",
    positions: 2,
    experienceRange: "3-6 years",
    jobDescription:
      "Lead digital marketing efforts across SEO, SEM, social media, and content marketing. Own performance marketing budgets, optimize campaigns for ROI, and build brand awareness in key markets.",
    requiredSkills: [
      "SEO/SEM",
      "Google Ads",
      "Meta Ads",
      "Content Marketing",
      "Analytics",
      "HubSpot",
    ],
    status: IndentStatus.Draft,
    createdDate: "2026-02-01",
  },
  {
    id: 6,
    department: "Human Resources",
    role: "HR Business Partner",
    positions: 1,
    experienceRange: "4-7 years",
    jobDescription:
      "Partner with business leaders to align HR strategies with organizational goals. Handle talent management, employee relations, performance management, and learning & development programs.",
    requiredSkills: [
      "HR Policy",
      "Talent Management",
      "L&D",
      "HRMS",
      "Employee Relations",
    ],
    status: IndentStatus.Approved,
    createdDate: "2026-01-08",
  },
];

export const sampleCandidates: SampleCandidate[] = [
  {
    id: 1,
    name: "Arjun Sharma",
    email: "arjun.sharma@gmail.com",
    phone: "+91 98765 43210",
    experienceYears: 6,
    skills: ["Node.js", "Go", "PostgreSQL", "Redis", "AWS"],
    currentCompany: "Flipkart",
    source: Source.Website,
    indentId: 1,
    role: "Senior Backend Engineer",
    department: "Engineering",
    screeningResult: ScreeningResult.Shortlisted,
    screeningNotes:
      "Strong technical background, excellent communication in screening call",
    aiInterviewStatus: "Completed",
    aiInterviewScore: 82,
    aiInterviewDate: "2026-01-28",
    aiInterviewSummary:
      "Arjun demonstrated strong proficiency in distributed systems and microservices architecture. He articulated clear solutions to system design questions, showing depth in database optimization and caching strategies. Communication was confident and structured. Recommended for technical round.",
    round1Status: InterviewStatus.Completed,
    round1Interviewer: "Vikram Patel",
    round1Technical: 4,
    round1Communication: 5,
    round1Cultural: 4,
    round1Overall: 4,
    round1Comments:
      "Excellent understanding of backend systems. Solved coding problems efficiently. Strong cultural fit.",
    round1Recommendation: "Proceed",
    round1Date: "2026-02-03",
    round2Status: InterviewStatus.Completed,
    round2Interviewer: "Priya Nair",
    round2Technical: 4,
    round2Communication: 4,
    round2Cultural: 5,
    round2Overall: 4,
    round2Comments:
      "Good leadership potential, handled system design question well. Clear communicator.",
    round2Recommendation: "Proceed",
    round2Date: "2026-02-07",
    finalDecision: "Proceed to Offer",
    finalNotes: "Strong candidate, align on CTC expectations before offer",
    offerCTC: "32 LPA",
    offerJoiningDate: "2026-03-15",
    offerStage: OfferStage.Accepted,
    offerCreatedDate: "2026-02-10",
    preOfferDocs: [
      {
        docType: "Background Check Consent",
        status: DocumentStatus.Verified,
        phase: DocumentPhase.PreOffer,
        uploadedDate: "2026-02-11",
      },
      {
        docType: "Reference Details",
        status: DocumentStatus.Verified,
        phase: DocumentPhase.PreOffer,
        uploadedDate: "2026-02-11",
      },
      {
        docType: "Last 3 Salary Slips",
        status: DocumentStatus.Uploaded,
        phase: DocumentPhase.PreOffer,
        uploadedDate: "2026-02-12",
      },
    ],
    postOfferDocs: [
      {
        docType: "Relieving Letter",
        status: DocumentStatus.Uploaded,
        phase: DocumentPhase.PostOffer,
        uploadedDate: "2026-02-20",
      },
      {
        docType: "Education Certificates",
        status: DocumentStatus.Verified,
        phase: DocumentPhase.PostOffer,
        uploadedDate: "2026-02-18",
      },
      {
        docType: "ID Proofs",
        status: DocumentStatus.Verified,
        phase: DocumentPhase.PostOffer,
        uploadedDate: "2026-02-18",
      },
      {
        docType: "PAN Card",
        status: DocumentStatus.Verified,
        phase: DocumentPhase.PostOffer,
        uploadedDate: "2026-02-18",
      },
      {
        docType: "Aadhar Card",
        status: DocumentStatus.Pending,
        phase: DocumentPhase.PostOffer,
      },
    ],
    preJoiningForms: [
      {
        section: "Personal Information",
        status: "Completed",
        completionPct: 100,
      },
      { section: "Bank Details", status: "Completed", completionPct: 100 },
      { section: "Emergency Contact", status: "Completed", completionPct: 100 },
      { section: "Address Proof", status: "In Progress", completionPct: 60 },
    ],
    inductionStatus: InductionStatus.Completed,
    inductionDate: "2026-03-15",
    inductionTopics: [
      "Company Overview",
      "HR Policies",
      "IT Setup",
      "Compliance Training",
    ],
    inductionNotes:
      "All topics covered. Candidate very engaged and asked good questions.",
    onboardingDays: [
      {
        dayNumber: 1,
        moduleName: "System Architecture & Codebase Walkthrough",
        trainer: "Vikram Patel",
        status: OnboardingStatus.Completed,
        notes: "Covered microservices architecture, CI/CD pipeline setup",
      },
      {
        dayNumber: 2,
        moduleName: "Development Workflow & Tools",
        trainer: "Ravi Kumar",
        status: OnboardingStatus.Completed,
        notes: "Git workflows, Jira, Confluence, deployment process",
      },
      {
        dayNumber: 3,
        moduleName: "First Project Sprint Planning",
        trainer: "Meera Singh",
        status: OnboardingStatus.InProgress,
        notes: "Assigned to authentication module refactor",
      },
    ],
  },
  {
    id: 2,
    name: "Priya Menon",
    email: "priya.menon@outlook.com",
    phone: "+91 87654 32109",
    experienceYears: 5,
    skills: [
      "Product Strategy",
      "SQL",
      "User Research",
      "A/B Testing",
      "Figma",
    ],
    currentCompany: "Swiggy",
    source: Source.Website,
    indentId: 2,
    role: "Product Manager - Growth",
    department: "Product",
    screeningResult: ScreeningResult.Shortlisted,
    screeningNotes:
      "Ex-Swiggy Growth PM, excellent product sense, strong data orientation",
    aiInterviewStatus: "Completed",
    aiInterviewScore: 78,
    aiInterviewDate: "2026-01-30",
    aiInterviewSummary:
      "Priya showed excellent product thinking and structured approach to problem solving. Her experience with growth metrics and experimentation frameworks is impressive. She demonstrated strong stakeholder management skills. Minor gap in technical depth but compensated by strong business acumen.",
    round1Status: InterviewStatus.Completed,
    round1Interviewer: "Ankit Joshi",
    round1Technical: 3,
    round1Communication: 5,
    round1Cultural: 5,
    round1Overall: 4,
    round1Comments:
      "Stellar product case study presentation. Great cultural alignment.",
    round1Recommendation: "Proceed",
    round1Date: "2026-02-05",
    round2Status: InterviewStatus.Scheduled,
    round2Interviewer: "Kavita Reddy",
    round2Date: "2026-02-14",
  },
  {
    id: 3,
    name: "Rohan Kapoor",
    email: "rohan.kapoor@yahoo.com",
    phone: "+91 76543 21098",
    experienceYears: 7,
    skills: [
      "B2B Sales",
      "CRM",
      "Negotiation",
      "Salesforce",
      "Pipeline Management",
    ],
    currentCompany: "Zoho",
    source: Source.Manual,
    indentId: 3,
    role: "Enterprise Sales Manager",
    department: "Sales",
    screeningResult: ScreeningResult.Shortlisted,
    screeningNotes:
      "Strong enterprise sales background, managed ₹15Cr+ annual quota",
    aiInterviewStatus: "Completed",
    aiInterviewScore: 74,
    aiInterviewDate: "2026-02-01",
    aiInterviewSummary:
      "Rohan has a strong track record in enterprise sales. Demonstrated deep knowledge of consultative selling and deal structuring. His approach to objection handling was methodical. Communication style is assertive and professional. Good candidate for senior role.",
    round1Status: InterviewStatus.Scheduled,
    round1Interviewer: "Sundar Krishnan",
    round1Date: "2026-02-15",
  },
  {
    id: 4,
    name: "Nisha Agarwal",
    email: "nisha.agarwal@gmail.com",
    phone: "+91 65432 10987",
    experienceYears: 9,
    skills: ["CA", "Financial Reporting", "SAP", "GST", "Audit"],
    currentCompany: "Deloitte",
    source: Source.Manual,
    indentId: 4,
    role: "Finance Controller",
    department: "Finance",
    screeningResult: ScreeningResult.Shortlisted,
    screeningNotes:
      "CA with Big 4 background, deep expertise in Indian financial regulations",
    aiInterviewStatus: "Completed",
    aiInterviewScore: 88,
    aiInterviewDate: "2025-12-20",
    aiInterviewSummary:
      "Nisha is an exceptionally strong candidate with comprehensive knowledge of financial controls, statutory compliance, and reporting standards. Her experience at Deloitte brings process rigor and best practices. She demonstrated clear thinking on complex accounting scenarios. Highly recommended.",
    round1Status: InterviewStatus.Completed,
    round1Interviewer: "Anil Mehta",
    round1Technical: 5,
    round1Communication: 4,
    round1Cultural: 4,
    round1Overall: 5,
    round1Comments:
      "Exceptional financial acumen. Strong grasp of IndAS and IFRS. Great fit.",
    round1Recommendation: "Proceed",
    round1Date: "2025-12-28",
    round2Status: InterviewStatus.Completed,
    round2Interviewer: "Deepak Sahoo",
    round2Technical: 5,
    round2Communication: 5,
    round2Cultural: 4,
    round2Overall: 5,
    round2Comments:
      "CFO panel very impressed. Leadership style aligns with company values.",
    round2Recommendation: "Strongly Proceed",
    round2Date: "2026-01-04",
    finalDecision: "Proceed to Offer",
    offerCTC: "42 LPA",
    offerJoiningDate: "2026-02-15",
    offerStage: OfferStage.Negotiating,
    offerCreatedDate: "2026-01-08",
    preOfferDocs: [
      {
        docType: "Background Check Consent",
        status: DocumentStatus.Verified,
        phase: DocumentPhase.PreOffer,
        uploadedDate: "2026-01-09",
      },
      {
        docType: "Reference Details",
        status: DocumentStatus.Uploaded,
        phase: DocumentPhase.PreOffer,
        uploadedDate: "2026-01-10",
      },
      {
        docType: "Last 3 Salary Slips",
        status: DocumentStatus.Pending,
        phase: DocumentPhase.PreOffer,
      },
    ],
  },
  {
    id: 5,
    name: "Kartik Bhatt",
    email: "kartik.bhatt@gmail.com",
    phone: "+91 54321 09876",
    experienceYears: 4,
    skills: [
      "SEO/SEM",
      "Google Ads",
      "Meta Ads",
      "Content Marketing",
      "HubSpot",
    ],
    currentCompany: "MakeMyTrip",
    source: Source.Website,
    indentId: 5,
    role: "Digital Marketing Lead",
    department: "Marketing",
    screeningResult: ScreeningResult.OnHold,
    screeningNotes:
      "Good candidate, currently evaluating against 2 other stronger profiles",
    aiInterviewStatus: "Not Scheduled",
  },
  {
    id: 6,
    name: "Divya Rao",
    email: "divya.rao@hotmail.com",
    phone: "+91 43210 98765",
    experienceYears: 5,
    skills: [
      "HR Policy",
      "Talent Management",
      "L&D",
      "Workday",
      "Employee Relations",
    ],
    currentCompany: "Infosys BPM",
    source: Source.Manual,
    indentId: 6,
    role: "HR Business Partner",
    department: "Human Resources",
    screeningResult: ScreeningResult.Shortlisted,
    screeningNotes:
      "Strong HRBP experience, good cultural awareness, excellent stakeholder management",
    aiInterviewStatus: "Scheduled",
    aiInterviewDate: "2026-02-16",
  },
  {
    id: 7,
    name: "Sameer Gupta",
    email: "sameer.gupta@gmail.com",
    phone: "+91 32109 87654",
    experienceYears: 7,
    skills: ["Node.js", "Kubernetes", "Docker", "AWS", "Microservices"],
    currentCompany: "Paytm",
    source: Source.Website,
    indentId: 1,
    role: "Senior Backend Engineer",
    department: "Engineering",
    screeningResult: ScreeningResult.Rejected,
    screeningNotes:
      "Experience doesn't match required level in distributed systems",
    aiInterviewStatus: "Not Scheduled",
  },
  {
    id: 8,
    name: "Aisha Khan",
    email: "aisha.khan@gmail.com",
    phone: "+91 21098 76543",
    experienceYears: 6,
    skills: ["Node.js", "Go", "Redis", "PostgreSQL", "GCP"],
    currentCompany: "CRED",
    source: Source.Manual,
    indentId: 1,
    role: "Senior Backend Engineer",
    department: "Engineering",
    screeningResult: ScreeningResult.Shortlisted,
    screeningNotes: "Strong backend profile, fintech experience is a plus",
    aiInterviewStatus: "Completed",
    aiInterviewScore: 80,
    aiInterviewDate: "2026-01-29",
    aiInterviewSummary:
      "Aisha has solid experience in high-throughput backend systems. Her work at CRED demonstrates ability to handle scale. Good problem-solving approach in technical assessment. Recommend for interview rounds.",
    round1Status: InterviewStatus.Completed,
    round1Interviewer: "Vikram Patel",
    round1Technical: 4,
    round1Communication: 4,
    round1Cultural: 4,
    round1Overall: 4,
    round1Comments:
      "Strong technical skills, good cultural alignment, recommend R2",
    round1Recommendation: "Proceed",
    round1Date: "2026-02-04",
    round2Status: InterviewStatus.Completed,
    round2Interviewer: "Priya Nair",
    round2Technical: 3,
    round2Communication: 4,
    round2Cultural: 4,
    round2Overall: 4,
    round2Comments:
      "Good candidate, slightly below Arjun in system design depth",
    round2Recommendation: "Proceed with consideration",
    round2Date: "2026-02-08",
    finalDecision: "Hold",
    finalNotes: "Strong backup candidate. Keep in pipeline for second opening.",
  },
  {
    id: 9,
    name: "Rahul Verma",
    email: "rahul.verma@gmail.com",
    phone: "+91 90876 54321",
    experienceYears: 8,
    skills: [
      "B2B Sales",
      "Enterprise Accounts",
      "Negotiation",
      "Team Leadership",
    ],
    currentCompany: "Salesforce India",
    source: Source.Manual,
    indentId: 3,
    role: "Enterprise Sales Manager",
    department: "Sales",
    screeningResult: ScreeningResult.Shortlisted,
    screeningNotes: "Excellent track record at Salesforce, manages ₹25Cr quota",
    aiInterviewStatus: "Scheduled",
    aiInterviewDate: "2026-02-17",
  },
  {
    id: 10,
    name: "Sunita Pillai",
    email: "sunita.pillai@gmail.com",
    phone: "+91 89765 43210",
    experienceYears: 4,
    skills: [
      "SEO/SEM",
      "Content Marketing",
      "Google Analytics",
      "Social Media",
    ],
    currentCompany: "Zomato",
    source: Source.Website,
    indentId: 5,
    role: "Digital Marketing Lead",
    department: "Marketing",
    screeningResult: ScreeningResult.Shortlisted,
    screeningNotes:
      "Strong digital marketing background from high-growth startup",
    aiInterviewStatus: "Not Scheduled",
  },
];

export const recentActivities = [
  {
    id: 1,
    type: "offer",
    message: "Arjun Sharma accepted offer for Senior Backend Engineer",
    time: "2 hours ago",
    icon: "check",
  },
  {
    id: 2,
    type: "interview",
    message: "Round 2 completed for Priya Menon (Product Manager)",
    time: "4 hours ago",
    icon: "calendar",
  },
  {
    id: 3,
    type: "screening",
    message: "AI Interview scheduled for Divya Rao (HR Business Partner)",
    time: "1 day ago",
    icon: "bot",
  },
  {
    id: 4,
    type: "indent",
    message: "New indent raised: Digital Marketing Lead (2 positions)",
    time: "1 day ago",
    icon: "file",
  },
  {
    id: 5,
    type: "approval",
    message:
      "Indent for Product Manager approved by Business Head Rajesh Mehta",
    time: "2 days ago",
    icon: "thumbsup",
  },
  {
    id: 6,
    type: "candidate",
    message: "Rahul Verma added to pipeline for Enterprise Sales Manager",
    time: "2 days ago",
    icon: "user",
  },
  {
    id: 7,
    type: "offer",
    message: "Offer letter sent to Nisha Agarwal (Finance Controller)",
    time: "3 days ago",
    icon: "mail",
  },
  {
    id: 8,
    type: "onboarding",
    message: "Arjun Sharma completed Day 2 onboarding training",
    time: "Today",
    icon: "graduation",
  },
];
