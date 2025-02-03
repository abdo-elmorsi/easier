import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Custom
import { Layout, LayoutWithSidebar } from "components/layout";
import { Counts, EstimatedExpenses, Filter, Payments } from "components/pages/home";
import { MinimizedBox } from "components/UI";

const Index = () => {

    return (
        <div className="">
            {/* <MinimizedBox minimized={false}>
                <Filter />
            </MinimizedBox> */}
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
