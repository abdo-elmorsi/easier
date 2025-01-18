import React from "react";
import MainNav from "./MainNav";
import PropTypes from "prop-types"

const Layout = ({ children }) => {
  return (
    <>
      <MainNav />
      <main className="min-h-[calc(100vh_-_4rem)] bg-gray-100 dark:bg-gray-700">
        {children}
      </main>
    </>
  );
};


Layout.propTypes = {
  children: PropTypes.node.isRequired,
}
export default Layout;
