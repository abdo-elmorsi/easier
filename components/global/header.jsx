import Link from 'next/link';
import PropTypes from 'prop-types';
import clsx from 'clsx';

export default function Header({ title = '', path = '', links = [], classes = '' }) {

  return (
    <div className={clsx("border-b", classes)}>
      <nav className="bg-transparent">
        <ol className="flex gap-1 items-center">
          <li>
            <Link href={path}>
              <span className="text-black dark:text-white opacity-60 hover:text-primary dark:hover:text-primary">
                {title}
              </span>
            </Link>
          </li>

          {/* Conditionally add separator if there are links */}
          {links.length > 0 && (
            <li>
              <span className="text-black dark:text-white opacity-60">/</span>
            </li>
          )}

          {links.map(({ path: linkPath, label }, index) => {
            const isLastLink = index === links.length - 1;
            return (
              <li key={linkPath || index} className="flex items-center">
                <Link href={linkPath || ""}>
                  <span
                    className={clsx(
                      "text-black dark:text-white",
                      isLastLink ? "opacity-60" : "opacity-90 hover:text-primary dark:hover:text-primary"
                    )}
                  >
                    {label}
                  </span>
                </Link>

                {/* Add a separator for each link except the last one */}
                {!isLastLink && (
                  <span className="mx-2 text-black dark:text-white opacity-60">/</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      label: PropTypes.string.isRequired,
    })
  ),
  classes: PropTypes.string,
};
