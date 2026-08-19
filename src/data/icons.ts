import {
  UserRoundCheck,
  BadgeCheck,
  HeartPulse,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  FileClock,
  CircleDollarSign,
  LayoutGrid,
  FileQuestion,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  school_life_rules: UserRoundCheck,
  id_certificate: BadgeCheck,
  health_counseling: HeartPulse,
  facilities: Building2,
  clubs: Users,
  scholarship_aid: GraduationCap,
  library: BookOpen,
  academic_procedures: FileClock,
  payment: CircleDollarSign,
};

export const categoryFallbackIcon: LucideIcon = FileQuestion;
export const allCategoriesIcon: LucideIcon = LayoutGrid;
