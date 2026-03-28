import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComicInfoPage from './pages/ComicInfoPage';
import ReadPage from './pages/ReadPage';
import SearchPage from './pages/SearchPage';
import PopularPage from './pages/PopularPage';
import GenresPage from './pages/GenresPage';
import LatestPage from './pages/LatestPage';
import AuthPage from './pages/AuthPage';
import FollowingPage from './pages/user/FollowingPage';
import ProfilePage from './pages/user/ProfilePage';
import CreatorApplication from './pages/CreatorApplication';
import CreatorStudio from './pages/CreatorStudio';
import TopUpPage from './pages/user/TopUpPage';
import PaymentReturnPage from './pages/user/PaymentReturnPage';

import AdminLayout from './components/Layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ComicList from './pages/admin/ComicList';
import ComicEditor from './pages/admin/ComicEditor';
import ChapterManager from './pages/admin/ChapterManager';
import AdminLogin from './pages/admin/AdminLogin';
import ApplicationManager from './pages/admin/ApplicationManager';

import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute';
import ProtectedCreatorRoute from './components/auth/ProtectedCreatorRoute';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/p/:id',
        element: <ComicInfoPage />,
    },
    {
        path: '/read/:comicId/:chapterId',
        element: <ReadPage />,
    },
    {
        path: '/search',
        element: <SearchPage />,
    },
    {
        path: '/popular',
        element: <PopularPage />,
    },
    {
        path: '/genres',
        element: <GenresPage />,
    },
    {
        path: '/latest',
        element: <LatestPage />,
    },
    {
        path: '/auth',
        element: <AuthPage />,
    },
    {
        path: '/following',
        element: <FollowingPage />,
    },
    {
        path: '/profile',
        element: <ProfilePage />,
    },
    {
        path: '/payment/topup',
        element: <TopUpPage />,
    },
    {
        path: '/payment/vnpay_return',
        element: <PaymentReturnPage />,
    },
    {
        path: '/become-creator',
        element: <CreatorApplication />,
    },
    {
        element: <ProtectedCreatorRoute />,
        children: [
            { path: '/studio', element: <CreatorStudio /> },
            { path: '/studio/comics/new', element: <ComicEditor /> },
            { path: '/studio/comics/edit/:id', element: <ComicEditor /> },
            { path: '/studio/comics/:id/chapters', element: <ChapterManager /> },
        ]
    },    

    // Admin Routes
    {
        path: '/admin/login',
        element: <AdminLogin />,

    },
    {
        element: <ProtectedAdminRoute />,
        children: [
            {
                path: '/admin',
                element: <AdminLayout />,
                children: [
                    { path: '', element: <Dashboard /> },
                    { path: 'comics', element: <ComicList /> },
                    { path: 'comics/new', element: <ComicEditor /> },
                    { path: 'comics/edit/:id', element: <ComicEditor /> },
                    { path: 'comics/:id/chapters', element: <ChapterManager /> },
                    { path: 'applications', element: <ApplicationManager /> },
                ]
            }
        ]
    },
    {
        path: '*',
        element: <div className="text-white text-center pt-20">404 Not Found</div>
    }
]);
