import React from "react";
import MainNav from "./MainNav";
import PropTypes from "prop-types"

const Layout = ({ children }) => {
  return (
    <>
      <MainNav />
      <main className="overflow-x-hidden bg-gray-100 remain-height dark:bg-gray-700 dark:text-gray-300">
        {children}
      </main>
    </>
  );
};


Layout.propTypes = {
  children: PropTypes.node.isRequired,
}
export default Layout;
