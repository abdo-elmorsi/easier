import React from "react";
import PropTypes from 'prop-types';

const TextError = ({ children }) => {
  return <div className="text-xs text-red-600 ">{children}</div>;
};
TextError.propTypes = {
  children: PropTypes.node,
};
export default TextError;
