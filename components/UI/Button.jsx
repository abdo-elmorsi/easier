import PropTypes from "prop-types";
import classNames from "classnames";

const Button = ({ className = "btn--primary", type = "button", children, disabled, ariaLabel, ...rest }) => {
  const boxClasses = classNames(
    `btn`,
    className
  );
  return (
    <button
      className={boxClasses}
      aria-label={ariaLabel || (typeof children === "string" ? children : "button action")} // Dynamic default aria-label
      type={type}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
};

export default Button;
