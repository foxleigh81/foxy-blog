import React from 'react';
import { Outlet } from 'react-router-dom';

import { getCategories } from '../sanity';
import { Category } from '../../sanity.types';

export default function Root() {
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    getCategories().then((categories) => {
      setCategories(categories);
    });
  }, []);

  return (
    <>
      <header id="top-nav" className="bg-purple-900 text-white p-4">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <h1 className="text-5xl uppercase font-bold">The Foxy Blog</h1>
            <p className="text-md pl-2">
              The insane mutterings of Alex Foxleigh
            </p>
          </div>
          <div className="mt-2">
            <form
              id="search-form"
              method="post"
              role="search"
              className="flex gap-2 items-center"
            >
              <input
                id="q"
                aria-label="Search posts"
                placeholder="Search posts"
                type="search"
                name="q"
                className="rounded-md p-2 text-black"
              />
              <div id="search-spinner" aria-hidden hidden={true} />
              <div className="sr-only" aria-live="polite"></div>
              <button
                type="submit"
                className="bg-white text-purple-600 px-4 py-2 rounded-md"
              >
                Search
              </button>
            </form>
          </div>
        </div>
        <nav className="mt-4">
          <ul className="flex space-x-4 justify-end">
            {categories.map((category) => (
              <li key={category._id}>
                <a
                  className="hover:underline-offset-8 hover:underline"
                  href={`/${category?.slug?.current}`}
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <div id="detail" className="flex-grow p-4 bg-gray-100 h-screen">
        <Outlet />
      </div>
    </>
  );
}
