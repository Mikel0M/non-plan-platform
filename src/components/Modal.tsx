import * as React from 'react';
import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '',
  size = 'medium'
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }

    const handleClose = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    const handleBackdropClick = (e: MouseEvent) => {
      // Don't close if clicking on form elements or their children
      const target = e.target as Element;
      if (target && (
        target.tagName === 'SELECT' || 
        target.tagName === 'OPTION' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON' ||
        target.closest('select') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('button') ||
        target.closest('.userForm') ||
        target.closest('.formFieldContainer')
      )) {
        return;
      }

      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        onClose();
      }
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('click', handleBackdropClick);

    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [isOpen, onClose]);

  const sizeClass = {
    small: 'form-narrow',
    medium: 'form-wide',
    large: 'form-extra-wide'
  }[size];

  return (
    <dialog ref={dialogRef} className="modal-z10">
      <div className={`modal-container ${className}`} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h2 className="heading-no-margin">{title}</h2>
            <button 
              type="button" 
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        )}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </dialog>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="confirm-modal-content">
        <p>{message}</p>
        <div className="cancelAccept">
          <button 
            type="button" 
            className="cancelButton" 
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className={`acceptButton ${variant === 'danger' ? 'danger' : ''}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
