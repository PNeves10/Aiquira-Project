import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with actual auth state

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.assets'), href: '/assets' },
    { name: t('nav.services'), href: '/services' },
    { name: t('nav.about'), href: '/about' },
  ];

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                AIQuira
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    router.pathname === item.href
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <Menu as="div" className="ml-3 relative">
                <div>
                  <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <span className="sr-only">Open user menu</span>
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/profile"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block px-4 py-2 text-sm text-gray-700`}
                        >
                          {t('nav.profile')}
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setIsAuthenticated(false)}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                        >
                          {t('nav.logout')}
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 