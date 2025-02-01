import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  CogIcon,
  DocumentChartBarIcon,
  HomeIcon,
  RocketLaunchIcon,
  TruckIcon,
  UsersIcon,

} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo } from "react";
import { Overview } from "components/icons";
import { useSavedState } from "hooks";
import { Button } from "components/UI";
import { useSession } from "next-auth/react";
import { getRole } from "utils/utils";


const Sidebar = React.memo(() => {
  const { data: session } = useSession();
  const admin = getRole(session, "admin")
  const user = getRole(session, "user")
  const flat = getRole(session, "flat")
  const router = useRouter();
  const [activeAdminSubMenu, setActiveAdminSubMenu] = useState(null);
  const [fixedSideBar, setFixedSideBar] = useSavedState(true, "easier-2-fixed-side-barr-cache")


  const Links = useMemo(() => [
    {
      nameAR: "ملخص",
      nameEN: "Overview",
      href: "/",
      current: router.pathname === "/",
      icon: <Overview className="w-5 h-5" />,
      submenuOpen: false,
    },
    {
      nameAR: "المستخدمين",
      nameEN: "Users",
      href: "/users",
      current: router.pathname === "/users",
      icon: <UsersIcon className="w-5 h-5" />,
      submenuOpen: false,
      omit: !admin
    },
    {
      nameAR: "الابراج",
      nameEN: "Towers",
      href: "/towers",
      current: router.pathname === "/towers",
      icon: <BuildingOfficeIcon className="w-5 h-5" />,
      submenuOpen: false,
      omit: flat
    },
    {
      nameAR: "الشقق",
      nameEN: "Flats",
      href: "/flats",
      current: router.pathname === "/flats",
      icon: <HomeIcon className="w-5 h-5" />,
      submenuOpen: false,
      omit: flat
    },
    {
      nameAR: "ألاجرأت",
      nameEN: "Actions",
      icon: <RocketLaunchIcon className="w-5 h-5" />,
      submenuOpen: activeAdminSubMenu === 4,
      submenu: [
        {
          nameAR: "الرصيد الافتتاحي",
          nameEN: "Opening Balance",
          href: "/opening-balance",
          icon: <TruckIcon className="w-5 h-5" />,
          current: router.pathname === "/opening-balance",
        },
        {
          nameAR: "المصاريف التقديريه",
          nameEN: "Estimated expenses",
          href: "/estimated-expenses",
          icon: <TruckIcon className="w-5 h-5" />,
          current: router.pathname === "/estimated-expenses",
        },
        {
          nameAR: "التسوية",
          nameEN: "Settlement",
          href: "/settlement",
          icon: <TruckIcon className="w-5 h-5" />,
          current: router.pathname === "/settlement",
        },
      ],
      omit: flat
    },
    {
      nameAR: "التقارير",
      nameEN: "Reports",
      icon: <DocumentChartBarIcon className="w-5 h-5" />,
      submenuOpen: activeAdminSubMenu === 5,
      submenu: [
        {
          nameAR: "شهري",
          nameEN: "Monthly",
          href: "/monthly-report",
          icon: <TruckIcon className="w-5 h-5" />,
          current: router.pathname === "/monthly-report",
        },
        {
          nameAR: "سنوي",
          nameEN: "Annually",
          href: "/annually-report",
          icon: <TruckIcon className="w-5 h-5" />,
          current: router.pathname === "/annually-report",
        },
        {
          nameAR: "ارصدت البرج",
          nameEN: "Tower balances",
          href: "/tower-balances",
          icon: <TruckIcon className="w-5 h-5" />,
          current: router.pathname === "/tower-balances",
        },
        {
          nameAR: "سجل المستخدم",
          nameEN: "User Log",
          href: "/user-log",
          icon: <TruckIcon className="w-5 h-5" />,
          current: router.pathname === "/user-log",
          omit: !admin
        },

      ],
    },
    {
      nameAR: "الإعدادات",
      nameEN: "Settings",
      icon: <CogIcon className="w-5 h-5" />,
      href: "/settings",
      current: router.pathname === "/settings",
      submenuOpen: false,
      omit: !admin
    },
  ], [admin, flat, router.pathname, activeAdminSubMenu]);



  return (
    // w-14 hover:w-64
    <div className={`min-h-[calc(100vh_-_4rem)] group flex flex-col flex-shrink-0  transition-all duration-300 bg-white w-14 hover:w-64 ${fixedSideBar ? "md:w-64 opened" : ""} sidebar dark:bg-gray-900 `}>
      <div className="flex flex-col fixed">
        <ul className="flex flex-col py-4 space-y-1 overflow-y-auto no-scrollbar border-y-2 border-gray-100 dark:border-gray-700">


          {Links?.map((tab, index) => {
            return !tab.omit ? <li key={tab.nameEN}>
              {tab.submenu ? (
                <>
                  <div className="relative flex flex-row items-center h-11">
                    <button
                      aria-label="sidebar toggle"
                      onClick={() =>
                        setActiveAdminSubMenu(() =>
                          tab.submenuOpen ? null : index
                        )
                      }
                      className={`w-full focus:outline-none relative flex h-11 flex-row items-center border-l-4 pr-6 rtl:pr-4 rtl:border-l-0 rtl:border-r-4 dark:text-white hover:text-primary dark:hover:text-primary hover:border-primary ${tab.submenuOpen ? '!text-primary border-primary' : 'border-transparent'
                        }`}
                    >
                      <span className="inline-flex items-center justify-center ml-4">
                        {tab.icon}
                      </span>
                      <span className="ml-2 text-sm tracking-wide truncate">
                        {router.locale === 'en' ? tab.nameEN : tab.nameAR}
                      </span>
                      <span className="absolute inset-y-0 flex items-center pl-2 duration-300 opacity-0 group-hover:opacity-100 md:group-[.opened]:opacity-100 transition-all md:hover::opacity-100 arrow-icon right-2 rtl:pr-2 rtl:right-auto rtl:left-2">
                        <ChevronRightIcon
                          className={`duration-200 w-5 h-5 ${tab.submenuOpen ? 'rtl:rotate-90' : 'rotate-90 rtl:-rotate-180'}`}
                        />
                      </span>
                    </button>
                  </div>
                  {tab.submenuOpen && (
                    <ul className="flex flex-col px-2 py-4 space-y-1">
                      {tab.submenu.map((subTab) => {
                        return !subTab.omit ? (
                          <li key={subTab.href} className="tab_link cursor-pointer">
                            <Link href={subTab.href} >
                              <a className={`${subTab.current
                                ? '!text-primary !border-primary'
                                : 'border-transparent hover:text-primary'
                                } dark:text-white hover:border-primary dark:hover:text-primary text-white-600 relative flex h-11 flex-row items-center border-l-4 focus:outline-none rtl:border-l-0 rtl:border-r-4 rtl:pr-2`}
                              >
                                <span className="inline-flex items-center justify-center ml-4 duration-500 sub-menu-icon">
                                  <ArrowRightCircleIcon className="w-5 h-5 rtl:rotate-180" />
                                </span>
                                <span className="ml-2 text-sm tracking-wide truncate">
                                  {router.locale === 'en' ? subTab.nameEN : subTab.nameAR}
                                </span>
                              </a>
                            </Link>
                          </li>
                        ) : null
                      })}
                    </ul>
                  )}
                </>
              ) : (
                <div className="cursor-pointer" onClick={() => activeAdminSubMenu && setActiveAdminSubMenu(null)}>
                  <Link href={tab.href} >
                    <a
                      className={`${tab.current
                        ? 'text-primary border-primary'
                        : 'border-transparent hover:text-primary'
                        } dark:text-white hover:border-primary dark:hover:text-primary text-white-600 relative flex h-11 flex-row items-center border-l-4 pr-6 focus:outline-none rtl:border-l-0 rtl:border-r-4 rtl:pr-4`}
                    >
                      <span className="inline-flex items-center justify-center ml-4">
                        {tab.icon}
                      </span>
                      <span className="ml-2 text-sm tracking-wide truncate">
                        {router.locale === 'en' ? tab.nameEN : tab.nameAR}
                      </span>
                    </a>
                  </Link>
                </div>
              )}
            </li> : null
          })}
        </ul>


        <Button onClick={() => setFixedSideBar(!fixedSideBar)} className="mx-auto mt-auto text-xs tracking-wide text-center truncate text-primary">
          <ArrowLeftCircleIcon className={` transition-all duration-300 hover:scale-110 ${!fixedSideBar ? "-rotate-180 rtl:rotate-0" : "rtl:rotate-180"}`} width={25} />
        </Button>
      </div>
    </div>
  );
});
Sidebar.displayName = 'Sidebar';

export default Sidebar;