import moment from 'moment-timezone';

const CopyRight = () => {
  return (
    <p className="fixed text-xs bottom-1 right-2 rtl:right-auto rtl:left-2 dark:text-white">
      © Copyright:{' '}
      <a
        target="_blank"
        rel="noreferrer"
        className="text-primary hover:underline cursor-pointer"
        href="https://elmorsi.vercel.app/"
      >
        Abdo Elsohagi
      </a>{' '}
      {moment().format("YYYY")}
    </p>
  );
};

export default CopyRight;
