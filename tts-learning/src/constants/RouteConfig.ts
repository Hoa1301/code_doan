
export const RouteConfig = {
    ForbiddenPage: {
        path: '/403'
    },
    NotFoundPage: {
        path: '/404'
    },
    InternalErrorPage: {
        path: '/500'
    },

    LoginPage: {
        path: '/login',
        searchParam: 'redirectTo',
        getFullPath: (redirectTo: string) => {
            return `/login?redirectTo=${redirectTo}`;
        }
    },
    ForgotPassword: {
        path: '/forgot-password'
    },
    ForgotPasswordSucess: {
        path: '/forgot-password-success'
    },
    Logout: {
        path: '/logout'
    },

    ModuleSelection: {
        path: '/'
    },

    PublicJobBoard: {
        path: '/jobs'
    },
    PublicJobDetail: {
        path: '/jobs/:id',
        getPath: (id: string) => `/jobs/${id}`
    },

    // RECRUITMENT MODULE
    RecruitmentDashboard: {
        path: '/recruitment/dashboard'
    },
    RecruitmentPlanList: {
        path: '/recruitment/plans'
    },
    RecruitmentPlanCreate: {
        path: '/recruitment/plans/create'
    },
    RecruitmentPlanUpdate: {
        path: '/recruitment/plans/:id/update',
        getPath: (id: string) => `/recruitment/plans/${id}/update`
    },
    RecruitmentJobList: {
        path: '/recruitment/jobs'
    },
    CVList: {
        path: '/recruitment/cvs'
    },
    CVDetail: {
        path: '/recruitment/cvs/:id',
        getPath: (id: string) => `/recruitment/cvs/${id}`
    },
    InterviewSchedule: {
        path: '/recruitment/interviews'
    },
    OnboardingList: {
        path: '/recruitment/onboarding'
    },
    InternList: {
        path: '/recruitment/interns'
    },

    // TRAINING MODULE
    TrainingInternList: {
        path: '/training/interns'
    },
    MentorRequestList: {
        path: '/training/mentor/requests'
    },
    MentorLearningPath: {
        path: '/training/mentor/learning-paths'
    },
    MentorInternList: {
        path: '/training/mentor/interns'
    },
    MentorEvalPhase1: {
        path: '/training/mentor/eval-phase1/:id',
        getPath: (id: string) => `/training/mentor/eval-phase1/${id}`
    },
    MentorTaskManagement: {
        path: '/training/mentor/tasks'
    },
    MentorEvalPhase2: {
        path: '/training/mentor/eval-phase2/:id',
        getPath: (id: string) => `/training/mentor/eval-phase2/${id}`
    },
    MentorEvalFinal: {
        path: '/training/mentor/eval-final/:id',
        getPath: (id: string) => `/training/mentor/eval-final/${id}`
    },
    MentorEvaluation: {
        path: '/training/mentor/evaluations/:id',
        getPath: (id: string) => `/training/mentor/evaluations/${id}`
    },
    InternDashboard: {
        path: '/training/intern/dashboard'
    },
    InternLearningPath: {
        path: '/training/intern/learning-path'
    },
    InternEvaluation: {
        path: '/training/intern/evaluations'
    },
    InternTest: {
        path: '/training/intern/test',
        getPath: (quizId?: string, moduleId?: string) => {
            const params = new URLSearchParams();

            if (quizId) {
                params.set('quizId', quizId);
            }

            if (moduleId) {
                params.set('moduleId', moduleId);
            }

            const queryString = params.toString();
            return queryString ? `/training/intern/test?${queryString}` : '/training/intern/test';
        }
    },
    InternTaskBoard: {
        path: '/training/intern/tasks'
    },

    // DIRECTOR MODULE
    DirectorApprovals: {
        path: '/director/approvals'
    },
    UserManagement: {
        path: '/admin/users'
    },
    PermissionManagement: {
        path: '/admin/permissions'
    },
    SettingPage: {
        path: '/settings'
    }
};
