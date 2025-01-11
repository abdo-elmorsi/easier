import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { DeleteModal, Header, Table, PrintView } from "components/global";
import { Actions, Button, Modal } from "components/UI";
import { exportExcel } from "utils";
import { useHandleMessage, useQueryString } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import moment from 'moment-timezone';

const Index = () => {
    const router = useRouter();
    const language = router.locale.toLowerCase();
    const date_format = language === "en" ? "DD-MM-YYYY (hh:mm-A)" : "DD-MM-YYYY (hh:mm-A)";
    const handleMessage = useHandleMessage();
    const { t } = useTranslation("common");
    const [exportingExcel, setExportingExcel] = useState(false);
    const printViewRef = useRef(null);



    const { queryString } = useQueryString();

    // Fetch data using the API
    const { data: tableData, isLoading, mutate } = useApi(`/towers?${queryString}`);

    // ================== Delete Logic ==================

    const [showDeleteModal, setShowDeleteModal] = useState({
        loading: false,
        isOpen: false,
        id: null
    });
    const { executeMutation } = useApiMutation(`/towers`);

    const closeDeleteModal = () => {
        setShowDeleteModal({});
    };

    const handleDelete = async () => {
        setShowDeleteModal((prev) => ({ ...prev, loading: true }));
        try {
            await executeMutation("DELETE", { id: showDeleteModal.id });
            mutate();
            closeDeleteModal();
        } catch (error) {
            handleMessage(error);
        } finally {
            setShowDeleteModal((prev) => ({ ...prev, loading: false }));
        }
    };

    // ================== Table Columns ==================
    const columns = useMemo(
        () => [
            {
                name: t("name_key"),
                selector: (row) => row?.name,
                sortable: true,
                width: "150px"
            },
            {
                name: t("address_key"),
                selector: (row) => row?.address,
                sortable: true,
                width: "200px"
            },
            {
                name: t("num_of_floors_key"),
                selector: (row) => row?.num_of_floors,
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
                            onClick={() => router.push(`/towers/add-update?id=${row?.id}`)}
                            className="px-3 py-2 cursor-pointer btn--primary"
                        >
                            <PencilSquareIcon width={22} />
                        </Button>
                        <Button
                            onClick={() =>
                                setShowDeleteModal({ isOpen: true, id: row?.id })
                            }
                            className="px-3 py-2 text-white bg-red-500 cursor-pointer hover:bg-red-600"
                        >
                            <TrashIcon width={22} />
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
        await exportExcel(tableData, columns, t("towers_key"), handleMessage);
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
            <div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
                <Header
                    title={t("towers_key")}
                    path="/towers"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <Table
                    columns={columns}
                    data={tableData || []}
                    loading={isLoading}
                    searchAble={false}
                    actions={
                        <Actions
                            disableSearch={false}
                            addMsg={t("add_key")}
                            onClickAdd={() => router.push("/towers/add-update")}
                            onClickPrint={exportPDF}
                            isDisabledPrint={!tableData?.length}
                            onClickExport={handleExportExcel}
                            isDisabledExport={exportingExcel || !tableData?.length}
                        />
                    }
                />
            </div>
            {tableData?.length && <PrintView
                title={t("towers_key")}
                ref={printViewRef}
                data={tableData}
                columns={columns}
            />}
            {showDeleteModal?.isOpen && (
                <Modal
                    title={t("delete_key")}
                    show={showDeleteModal?.isOpen}
                    footer={false}
                    onClose={closeDeleteModal}
                >
                    <DeleteModal
                        showDeleteModal={showDeleteModal}
                        handleClose={closeDeleteModal}
                        handleDelete={handleDelete}
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

Index.propTypes = {
    session: PropTypes.object.isRequired
};

export const getServerSideProps = async ({ req, locale, resolvedUrl }) => {
    const session = await getSession({ req });
    const userRole = session?.user?.role;

    if (!session || userRole == "flat") {
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