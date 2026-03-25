import type { candidateInterviews, interviewQuestions, recruitmentSettings } from "../../drizzle/schema";

export type InterviewStatus = 
  | "pending"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "reviewed"
  | "shortlisted"
  | "rejected"
  | "cancelled";

export type Interview = typeof candidateInterviews.$inferSelect & {
  status: InterviewStatus;
};

export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type RecruitmentSettings = typeof recruitmentSettings.$inferSelect;

export interface InterviewStats {
  total: number;
  pending: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  reviewed: number;
  shortlisted: number;
  rejected: number;
  cancelled: number;
  averageScore?: number;
}
