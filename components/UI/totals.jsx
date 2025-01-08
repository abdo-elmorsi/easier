import { useRef, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useSavedState } from "hooks";

const MinimizedBox = ({
  items = [],
  className = "",
}) => {
  const { t } = useTranslation("common");
  const [loading, setLoading] = useState(false);

  console.log({ items });




  return (
    <div className={"bg-white dark:bg-gray-800 rounded-xl shadow-md mb-4"}>
      <div className="p-4">
        <div>
          {items.map(item => {

            return <div>{item.amount}</div>
          })}
        </div>
      </div>
    </div>
  );
};

MinimizedBox.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default MinimizedBox;
