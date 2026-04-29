import { FC } from 'react';
import { BrowserRouter, Route, RouteObject, Routes } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { themeConfig } from './theme/themeConfig';
import { RouteConfig } from './constants/RouteConfig';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './components/Notification/Notification';
import { AuthLayout } from './layouts/AuthLayout/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout/DashboardLayout';
import RootLayout from './layouts/RootLayout/RootLayout';
import { ProtectRoute } from './components/ProtectRoute/ProtectRoute';

import { ModuleSelectionPage } from './pages/authentication/DashboardPage/ModuleSelectionPage';
import { ForbiddenPage } from './pages/unauthentication/ForbiddenPage/ForbiddenPage';
import { FormLogout } from './pages/unauthentication/FormLogout/FormLogout';
import { InternalErrorPage } from './pages/unauthentication/InternalErrorPage/InternalErrorPage';
import { LoginPage } from './pages/unauthentication/LoginPage/LoginPage';
import { NotFoundPage } from './pages/unauthentication/NotFoundPage/NotFoundPage';

import { JobBoardPage } from './pages/public/JobBoard/JobBoardPage';
import { JobDetailPage } from './pages/public/JobBoard/JobDetailPage';
import { RecruitmentDashboard } from './pages/authentication/Recruitment/RecruitmentDashboard';
import { RecruitmentPlanList } from './pages/authentication/Recruitment/RecruitmentPlanList';
import { RecruitmentJobList } from './pages/authentication/Recruitment/RecruitmentJobList';
import { CVList } from './pages/authentication/Candidate/CVList';
import { CVDetail } from './pages/authentication/Candidate/CVDetail';
import { InterviewSchedule } from './pages/authentication/Candidate/InterviewSchedule';
import { OnboardingList } from './pages/authentication/Internship/OnboardingList';
import { InternList } from './pages/authentication/Internship/InternList';
import { MentorRequestList } from './pages/authentication/Recruitment/MentorRequestList';
import { MentorLearningPath } from './pages/authentication/Internship/MentorLearningPath';
import { MentorEvalPhase1Redirect } from './pages/authentication/Internship/MentorEvalPhase1Redirect';
import { MentorTaskManagement } from './pages/authentication/Internship/MentorTaskManagement';
import { MentorEvalPhase2 } from './pages/authentication/Internship/MentorEvalPhase2';
import { MentorEvalFinal } from './pages/authentication/Internship/MentorEvalFinal';
import { InternDashboard } from './pages/authentication/Internship/InternDashboard';
import { InternEvaluationV2 } from './pages/authentication/Internship/InternEvaluationV2';
import { InternLearningPathV2 } from './pages/authentication/Internship/InternLearningPathV2';
import { InternTest } from './pages/authentication/Internship/InternTest';
import { InternTaskBoard } from './pages/authentication/Internship/InternTaskBoard';
import { DirectorApprovals } from './pages/authentication/Director/DirectorApprovals';
import { UserManagement } from './pages/authentication/Admin/UserManagement';
import { PermissionManagement } from './pages/authentication/Admin/PermissionManagement';
import { MentorEvaluationV2 } from './pages/authentication/Internship/MentorEvaluationV2';
import SettingPage from './pages/authentication/SettingPage/SettingPage';
import { setMessageInstance } from './utils/notify';

const ADMIN_ROLES = ['admin', 'super_admin'];
const RECRUITMENT_ROLES = ['hr', ...ADMIN_ROLES];
const TRAINING_MENTOR_ROLES = ['mentor', ...ADMIN_ROLES];
const DIRECTOR_ROLES = ['director', ...ADMIN_ROLES];

