import { utils, writeFile } from "xlsx";

const exportExcel = async (data = [], columns = [], name = "report", errorCallback) => {

  try {
    const headersLabel = Array.isArray(columns)
      ? columns.filter((e) => !e?.noExport).map((e) => e.name)
      : [];
    const sheetsData = [
      headersLabel,
      ...Array.from(data, (item) =>
        Array.isArray(columns)
          ? columns
            .filter((c) => !c?.noExport)
            .map((c) => (c.getValue ? c.getValue(item) : c?.selector(item)))
          : []
      ),
    ];
    const wb = utils.book_new();
    const ws = utils.aoa_to_sheet(sheetsData);
    utils.book_append_sheet(wb, ws, name);
    ws["!cols"] = headersLabel.map((e) => ({ wch: 10 + (e?.length || 0) }));
    writeFile(wb, `${name}.xls`, { sheet: name });
  } catch (error) {
    errorCallback(error?.message || "Something went wrong!");


  }
};

export default exportExcel;
