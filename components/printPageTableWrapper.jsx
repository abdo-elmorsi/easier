import { forwardRef, useState, useCallback, useImperativeHandle, useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import { useReactToPrint } from "react-to-print";

export const getPageStyle = (size = 'A4 portrait', additionsCss = '') => {
    return `
    @page {
        size: ${size};
        margin: 5mm;
    }
    
    html, body {
        margin: 0;
        padding: 0;
        width: 100%;
    }
    
    .page-table {
        width: 100%;
        border-spacing: 2px;
    }
    
    .table {
        width: 100%;
    }
    
    .table > tbody {
        border: 1px solid black;
    }
    
    .table > tbody > tr > td,
    .table > tfoot > tr > td {
        padding: 0 5px !important;
        border: 1px solid black;
    }
    
    .print-none {
        display: none;
    }
    
    .table > thead > tr > th {
        font-weight: bold;
        border: 1px solid black;
    }
    
    .table, .table-responsive {
        height: auto !important;
    }
    
    .print-preview {
        padding: 5px;
        display: block;
    }
    
    .avoid-break-inside {
        page-break-inside: avoid;
    }
    
    @media print {
        .print-view {
            display: block !important;
        }
        .print-hidden {
            display: none !important;
        }
        * {
            color-adjust: exact;
            -webkit-print-color-adjust: exact;
        }
    }
    @media not print {
        .print-only {
            display: none !important;
        }
    }
    ${additionsCss}
    `;
};

const PrintPageTableWrapper = forwardRef(({ filename, additionsCss = '', size = 'A4 portrait', paperMode = false, children }, ref) => {
    const componentRef = useRef(null);
    const onBeforeGetContentResolve = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const pageStyle = getPageStyle(size, additionsCss);

    const handleOnBeforeGetContent = useCallback(() => {
        return new Promise((resolve) => {
            onBeforeGetContentResolve.current = resolve;
            setIsPrinting(true);
        });
    }, []);

    const handleAfterPrint = () => {
        setIsPrinting(false);
        onBeforeGetContentResolve.current = null;
    };

    const reactToPrintContent = useCallback(() => componentRef.current, [componentRef]);

    const handlePrint = useReactToPrint({
        content: reactToPrintContent,
        documentTitle: filename,
        onBeforeGetContent: handleOnBeforeGetContent,
        onAfterPrint: handleAfterPrint,
        pageStyle: pageStyle,
        copyStyles: true,
    });

    useImperativeHandle(ref, () => ({
        print: handlePrint,
    }));

    useEffect(() => {
        if (isPrinting && onBeforeGetContentResolve.current) {
            onBeforeGetContentResolve.current();
        }
    }, [isPrinting]);

    return (
        <div className="print-view w-full" ref={componentRef}>
            {isPrinting && (
                <div className={`${!paperMode ? "mt-2" : "mt-0"} w-full`}>
                    <table className="page-table">
                        <thead>
                            <tr>
                                <th>

                                    <div className={`${!paperMode ? "pt-3" : "pt-0"} text-center `}>

                                        {filename}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {children}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
});

PrintPageTableWrapper.propTypes = {
    filename: PropTypes.string.isRequired,
    additionsCss: PropTypes.string,
    size: PropTypes.string,
    children: PropTypes.node.isRequired,
};

PrintPageTableWrapper.displayName = "PrintPageTableWrapper";
export default PrintPageTableWrapper;