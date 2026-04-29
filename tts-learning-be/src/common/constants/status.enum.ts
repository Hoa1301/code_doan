export enum RecruitmentPlanStatus {
  PLAN_DRAFT = 'draft',
  PLAN_PENDING_APPROVAL = 'pending_approval',
  PLAN_REQUEST_EDIT = 'request_edit',
  PLAN_ACTIVE = 'active',
  PLAN_ON_HOLD = 'on_hold',
  PLAN_CLOSED = 'closed',
  PLAN_REJECTED = 'rejected',
}

export enum JobPositionStatus {
  JOB_DRAFT = 'draft',
  JOB_OPEN = 'open',
  JOB_CLOSED = 'closed',
  JOB_UNPUBLISHED = 'unpublished',
}

export enum CandidateStatus {
  PENDING_REVIEW = 'pending_review',
  CV_SCREENED = 'cv_screened',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  PASSED_INTERVIEW = 'passed_interview',
  OFFER = 'offer',
  REJECTED = 'rejected',
  REJECTED_CV = 'rejected_cv',
  REJECTED_INTERVIEW = 'rejected_interview',
  CONVERTED_TO_INTERN = 'converted_to_intern',
}

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

export enum InternStage {
  STAGE1 = 'stage1',
  STAGE2 = 'stage2',
  FINAL_REVIEW = 'final_review',
  COMPLETED = 'completed',
}

export enum InternStatus {
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
}

export enum TaskStatus {
  TO_DO = 'to_do',
  IN_PROGRESS = 'in_progress',
  UNDER_REVIEW = 'under_review',
  COMPLETED = 'completed',
  NEED_REWORK = 'need_rework',
}

export enum ReportStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
