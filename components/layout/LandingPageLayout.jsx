import React from "react";
import LandingPageMainNav from "./LandingPageMainNav";
import PropTypes from "prop-types"
import LandingPageFooter from "./LandingPageFooter";

const LandingPageLayout = ({ children }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 min-h-screen">
      <LandingPageMainNav />
      <main className="container">
        {children}
      </main>
      <LandingPageFooter />

    </div>
  );
};


LandingPageLayout.propTypes = {
  children: PropTypes.node.isRequired,
}
export default LandingPageLayout;