const dashboardRoutes: RouteObject[] = [
    {
        path: RouteConfig.ModuleSelection.path,
        element: (
            <ProtectRoute>
                <ModuleSelectionPage />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.UserManagement.path,
        element: (
            <ProtectRoute allowedRoles={ADMIN_ROLES}>
                <UserManagement />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.PermissionManagement.path,
        element: (
            <ProtectRoute allowedRoles={ADMIN_ROLES}>
                <PermissionManagement />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.RecruitmentDashboard.path,
        element: (
            <ProtectRoute allowedRoles={RECRUITMENT_ROLES}>
                <RecruitmentDashboard />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.RecruitmentPlanList.path,
        element: (
            <ProtectRoute allowedRoles={RECRUITMENT_ROLES}>
                <RecruitmentPlanList />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.RecruitmentJobList.path,
        element: (
            <ProtectRoute allowedRoles={RECRUITMENT_ROLES}>
                <RecruitmentJobList />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.CVList.path,
        element: (
            <ProtectRoute allowedRoles={RECRUITMENT_ROLES}>
                <CVList />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.CVDetail.path,
        element: (
            <ProtectRoute allowedRoles={RECRUITMENT_ROLES}>
                <CVDetail />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.InterviewSchedule.path,
        element: (
            <ProtectRoute allowedRoles={RECRUITMENT_ROLES}>
                <InterviewSchedule />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.OnboardingList.path,
        element: (
            <ProtectRoute allowedRoles={RECRUITMENT_ROLES}>
                <OnboardingList />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.InternList.path,
        element: (
            <ProtectRoute allowedRoles={RECRUITMENT_ROLES}>
                <InternList />
            </ProtectRoute>
        )
    },

    {
        path: RouteConfig.TrainingInternList.path,
        element: (
            <ProtectRoute allowedRoles={TRAINING_MENTOR_ROLES}>
                <InternList />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.MentorRequestList.path,
        element: (
            <ProtectRoute allowedRoles={TRAINING_MENTOR_ROLES}>
                <MentorRequestList />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.MentorInternList.path,
        element: (
            <ProtectRoute allowedRoles={TRAINING_MENTOR_ROLES}>
                <InternList />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.MentorLearningPath.path,
        element: (
            <ProtectRoute allowedRoles={TRAINING_MENTOR_ROLES}>
                <MentorLearningPath />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.MentorEvaluation.path,
        element: (
            <ProtectRoute allowedRoles={TRAINING_MENTOR_ROLES}>
                <MentorEvaluationV2 />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.MentorEvalPhase1.path,
        element: (
            <ProtectRoute allowedRoles={TRAINING_MENTOR_ROLES}>
                <MentorEvalPhase1Redirect />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.MentorTaskManagement.path,
        element: (
            <ProtectRoute allowedRoles={TRAINING_MENTOR_ROLES}>
                <MentorTaskManagement />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.MentorEvalPhase2.path,
        element: (
            <ProtectRoute allowedRoles={TRAINING_MENTOR_ROLES}>
                <MentorEvalPhase2 />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.MentorEvalFinal.path,
        element: (
            <ProtectRoute allowedRoles={TRAINING_MENTOR_ROLES}>
                <MentorEvalFinal />
            </ProtectRoute>
        )
    },

    {
        path: RouteConfig.InternEvaluation.path,
        element: (
            <ProtectRoute allowedRoles={['intern']}>
                <InternEvaluationV2 />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.InternLearningPath.path,
        element: (
            <ProtectRoute allowedRoles={['intern']}>
                <InternLearningPathV2 />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.InternDashboard.path,
        element: (
            <ProtectRoute allowedRoles={['intern']}>
                <InternDashboard />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.InternTest.path,
        element: (
            <ProtectRoute allowedRoles={['intern']}>
                <InternTest />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.InternTaskBoard.path,
        element: (
            <ProtectRoute allowedRoles={['intern']}>
                <InternTaskBoard />
            </ProtectRoute>
        )
    },

    {
        path: RouteConfig.DirectorApprovals.path,
        element: (
            <ProtectRoute allowedRoles={DIRECTOR_ROLES}>
                <DirectorApprovals />
            </ProtectRoute>
        )
    },
    {
        path: RouteConfig.SettingPage.path,
        element: (
            <ProtectRoute>
                <SettingPage />
            </ProtectRoute>
        )
    }
];

const AppContent: FC = () => {
    const app = AntApp.useApp();

    setMessageInstance(app);
    return (
        <NotificationProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<RootLayout />}>
                            <Route path={RouteConfig.PublicJobBoard.path} element={<JobBoardPage />} />
                            <Route path={RouteConfig.PublicJobDetail.path} element={<JobDetailPage />} />

                            <Route element={<AuthLayout />}>
                                <Route path={RouteConfig.LoginPage.path} element={<LoginPage />} />
                                <Route path={RouteConfig.Logout.path} element={<FormLogout />} />
                            </Route>

                            <Route
                                path={RouteConfig.ModuleSelection.path}
                                element={
                                    <ProtectRoute>
                                        <ModuleSelectionPage />
                                    </ProtectRoute>
                                }
                            />

                            <Route element={<DashboardLayout />}>
                                {dashboardRoutes
                                    .filter((r) => r.path !== RouteConfig.ModuleSelection.path)
                                    .map((route) => (
                                        <Route key={route.path} path={route.path} element={route.element} />
                                    ))}
                            </Route>

                            <Route path={RouteConfig.InternalErrorPage.path} element={<InternalErrorPage />} />
                            <Route path={RouteConfig.ForbiddenPage.path} element={<ForbiddenPage />} />
                            <Route path={RouteConfig.NotFoundPage.path} element={<NotFoundPage />} />
                            <Route path='*' element={<NotFoundPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </NotificationProvider>
    );
};

export const App = () => {
    return (
        <ConfigProvider theme={themeConfig} locale={viVN}>
            <AntApp>
                <AppContent />
            </AntApp>
        </ConfigProvider>
    );
};
