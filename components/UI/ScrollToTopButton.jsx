import React, { useState, useEffect, useRef } from "react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef(null);

  const handleScroll = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const handleButtonClick = () => {
    const buttonElement = buttonRef.current;
    if (buttonElement) {
      buttonElement.blur();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          ref={buttonRef}
          aria-label="scroll to top"
          className="animate-bounce fixed bottom-4 rtl:right-auto rtl:left-4 right-4 p-2 bg-primary dark:bg-gray-800 text-white rounded-full shadow-md hover:bg-hoverPrimary dark:hover:bg-gray-700 focus:outline-none"
          onClick={handleButtonClick}
        >
          <ChevronUpIcon className="w-6 h-6" />
        </button>
      )}
    </>
  );
}

export default ScrollToTopButton;