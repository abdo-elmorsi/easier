import Sidebar from "./Sidebar";
import PropTypes from "prop-types";

const LayoutWithSidebar = ({ children }) => {
  return (
    <div className="flex antialiased text-black bg-gray-100 remain-height dark:bg-gray-700 dark:text-white">
      <Sidebar />
      <div className="block w-full m-2 overflow-hidden sm:m-8 dark:bg-gray-700 dark:text-white ">
        {children}
      </div>
    </div>
  );
};

export default LayoutWithSidebar;
LayoutWithSidebar.propTypes = {
  children: PropTypes.node.isRequired,
};