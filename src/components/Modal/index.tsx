import React from 'react';
import ReactDOM from 'react-dom';

// Styles
import styles from './styles.module.scss';

export type ModalProps = {
  children?: React.ReactNode;
  show?: boolean;
};

const MODAL_CONTAINER_ID = 'modal-container';

const Modal: React.FC<ModalProps> = ({ children, show }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useLayoutEffect(() => {
    const container = window.document.getElementById(MODAL_CONTAINER_ID);

    if (!container) {
      const modalContainer = window.document.createElement('div');
      modalContainer.id = MODAL_CONTAINER_ID;
      modalContainer.className = styles.modalContainer;
      window.document.body.appendChild(modalContainer);
      containerRef.current = modalContainer;
    } else {
      containerRef.current = container as HTMLDivElement;
    }
    const containerEl = containerRef.current;
    return () => {
      window.document.body.removeChild(containerEl);
    };
  }, []);
  React.useEffect(() => {
    if (!containerRef.current) return;
    if (show) containerRef.current.classList.add(styles.show);
    else containerRef.current.classList.remove(styles.show);
  }, [show]);

  if (containerRef.current) {
    return ReactDOM.createPortal(
      <div className={styles.modalBody}>{children}</div>,
      containerRef.current
    );
  }
  return null;
};

export default Modal;
