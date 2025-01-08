import { useState } from "react";
import DataTable from "react-data-table-component";
import PropTypes from "prop-types";
import SearchInput from "../SearchInput";
import { Spinner } from "components/UI";
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";

const Table = ({
  data,
  columns,
  noHeader = false,
  pagination = true,
  paginationPerPage = 10,
  paginationRowsPerPageOptions = [10, 25, 50, 100, 1000],
  actions,
  searchAble = true,
  selectableRowSelected,
  ...rest
}) => {
  const [searchText, setSearchText] = useState("");
  const { theme } = useTheme();
  const { t } = useTranslation("common");

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = data?.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2 mb-2">
        {searchAble && (
          <SearchInput
            searchText={searchText}
            handleSearch={handleSearch}
            id="search-bar"
            name="search-bar"
            maxLength={50}
          />
        )}
        {actions}
      </div>
      <DataTable
        data={filteredData}
        // theme={theme}
        columns={columns}
        noHeader={noHeader}
        pagination={pagination}
        paginationPerPage={paginationPerPage}
        paginationRowsPerPageOptions={paginationRowsPerPageOptions}
        progressPending={rest.loading}
        progressComponent={<Spinner className="w-10 my-36" />}
        noDataComponent={
          <h3 className="my-16">{t("table_no_data_message_key")}</h3>
        }
        paginationComponentOptions={{
          rowsPerPageText: t("rows_per_page_key"),
          rangeSeparatorText: t("of_key"),
        }}
        selectableRowSelected={selectableRowSelected}
        theme={theme}
        fixedHeader
        fixedHeaderScrollHeight="550px"
        // selectableRowsComponent={<Checkbox />}
        {...rest}
      />
    </div>
  );
};

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  noHeader: PropTypes.bool,
  pagination: PropTypes.bool,
  paginationPerPage: PropTypes.number,
  paginationRowsPerPageOptions: PropTypes.array,
  actions: PropTypes.element,
  searchAble: PropTypes.bool,
  selectableRowSelected: PropTypes.func,
};

export default Table;
