import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box, Fade } from "@mui/material";
import "./Modal.scss";

const Modal = ({ children, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open with animation after mounting
    setIsOpen(true);

    // Add event listener to close modal on escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <Fade in={isOpen} timeout={300}>
      <Box className="modal-container">
        <div className="modal-content">{children}</div>
      </Box>
    </Fade>
  );
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
