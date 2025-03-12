"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import Avatar from '@mui/material/Avatar';

const Header = () => {
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
  });

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const usePathName = usePathname();

  return (
    <>
      <header
        className={`header left-0 top-0 z-40 flex w-full items-center ${
          sticky
            ? "fixed z-[9999] bg-white !bg-opacity-80 shadow-sticky backdrop-blur-sm transition dark:bg-gray-dark dark:shadow-sticky-dark"
            : "absolute bg-transparent"
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            {/* Logo - Left aligned for both SM and LG */}
            <div className="w-30 mt-2 max-w-full px-4 xl:mr-12">
              <Avatar
                onClick={() => {
                  window.location.href = "/";
                }}
                sx={{ width: 96, height: 96, background: "transparent", cursor: "pointer" }}
              >
                <Image
                  src="/logo33.png"
                  alt="Logo"
                  width={500}
                  height={500}
                  className="w-full dark:hidden"
                />
                <Image
                  src="/logo66.png"
                  alt="Logo"
                  width={500}
                  height={500}
                  className="hidden w-full dark:block"
                />
              </Avatar>
            </div>

            {/* Navigation - Center for LG, Hidden for SM */}
            <div className=" lg:flex lg:flex-1 lg:justify-center">
              <nav id="navbarCollapse" className="navbar">
                <ul className="flex justify-center space-x-6">
                  {menuData.map((menuItem, index) => (
                    <li key={index} className="group relative font-bold">
                      {menuItem.path ? (
                        <Link
                          href={menuItem.path}
                          className={`flex mt-6 mb-6 p-2 transition duration-200 ease-in-out items-center justify-center lg:mr-0 lg:inline-flex rounded-xl border border-transparent ${
                            usePathName === menuItem.path
                              ? "text-white bg-primary dark:bg-dark dark:text-blue-500"
                              : "text-dark hover:text-white dark:text-white/70 dark:hover:text-blue-500 hover:bg-primary dark:hover:bg-dark"
                          }`}
                        >
                          {menuItem.title}
                        </Link>
                      ) : (
                        <>
                          <p
                            onClick={() => handleSubmenu(index)}
                            className="mt-6 p-2 flex cursor-pointer items-center justify-between text-base text-dark group-hover:text-primary dark:text-white/70 dark:group-hover:text-white lg:inline-flex"
                          >
                            {menuItem.title}
                            <span className="pl-3">
                              <svg width="25" height="24" viewBox="0 0 25 24">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                          </p>
                          <div
                            className={`submenu relative left-0 top-full rounded-sm bg-white transition-[top] duration-300 group-hover:opacity-100 dark:bg-dark lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${
                              openIndex === index ? "block" : "hidden"
                            }`}
                          >
                            {menuItem.submenu.map((submenuItem, index) => (
                              <Link
                                href={submenuItem.path}
                                key={index}
                                className="block rounded py-2.5 text-sm text-dark hover:text-primary dark:text-white/70 dark:hover:text-white lg:px-3"
                              >
                                {submenuItem.title}
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Right side container for Theme Toggle and Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggler - Center for SM, Right for LG */}
              <div className="flex-1 lg:flex-none">
                <ThemeToggler />
              </div>

              {/* Mobile Menu Button - Right aligned for SM only */}
              <button
                onClick={navbarToggleHandler}
                id="navbarToggler"
                aria-label="Mobile Menu"
                className="block lg:hidden rounded-lg px-3 py-[6px] ring-primary focus:ring-2"
              >
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                    navbarOpen ? " top-[7px] rotate-45" : " "
                  }`}
                />
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                    navbarOpen ? "opacity-0 " : " "
                  }`}
                />
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                    navbarOpen ? " top-[-8px] -rotate-45" : " "
                  }`}
                />
              </button>
            </div>

            {/* Mobile Navigation Menu */}
            <div
              className={`lg:hidden absolute right-0 top-full z-30 w-[250px] rounded border-[.5px] border-body-color/50 bg-white px-6 py-4 duration-300 dark:border-body-color/20 dark:bg-dark ${
                navbarOpen ? "visible opacity-100" : "invisible opacity-0"
              }`}
            >
              <nav>
                <ul className="block">
                  {menuData.map((menuItem, index) => (
                    <li key={index} className="group relative font-bold">
                      {menuItem.path ? (
                        <Link
                          href={menuItem.path}
                          className={`flex py-2 text-base transition duration-200 ease-in-out ${
                            usePathName === menuItem.path
                              ? "text-primary"
                              : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                          }`}
                        >
                          {menuItem.title}
                        </Link>
                      ) : (
                        <>
                          <p
                            onClick={() => handleSubmenu(index)}
                            className="flex cursor-pointer items-center justify-between py-2 text-base text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                          >
                            {menuItem.title}
                            <span className="pl-3">
                              <svg width="25" height="24" viewBox="0 0 25 24">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                          </p>
                          <div
                            className={`submenu relative rounded-sm bg-white transition-[top] duration-300 dark:bg-dark ${
                              openIndex === index ? "block" : "hidden"
                            }`}
                          >
                            {menuItem.submenu.map((submenuItem, index) => (
                              <Link
                                href={submenuItem.path}
                                key={index}
                                className="block py-2.5 pl-4 text-sm text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                              >
                                {submenuItem.title}
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;