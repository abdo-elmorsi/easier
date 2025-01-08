import PropTypes from 'prop-types';
import { useTheme } from 'context/ThemeContext';

export default function OverView(props) {
  const { theme } = useTheme();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || 24}
      height={props.height || 24}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        d="m7.244 14.781 2.993-3.89 3.415 2.682 2.929-3.78"
        stroke={theme == "dark" ? "#e1e2e4" : "#2E3032"} strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={19.994}
        cy={4.2}
        r={1.922}
        stroke={theme == "dark" ? "#e1e2e4" : "#2E3032"} strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.924 3.12H7.656c-3.011 0-4.879 2.133-4.879 5.144v8.083c0 3.011 1.831 5.135 4.88 5.135h8.603c3.012 0 4.879-2.124 4.879-5.135v-7.04"
        stroke={theme == "dark" ? "#e1e2e4" : "#2E3032"} strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
OverView.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};