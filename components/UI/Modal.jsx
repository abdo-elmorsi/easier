import React from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { LockClosedIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({
  title,
  show,
  onClose,
  footer = true,
  onUpdate,
  submitText = null,
  children,
}) {
  const { t } = useTranslation("common")
  return (
    <>
      {show && (
        <>
          <div className="fixed inset-0 top-20 z-[9998] flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
            <div className="relative z-[51] m-4 w-auto sm:m-6">
              {/*content*/}
              <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-center justify-between p-4 border-b border-solid rounded-t border-slate-200 dark:border-gray-500 dark:bg-gray-800 dark:text-white">
                  <h3 className="text-3xl font-semibold capitalize">{title}</h3>
                  <button
                    aria-label="toggle modal"
                    className="float-right p-2 transition-all duration-200 rounded-full hover:rotate-180 bg-secondary text-primary hover:text-white hover:bg-hoverPrimary rtl:ml-0 rtl:mr-auto"
                    onClick={onClose}
                  >
                    <XMarkIcon width={25} />
                  </button>
                </div>
                {/*body*/}
                <div className="relative flex-auto p-4 dark:border-gray-500 dark:bg-gray-800 dark:text-white">
                  {children}
                </div>
                {/*footer*/}
                {footer && (
                  <div className="flex items-center justify-end p-4 border-t border-solid rounded-b border-slate-200 dark:border-gray-500 dark:bg-gray-800 dark:text-white">
                    <Button
                      className="btn btn--secondary"
                      type="button" onClick={onClose}>
                      {t("cancel_key")}
                    </Button>
                    <Button
                      className={" btn btn--primary ml-4 rtl:mr-4"}
                      type="button"
                      onClick={onUpdate}
                    >
                      {submitText || t("submit_key")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div
              className="fixed inset-0 z-50 bg-gray-800 opacity-75 dark:bg-gray-300"
              onClick={onClose}
            ></div>
          </div>
        </>
      )}
    </>
  );
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  footer: PropTypes.bool,
  onUpdate: PropTypes.func,
  submitText: PropTypes.string,
  children: PropTypes.node.isRequired,
};