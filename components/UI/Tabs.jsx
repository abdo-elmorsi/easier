import { useState } from "react";
import PropTypes from 'prop-types';

export default function Tabs({ tabsData }) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <div className="flex flex-wrap gap-3 border-b dark:border-gray-500">
        {tabsData.map((tab, idx) => {
          return (
            <button
              type="button"
              aria-label={tab.label}
              key={tab.label}
              className={`flex flex-1 md:flex-initial items-center gap-1 capitalize p-2 rounded-t-md ${idx === activeTabIndex
                ? "bg-gray-600 text-white  dark:bg-gray-900"
                : "bg-gray-100 dark:bg-gray-800"
                }`}
              onClick={() => setActiveTabIndex(idx)}
            >
              {tab.icon} {tab.label}
            </button>
          );
        })}
      </div>
      <div className="py-4 border-t-2">{tabsData[activeTabIndex].content}</div>
    </div>
  );
}

Tabs.propTypes = {
  tabsData: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      label: PropTypes.string,
      content: PropTypes.node,
    })
  ).isRequired,
};
