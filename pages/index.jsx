import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Custom
import { Layout, LayoutWithSidebar } from "components/layout";
import { Counts, EstimatedExpenses, Payments } from "components/pages/home";

const Index = () => {

    return (
        <div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">

            <Counts />
            <EstimatedExpenses />
            <Payments />
        </div>
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
