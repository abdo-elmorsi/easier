import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header, Table, PrintView } from "components/global";
import { Actions, Button, MinimizedBox, Modal } from "components/UI";
import { exportExcel } from "utils";
import { useHandleMessage, useQueryString } from "hooks";
import { useApi } from "hooks/useApi";
import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import moment from 'moment-timezone';
import { Filter, ShowAttachmentsModal } from "components/pages/estimated-expenses";
import { formatComma } from "utils/utils";

const Index = () => {
    const router = useRouter();
    const language = router.locale.toLowerCase();
    const date_format = language === "en" ? "DD-MM-YYYY (hh:mm-A)" : "DD-MM-YYYY (hh:mm-A)";
    const handleMessage = useHandleMessage();
    const { t } = useTranslation("common");
    const [exportingExcel, setExportingExcel] = useState(false);
    const printViewRef = useRef(null);



    const { queryString } = useQueryString({});
    // Fetch data using the API
    const { data: tableData, isLoading } = useApi(`/estimated-expenses?${queryString}`);

    // ================== show images Logic ==================
    const [showImagesModal, setShowImagesModal] = useState({
        isOpen: false,
        attachments: []
    });

    const closeImagesModal = () => setShowImagesModal({ isOpen: false, attachments: [] })

    const isDisabledAdd = useMemo(() => {
        const currentMonth = moment(); // Get the current moment outside of the loop
        return tableData?.some(c => moment(c.created_at).isSame(currentMonth, 'month')); // Check if any item matches
    }, [tableData]);

    // ================== Table Columns ==================
    const columns = useMemo(
        () => [
            {
                name: t("electricity_key"),
                selector: (row) => formatComma(row?.electricity),
                sortable: true,
                width: "150px"
            },
            {
                name: t("water_key"),
                selector: (row) => formatComma(row?.water),
                sortable: true,
                width: "150px"
            },
            {
                name: t("waste_key"),
                selector: (row) => formatComma(row?.waste),
                sortable: true,
                width: "150px"
            },
            {
                name: t("guard_key"),
                selector: (row) => formatComma(row?.guard),
                sortable: true,
                width: "150px"
            },
            {
                name: t("elevator_key"),
                selector: (row) => formatComma(row?.elevator),
                sortable: true,
                width: "150px"
            },
            {
                name: t("others_key"),
                selector: (row) => formatComma(row?.others),
                sortable: true,
                width: "150px"
            },
            {
                name: t("total_key"),
                selector: (row) => formatComma(row?.electricity + row?.water + row?.waste + row?.guard + row?.elevator + row?.others),
                sortable: true,
                width: "150px"
            },
            {
                name: t("notes_key"),
                selector: (row) => row?.notes ? row?.notes.slice(0, 30) : "",
                sortable: true,
                width: "180px"
            },
            {
                name: t("created_at_key"),
                selector: (row) => row?.created_at,
                cell: (row) => moment(row?.created_at).format(date_format),
                sortable: true,
                width: "130px"
            },
            {
                name: t("updated_at_key"),
                selector: (row) => row?.updated_at,
                cell: (row) => moment(row?.updated_at).format(date_format),
                sortable: true,
                width: "130px"
            },
            {
                name: t("actions_key"),
                selector: (row) => row?.id,
                noExport: true,
                noPrint: true,
                cell: (row) => (
                    <div className="flex gap-2">
                        <Button
                            disabled={!moment(row.created_at).isSame(moment(), 'month')}
                            onClick={() => router.push(`/dashboard/estimated-expenses/add-update?id=${row?.id}`)}
                            className="px-3 py-2 cursor-pointer btn--primary"
                        >
                            <PencilSquareIcon width={22} />
                        </Button>
                        <Button
                            disabled={!row?.attachments?.length}
                            onClick={() =>
                                setShowImagesModal({ isOpen: true, attachments: row?.attachments })
                            }
                            className="px-3 py-2 text-white bg-green-500 cursor-pointer hover:bg-green-600"
                        >
                            <EyeIcon width={22} />
                        </Button>
                    </div>
                ),
                sortable: false
            }
        ],
        [date_format, router, t]
    );

    // ================== Export Functions ==================
    const handleExportExcel = async () => {
        setExportingExcel(true);
        await exportExcel(tableData, columns, t("estimated_expenses_key"), handleMessage);
        setTimeout(() => {
            setExportingExcel(false);
        }, 1000);
    };

    const exportPDF = useCallback(() => {
        if (printViewRef.current) {
            printViewRef.current.print();
        }
    }, [printViewRef.current]);

    return (
        <>
            <div className="">
                <Header
                    title={t("estimated_expenses_key")}
                    path="/dashboard/estimated-expenses"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <MinimizedBox minimized={false}>
                    <Filter />
                </MinimizedBox>
                <Table
                    columns={columns}
                    data={tableData || []}
                    loading={isLoading}
                    searchAble={false}
                    actions={
                        <Actions
                            disableSearch={false}
                            addMsg={t("add_key")}
                            isDisabledAdd={isDisabledAdd}
                            onClickAdd={() => router.push("/dashboard/estimated-expenses/add-update")}
                            onClickPrint={exportPDF}
                            isDisabledPrint={!tableData?.length}
                            onClickExport={handleExportExcel}
                            isDisabledExport={exportingExcel || !tableData?.length}
                        />
                    }
                />
            </div>
            {tableData?.length && <PrintView
                title={t("estimated_expenses_key")}
                ref={printViewRef}
                data={tableData}
                columns={columns}
            />}

            {showImagesModal?.isOpen && (
                <Modal
                    title={t("attachments_key")}
                    show={showImagesModal?.isOpen}
                    footer={false}
                    onClose={closeImagesModal}
                >
                    <ShowAttachmentsModal
                        showImagesModal={showImagesModal}
                        handleClose={closeImagesModal}
                    />
                </Modal>
            )}
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