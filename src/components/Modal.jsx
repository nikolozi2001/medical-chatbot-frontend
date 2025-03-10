import React, { useRef, useEffect } from "react";
import RemoveIcon from '@mui/icons-material/Remove';
import "./Modal.scss";

const Modal = ({ children, onClose }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !event.target.closest(".MuiSelect-root") &&
        !event.target.closest(".MuiPaper-root") &&
        !event.target.closest(".MuiPopover-root")
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    setTimeout(() => {
      modalRef.current.classList.add("show");
    }, 10);
  }, []);

  return (
    <div className="modal-overlay show">
      <div className="modal-content show" ref={modalRef}>
        <button className="close-button" onClick={onClose}>
          <RemoveIcon />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;