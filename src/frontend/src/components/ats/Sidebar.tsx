import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Bot,
  CheckSquare,
  ChevronDown,
  ClipboardList,
  Database,
  FileCheck,
  FileText,
  Filter,
  FolderOpen,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  MessageSquare,
  Users,
} from "lucide-react";
import type { PageId, UserRole } from "../../App";

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: string;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "overview",
  },
  { id: "indents", label: "Indents", icon: FileText, group: "pipeline" },
  { id: "approvals", label: "Approvals", icon: CheckSquare, group: "pipeline" },
  {
    id: "cv-database",
    label: "CV Database",
    icon: Database,
    group: "pipeline",
  },
  { id: "screening", label: "Screening", icon: Filter, group: "pipeline" },
  { id: "ai-interview", label: "AI Interview", icon: Bot, group: "pipeline" },
  {
    id: "interview-lineup",
    label: "Interview Lineup",
    icon: Users,
    group: "pipeline",
  },
  {
    id: "final-feedback",
    label: "Final Feedback",
    icon: MessageSquare,
    group: "pipeline",
  },
  {
    id: "pre-offer-docs",
    label: "Pre-Offer Documents",
    icon: FileCheck,
    group: "offer",
  },
  {
    id: "offer-management",
    label: "Offer Management",
    icon: Handshake,
    group: "offer",
  },
  {
    id: "post-offer-docs",
    label: "Post-Offer Documents",
    icon: FolderOpen,
    group: "offer",
  },
  {
    id: "pre-joining-forms",
    label: "Pre-Joining Forms",
    icon: ClipboardList,
    group: "joining",
  },
  { id: "induction", label: "Induction", icon: BookOpen, group: "joining" },
  {
    id: "onboarding",
    label: "Onboarding",
    icon: GraduationCap,
    group: "joining",
  },
];

const groupLabels: Record<string, string> = {
  overview: "Overview",
  pipeline: "Recruitment Pipeline",
  offer: "Offer & Documents",
  joining: "Joining & Onboarding",
};

interface SidebarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

export default function Sidebar({
  currentPage,
  setCurrentPage,
  currentRole,
  setCurrentRole,
}: SidebarProps) {
  const groups = ["overview", "pipeline", "offer", "joining"];

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col border-r"
      style={{
        background: "oklch(var(--sidebar))",
        borderColor: "oklch(var(--sidebar-border))",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: "oklch(var(--sidebar-border))" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "oklch(0.55 0.2 265)" }}
        >
          A
        </div>
        <div>
          <div
            className="font-display font-bold text-sm leading-tight"
            style={{ color: "oklch(var(--sidebar-foreground))" }}
          >
            TalentFlow
          </div>
          <div
            className="text-xs"
            style={{ color: "oklch(var(--sidebar-foreground) / 0.45)" }}
          >
            ATS Platform
          </div>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-4">
          {groups.map((group) => {
            const items = navItems.filter((item) => item.group === group);
            return (
              <div key={group}>
                <div
                  className="px-3 mb-1 text-xs font-semibold tracking-wider uppercase"
                  style={{ color: "oklch(var(--sidebar-foreground) / 0.35)" }}
                >
                  {groupLabels[group]}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={`ats-sidebar-item w-full text-left ${isActive ? "active" : ""}`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Role Switcher */}
      <div
        className="px-3 py-4 border-t"
        style={{ borderColor: "oklch(var(--sidebar-border))" }}
      >
        <div
          className="text-xs font-semibold mb-2 tracking-wide"
          style={{ color: "oklch(var(--sidebar-foreground) / 0.4)" }}
        >
          VIEWING AS
        </div>
        <Select
          value={currentRole}
          onValueChange={(v) => setCurrentRole(v as UserRole)}
        >
          <SelectTrigger
            className="h-9 text-sm border-0"
            style={{
              background: "oklch(var(--sidebar-accent))",
              color: "oklch(var(--sidebar-accent-foreground))",
            }}
          >
            <SelectValue />
            <ChevronDown className="w-3.5 h-3.5 opacity-50 ml-auto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HR">HR Manager</SelectItem>
            <SelectItem value="Business Head">Business Head</SelectItem>
            <SelectItem value="Director">Director</SelectItem>
          </SelectContent>
        </Select>
        <div
          className="mt-4 text-xs text-center"
          style={{ color: "oklch(var(--sidebar-foreground) / 0.3)" }}
        >
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "oklch(var(--sidebar-foreground) / 0.4)" }}
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </aside>
  );
}
