import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComicInfoPage from './pages/ComicInfoPage';
import ReadPage from './pages/ReadPage';

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
        path: '*',
        element: <div className="text-white text-center pt-20">404 Not Found</div>
    }
]);
