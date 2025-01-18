import Sidebar from "./Sidebar";
import PropTypes from "prop-types";

const LayoutWithSidebar = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full m-2 sm:m-8 overflow-hidden dark:text-white ">
        {children}
      </div>
    </div>
  );
};

export default LayoutWithSidebar;
LayoutWithSidebar.propTypes = {
  children: PropTypes.node.isRequired,
};