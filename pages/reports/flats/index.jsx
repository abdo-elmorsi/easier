import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";


// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";

const Index = () => {
    const { t } = useTranslation("common");

    return (
        <>
            <div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
                <Header
                    title={t("flats_key")}
                    path="/reports/flats"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <h1>{t("flats_key")}</h1>
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

export const getServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
};

export default Index;