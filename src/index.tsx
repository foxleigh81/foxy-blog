import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Root from './pages/root';
import ErrorPage from './pages/error';
import PostsList from './pages/posts';
import CategoryPage from './pages/category';
import ArticlePage from './pages/article';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <PostsList />
      },
      {
        path: '/:category',
        element: <CategoryPage />,
        errorElement: <ErrorPage />
      },
      {
        path: '/:category/:slug',
        element: <ArticlePage />,
        errorElement: <ErrorPage />
      }
    ]
  }
]);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
