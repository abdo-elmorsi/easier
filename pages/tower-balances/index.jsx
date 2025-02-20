import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { MinimizedBox, Spinner } from "components/UI";
import { useQueryString } from "hooks";
import { useApi } from "hooks/useApi";
// import { Filter } from "components/pages/tower-balances";
import { formatComma, formatMinus } from "utils/utils";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";



const Index = () => {
    // ... existing code remains the same
    const { t } = useTranslation("common");



    const { queryString } = useQueryString({});

    // Fetch data using the API
    const { data: towerBalances = {}, isLoading } = useApi(`/reports/tower-balances?${queryString}`);



    // Prepare data for charts
    const barChartData = [
        { name: t('opening_balance_key'), value: towerBalances?.openingBalance || 0 },
        { name: t('total_income_key'), value: towerBalances?.totalIncome || 0 },
        { name: t('total_outcome_key'), value: towerBalances?.totalOutComeTotal || 0 },
        { name: t('balance_key'), value: towerBalances?.balance || 0 }
    ];

    const expenseData = towerBalances?.totalOutCome ? [
        { name: t('electricity_key'), value: towerBalances.totalOutCome.electricity },
        { name: t('water_key'), value: towerBalances.totalOutCome.water },
        { name: t('waste_key'), value: towerBalances.totalOutCome.waste },
        { name: t('guard_key'), value: towerBalances.totalOutCome.guard },
        { name: t('elevator_key'), value: towerBalances.totalOutCome.elevator },
        { name: t('others_key'), value: towerBalances.totalOutCome.others }
    ] : [];

    const COLORS = ['#336a86', '#4CAF50', '#FF5722', '#9C27B0', '#FFC107', '#795548'];

    return (
        <>
            <div className="">
                <Header
                    title={t("tower_balances_key")}
                    path="/tower-balances"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
                    {isLoading ? (
                        <div className="flex justify-center items-center my-28">
                            <Spinner className="h-10 w-10" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {/* Bar Chart */}
                            <div className=" hidden md:block h-64 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">{t('financial_overview_key')}</h3>

                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                        <XAxis dataKey="name" tick={{ fill: '#555' }} />
                                        <YAxis tick={{ fill: '#555' }} />
                                        <Tooltip
                                            formatter={(value) => formatComma(value)}
                                            contentStyle={{
                                                backgroundColor: 'var(--primary)', // Removes white bg
                                                border: 'none', // Removes border
                                                borderRadius: '6px',
                                                boxShadow: 'none', // Removes shadow
                                                padding: '5px',
                                                color: '#fff' // Ensures text remains visible
                                            }}
                                            cursor={{ fill: 'rgba(51, 106, 134, 0.1)' }} // Adds a soft highlight effect
                                        />
                                        <Legend wrapperStyle={{ fontSize: '14px', marginBottom: '10px' }} />
                                        <Bar
                                            dataKey="value"
                                            fill="url(#colorGradient)"
                                            name={t('net_amount_key')}
                                            radius={[5, 5, 0, 0]}
                                        />
                                        <defs>
                                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#336a86" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#5a9fb7" stopOpacity={0.7} />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>

                            </div>


                            {/* Pie Chart for Expense Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                {/* Detailed Numbers */}
                                <div className="">
                                    <h3 className="text-lg font-semibold mb-4">{t('financial_overview_key')}</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Opening Balance */}
                                        <div className="animate-flip-up animate-delay-300 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <p className="text-gray-500 dark:text-gray-300">{t('opening_balance_key')}</p>
                                            <p className="text-xl font-semibold">{formatComma(towerBalances?.openingBalance || 0)}</p>
                                        </div>

                                        {/* Total Income */}
                                        <div className="animate-flip-up animate-delay-[600ms] p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <p className="text-gray-500 dark:text-gray-300">{t('total_income_key')}</p>
                                            <p className="text-xl font-semibold text-green-500">{formatComma(towerBalances?.totalIncome || 0)}</p>
                                        </div>

                                        {/* Total Outcome */}
                                        <div className="animate-flip-up animate-delay-[900ms] p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <p className="text-gray-500 dark:text-gray-300">{t('total_outcome_key')}</p>
                                            <p className="text-xl font-semibold text-red-500">{formatMinus(-towerBalances?.totalOutComeTotal || 0)}</p>
                                        </div>

                                        {/* Final Balance */}
                                        <div className="animate-flip-up animate-delay-[1200ms] p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <p className="text-gray-500 dark:text-gray-300">{t('balance_key')}</p>
                                            <p className="text-xl font-semibold">{formatMinus(towerBalances?.balance || 0)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-64">
                                    <h3 className="text-lg font-semibold mb-4">{t('expense_breakdown_key')}</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={expenseData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={85}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="#fff" // Adds separation between slices
                                                strokeWidth={2}
                                                animationDuration={800} // Smooth animation
                                            >
                                                {expenseData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                        style={{ cursor: 'pointer' }} // Pointer on hover
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => formatComma(value)}
                                                contentStyle={{
                                                    backgroundColor: 'var(--primary)', // Dark transparent background
                                                    border: 'none',
                                                    color: '#fff', // White text
                                                    borderRadius: '6px',
                                                    padding: '8px',
                                                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' // Subtle shadow
                                                }}
                                            />
                                            <Legend
                                                layout="vertical"
                                                align="right"
                                                verticalAlign="middle"
                                                wrapperStyle={{
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: '#555',
                                                    paddingLeft: '10px'
                                                }}
                                                formatter={(value) => t(value.toLowerCase())}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                </div>


                            </div>

                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// ... rest of the code remains the same

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