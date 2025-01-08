import { useEffect, useState } from "react";
import PropTypes from "prop-types"

const GlobalSetting = ({ children }) => {
  const [isRender, setIsRender] = useState(true);


  useEffect(() => {
    setIsRender(false);
  }, []);

  return <>{!isRender && children}</>;
};
export default GlobalSetting;

GlobalSetting.propTypes = {
  children: PropTypes.node.isRequired
}