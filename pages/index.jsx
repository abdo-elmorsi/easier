import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Custom
import { LandingPageLayout } from "components/layout";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const Index = () => {
    const { t } = useTranslation("common");
    return (
        <main className="min-h-screen py-10">
            {/* Hero Section */}
            <section className="relative text-center py-20">
                <div className="container mx-auto px-6" data-aos="fade-up">
                    <h1 className="text-gray-800 dark:text-gray-200 text-4xl md:text-6xl font-bold">
                        {t("Easier")} – {t("tower_management_made_simple_key")}
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-400">
                        {t("hero_description_key")}
                    </p>
                    <Link href="/dashboard">
                        <button className="mt-6 px-6 py-3 bg-hoverPrimary text-white rounded-lg shadow-lg text-lg font-semibold transition-all hover:bg-primary" data-aos="zoom-in">
                            {t("get_started_key")}
                        </button>
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-6 md:px-12 bg-gray-100 dark:bg-gray-800">
                <div className="max-w-5xl mx-auto text-center" data-aos="fade-up">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t("key_features_key")}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{t("features_description_key")}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
                    {[
                        { title: t("feature1_title_key"), icon: "🖥️", text: t("feature1_description_key") },
                        { title: t("feature2_title_key"), icon: "🔔", text: t("feature2_description_key") },
                        { title: t("feature3_title_key"), icon: "📱", text: t("feature3_description_key") },
                    ].map((feature, idx) => (
                        <div key={idx} className="p-6 text-center border rounded-lg shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900 dark:border-gray-700" data-aos="fade-up" data-aos-delay={idx * 200}>
                            <span className="text-5xl">{feature.icon}</span>
                            <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">{feature.title}</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 px-6 md:px-12">
                <div className="max-w-5xl mx-auto text-center" data-aos="fade-up">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t("how_it_works_key")}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{t("how_it_works_description_key")}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
                    {[
                        { title: t("step1_title_key"), icon: "📝", text: t("step1_description_key") },
                        { title: t("step2_title_key"), icon: "💰", text: t("step2_description_key") },
                        { title: t("step3_title_key"), icon: "📊", text: t("step3_description_key") },
                    ].map((step, idx) => (
                        <div key={idx} className="p-6 text-center border rounded-lg shadow-sm hover:shadow-md transition-all bg-gray-50 dark:bg-gray-800 dark:border-gray-700" data-aos="fade-up" data-aos-delay={idx * 200}>
                            <span className="text-5xl">{step.icon}</span>
                            <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">{step.title}</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{step.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-16 px-6 md:px-12 bg-gray-100 dark:bg-gray-800">
                <div className="max-w-5xl mx-auto text-center" data-aos="fade-up">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t("pricing_title_key")}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{t("pricing_description_key")}</p>

                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
                    {[
                        {
                            title: t("pricing_basic_key"), price: t("pricing_basic_price_key"), features: [t("pricing_basic_feature1_key"), t("pricing_basic_feature2_key"), t("pricing_basic_feature3_key")]
                        },
                        {
                            title: t("pricing_pro_key"), price: t("pricing_pro_price_key"), features: [t("pricing_pro_feature1_key"), t("pricing_pro_feature2_key"), t("pricing_pro_feature3_key")]
                        },
                        {
                            title: t("pricing_enterprise_key"), price: t("pricing_enterprise_price_key"), features: [t("pricing_enterprise_feature1_key"), t("pricing_enterprise_feature2_key"), t("pricing_enterprise_feature3_key")]
                        }
                    ].map((plan, idx) => (
                        <div key={idx} className="p-6 text-center border rounded-lg shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900 dark:border-gray-700" data-aos="zoom-in" data-aos-delay={idx * 200}>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{plan.title}</h3>
                            <p className="mt-2 text-2xl font-bold text-primary">{plan.price}</p>
                            <ul className="mt-4 text-gray-600 dark:text-gray-400">
                                {plan.features.map((feature, i) => (
                                    <li key={i}>✔ {feature}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section className="text-center py-20">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200" data-aos="fade-up">
                    {t("contact_us_key")}
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400" data-aos="fade-up" data-aos-delay="200">
                    {t("contact_description_key")}
                </p>
                <Link href="/contact">
                    <button className="mt-6 px-6 py-3 bg-hoverPrimary text-white rounded-lg shadow-lg text-lg font-semibold transition-all hover:bg-primary" data-aos="zoom-in">
                        {t("contact_button_key")}
                    </button>
                </Link>
            </section>
        </main>
    );
};

Index.getLayout = function PageLayout(page) {
    return <LandingPageLayout>{page}</LandingPageLayout>;
};

export const getServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
};

export default Index;
