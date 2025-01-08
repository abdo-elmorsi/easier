import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import PropTypes from "prop-types";

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { MinimizedBox } from "components/UI";
const Index = () => {
    const { t } = useTranslation("common");

    return (
        <>
            <div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
                <Header
                    title={t("settings_key")}
                    path="/settings"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />

                <div className="flex justify-center items-center w-full remain-height text-primary text-3xl">
                    {t("settings_key")}
                </div>

            </div>

        </>
    );
};

Index.getLayout = function PageLayout(page) {
    return (
        <Layout>
            <LayoutWithSidebar>{page}</LayoutWithSidebar>
        </Layout>
    );
};

Index.propTypes = {
    session: PropTypes.object.isRequired
};

export const getServerSideProps = async ({ req, locale, resolvedUrl }) => {
    const session = await getSession({ req });

    if (!session) {
        const loginUrl = locale === "en" ? `/${locale}/login` : "/login";
        return {
            redirect: {
                destination: `${loginUrl}?returnTo=${encodeURIComponent(resolvedUrl || "/")}`,
                permanent: false
            }
        };
    } else {
        return {
            props: {
                session,
                ...(await serverSideTranslations(locale, ["common"]))
            }
        };
    }
};

export default Index;