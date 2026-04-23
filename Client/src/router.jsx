import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ComicInfoPage = lazy(() => import('./pages/ComicInfoPage'));
const ReadPage = lazy(() => import('./pages/ReadPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const PopularPage = lazy(() => import('./pages/PopularPage'));
const GenresPage = lazy(() => import('./pages/GenresPage'));
const LatestPage = lazy(() => import('./pages/LatestPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const FollowingPage = lazy(() => import('./pages/user/FollowingPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const CreatorApplication = lazy(() => import('./pages/CreatorApplication'));
const CreatorStudio = lazy(() => import('./pages/CreatorStudio'));
const TopUpPage = lazy(() => import('./pages/user/TopUpPage'));
const PaymentReturnPage = lazy(() => import('./pages/user/PaymentReturnPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const AboutPage = lazy(() => import('./pages/info/AboutPage'));
const TermsOfService = lazy(() => import('./pages/info/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/info/PrivacyPolicy'));
const ContactPage = lazy(() => import('./pages/info/ContactPage'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const AdminLayout = lazy(() => import('./components/Layout/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ComicList = lazy(() => import('./pages/admin/ComicList'));
const ComicEditor = lazy(() => import('./pages/admin/ComicEditor'));
const ChapterManager = lazy(() => import('./pages/admin/ChapterManager'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const ApplicationManager = lazy(() => import('./pages/admin/ApplicationManager'));
const UserManager = lazy(() => import('./pages/admin/UserManager'));
const CommentManager = lazy(() => import('./pages/admin/CommentManager'));
const ReportManager = lazy(() => import('./pages/admin/ReportManager'));

import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute';
import ProtectedCreatorRoute from './components/auth/ProtectedCreatorRoute';

// Loading Component
const Loading = () => (
    <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

// Helper to wrap element in suspense
const withSuspense = (Component) => (
    <Suspense fallback={<Loading />}>
        {Component}
    </Suspense>
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: withSuspense(<HomePage />),
    },
    {
        path: '/p/:id',
        element: withSuspense(<ComicInfoPage />),
    },
    {
        path: '/read/:comicId/:chapterId',
        element: withSuspense(<ReadPage />),
    },
    {
        path: '/search',
        element: withSuspense(<SearchPage />),
    },
    {
        path: '/popular',
        element: withSuspense(<PopularPage />),
    },
    {
        path: '/genres',
        element: withSuspense(<GenresPage />),
    },
    {
        path: '/latest',
        element: withSuspense(<LatestPage />),
    },
    {
        path: '/auth',
        element: withSuspense(<AuthPage />),
    },
    {
        path: '/reset-password/:token',
        element: withSuspense(<ResetPassword />),
    },
    {
        path: '/about',
        element: withSuspense(<AboutPage />),
    },
    {
        path: '/terms',
        element: withSuspense(<TermsOfService />),
    },
    {
        path: '/privacy',
        element: withSuspense(<PrivacyPolicy />),
    },
    {
        path: '/contact',
        element: withSuspense(<ContactPage />),
    },
    {
        path: '/history',
        element: withSuspense(<HistoryPage />),
    },
    {
        path: '/following',
        element: withSuspense(<FollowingPage />),
    },
    {
        path: '/profile',
        element: withSuspense(<ProfilePage />),
    },
    {
        path: '/payment/topup',
        element: withSuspense(<TopUpPage />),
    },
    {
        path: '/payment/vnpay_return',
        element: withSuspense(<PaymentReturnPage />),
    },
    {
        path: '/become-creator',
        element: withSuspense(<CreatorApplication />),
    },
    {
        element: <ProtectedCreatorRoute />,
        children: [
            { path: '/studio', element: withSuspense(<CreatorStudio />) },
            { path: '/studio/comics/new', element: withSuspense(<ComicEditor />) },
            { path: '/studio/comics/edit/:id', element: withSuspense(<ComicEditor />) },
            { path: '/studio/comics/:id/chapters', element: withSuspense(<ChapterManager />) },
        ]
    },    

    // Admin Routes
    {
        path: '/admin/login',
        element: withSuspense(<AdminLogin />),

    },
    {
        element: <ProtectedAdminRoute />,
        children: [
            {
                path: '/admin',
                element: withSuspense(<AdminLayout />),
                children: [
                    { path: '', element: withSuspense(<Dashboard />) },
                    { path: 'comics', element: withSuspense(<ComicList />) },
                    { path: 'comics/new', element: withSuspense(<ComicEditor />) },
                    { path: 'comics/edit/:id', element: withSuspense(<ComicEditor />) },
                    { path: 'comics/:id/chapters', element: withSuspense(<ChapterManager />) },
                    { path: 'applications', element: withSuspense(<ApplicationManager />) },
                    { path: 'users', element: withSuspense(<UserManager />) },
                    { path: 'comments', element: withSuspense(<CommentManager />) },
                    { path: 'reports', element: withSuspense(<ReportManager />) },
                ]
            }
        ]
    },
    {
        path: '*',
        element: <div className="text-white text-center pt-20">404 Not Found</div>
    }
]);
