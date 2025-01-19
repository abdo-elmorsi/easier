import { useCallback, useMemo } from "react";
import {
  SunIcon,
  MoonIcon,
  ArrowsUpDownIcon,
  LanguageIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightEndOnRectangleIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { signOut, useSession } from "next-auth/react";
import { MainLogo } from "components/icons";
import Link from "next/link";
import { Badge, Button, List, ListItem, ListItemPrefix, Popover, PopoverContent, PopoverHandler } from "@material-tailwind/react";
import Image from "next/image";
import { useOnlineStatus } from "hooks";
import { useTheme } from "context/ThemeContext";
import { generateCloudinaryUrl } from "utils/utils";



export default function MainNav() {
  const router = useRouter();
  const { data } = useSession();
  const user = data?.user || {};
  const isOnline = useOnlineStatus()
  const firstLetter = user?.user_name?.slice(0, 1) || "U";
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation("common");

  // Memoized language selection handler
  const selectLanguageHandler = useCallback(() => {
    const currentLang = router.locale.toLowerCase();
    router.push(router.asPath, undefined, { locale: currentLang === 'ar' ? "en" : "ar" });
  }, [router]);

  const logOut = () => {
    signOut();
  };

  const roleOptions = useMemo(
    () => [
      { label: t("admin_key"), value: "admin", },
      { label: t("user_key"), value: "user", },
    ],
    [t]
  );

  return (

    <nav style={{ zIndex: 9999 }}
      className="sticky top-0 bg-white dark:bg-gray-800"
    >
      <div className="px-2 sm:px-6">
        <div className="relative flex items-center justify-between h-16">
          <div className="inset-y-0 left-0 flex items-center sm:hidden">
          </div>
          <div className="flex items-center justify-start flex-1 sm:items-stretch sm:justify-start">
            <div className="flex items-center flex-shrink-0 w-24 h-16 md:w-52 overflow-hidden">
              <Link href="/">
                <MainLogo className="cursor-pointer" />
              </Link>
            </div>
          </div>

          <div className="items-center hidden gap-2 md:flex">

            <Button
              onClick={selectLanguageHandler}
              className="flex items-center justify-center w-8 h-8 px-2 py-2 text-sm bg-gray-200 rounded-full cursor-pointer text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            >
              {router.locale.includes("ar") ? "EN" : "AR"}
            </Button>




            {theme === "light" && (
              <SunIcon
                onClick={() => toggleTheme("dark")}
                className="w-8 h-8 px-2 py-2 mx-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 dark:bg-gray-500 dark:hover:bg-gray-400"
              />
            )}
            {theme === "dark" && (
              <MoonIcon
                onClick={() => toggleTheme("light")}
                className="w-8 h-8 px-2 py-2 mx-2 text-white bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 dark:bg-gray-500 dark:hover:bg-gray-400"
              />
            )}
          </div>
          <Popover className="relative">
            <PopoverHandler className="flex items-center justify-center">
              <button aria-label="notification btn">
                <Badge content={0}>
                  <BellIcon className="flex items-center justify-center w-8 h-8 p-2 mx-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 dark:bg-gray-500 dark:hover:bg-gray-400" />
                </Badge>

              </button>
            </PopoverHandler>
            <PopoverContent className="absolute right-0 z-50 w-64 mt-2 bg-white rounded-lg shadow-lg rtl:right-auto rtl:left-0 dark:bg-gray-700 dark:border-gray-400 dark:text-white">
              <p className="text-xs text-secondary">{t("no_notifications_key")}</p>
            </PopoverContent>
          </Popover>
          <span className="my-2 ml-5 mr-2 text-transparent border-l-2 border-gray-400 rtl:ml-2 rtl:mr-5 h-3/4">.</span>

          <Popover placement="bottom">
            <PopoverHandler>
              <Button className="flex items-center justify-between gap-4 px-2 text-black bg-transparent shadow-none dark:text-white hover:shadow-none">


                <div className="relative">
                  <span className={`w-2 h-2 rounded-full absolute -top-1 -left-1 ${isOnline ? "bg-green-500" : "bg-red-500"}`}></span>
                  {user?.img ? <Image
                    src={generateCloudinaryUrl(user.img)}
                    width={40}
                    height={40}
                    className=" rounded-full"
                    alt={user.user_name}

                  /> : <div className="flex items-center justify-center w-10 h-10 p-2 text-sm uppercase bg-gray-100 rounded-full dark:bg-gray-500">
                    {firstLetter}
                  </div>}
                </div>


                <div className="flex flex-col items-center justify-between">
                  <span> {user?.user_name}</span>
                  <span> {roleOptions.find(role => role.value == user?.role)?.label}</span>
                </div>

                <ArrowsUpDownIcon className="hidden w-5 md:flex" />
              </Button>
            </PopoverHandler>
            <PopoverContent className=" w-auto dark:bg-gray-700 dark:border-gray-400 dark:text-white z-[9999]">
              <List className="p-0">
                {/* balance in small device */}
                {/* btn dark in small device */}
                <ListItem
                  onClick={() => toggleTheme(`${theme === "light" ? "dark" : "light"}`)}
                  className="gap-4 dark:text-gray-100 hover:text-black active:text-dark md:hidden">
                  <ListItemPrefix>
                    {theme === "light" ? (<SunIcon className="w-8" />) : (<MoonIcon className="w-8" />)}
                  </ListItemPrefix>
                  {t("dark_mode_key")}
                </ListItem>
                {/* btn language in small device */}
                <ListItem
                  onClick={selectLanguageHandler}
                  className="gap-4 dark:text-gray-100 hover:text-black active:text-dark md:hidden">

                  <ListItemPrefix>
                    <LanguageIcon className="w-8" />
                  </ListItemPrefix>
                  {router.locale.includes("ar") ? "English" : "عربي"}
                </ListItem>





                {!user?.id ? (<Link href="/login">
                  <ListItem
                    className="gap-4 dark:text-gray-100 hover:text-black active:text-dark">
                    <ListItemPrefix>
                      <ArrowRightEndOnRectangleIcon className="w-8" />
                    </ListItemPrefix>
                    {t("sign_in_key")}
                  </ListItem>
                </Link>) : (
                  <>
                    {user.role !== 'flat' && <Link href="/profile">
                      <ListItem
                        as={"a"}
                        className="gap-4 dark:text-gray-100 hover:text-black active:text-dark">
                        <ListItemPrefix>
                          <UserCircleIcon className="w-8" />
                        </ListItemPrefix>
                        {t("profile_key")}
                      </ListItem>
                    </Link>}
                    <ListItem
                      onClick={logOut}
                      className="gap-4 dark:text-gray-100 hover:text-black active:text-dark">
                      <ListItemPrefix>
                        <ArrowLeftEndOnRectangleIcon className="w-8" />
                      </ListItemPrefix>
                      {t("sign_out_key")}
                    </ListItem>
                  </>
                )}


              </List>
            </PopoverContent>
          </Popover>

        </div>
      </div>
    </nav>

  );
}
