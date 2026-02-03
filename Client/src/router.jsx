import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComicInfoPage from './pages/ComicInfoPage';
import ReadPage from './pages/ReadPage';
import SearchPage from './pages/SearchPage';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ComicList from './pages/admin/ComicList';
import ComicEditor from './pages/admin/ComicEditor';
import ChapterManager from './pages/admin/ChapterManager';

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
        path: '/read/:id',
        element: <ReadPage />,
    },
    {
        path: '/search',
        element: <SearchPage />,
    },
    // Admin Routes
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            { path: '', element: <Dashboard /> },
            { path: 'comics', element: <ComicList /> },
            { path: 'comics/new', element: <ComicEditor /> },
            { path: 'comics/edit/:id', element: <ComicEditor /> },
            { path: 'comics/:id/chapters', element: <ChapterManager /> },
        ]
    },
    {
        path: '*',
        element: <div className="text-white text-center pt-20">404 Not Found</div>
    }
]);
