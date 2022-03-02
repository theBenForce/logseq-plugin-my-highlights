import React from 'react';

interface BasicDialogProps {
  onClose?: () => void;
}

export const BasicDialog: React.FC<BasicDialogProps> = ({ children, onClose }) => {
  const innerRef = React.useRef<HTMLDivElement>(null);

  return <main
        className="backdrop-filter backdrop-blur-md fixed inset-0 flex items-center justify-center"
        onClick={(e) => {
          if (!innerRef.current?.contains(e.target as any) && onClose) {
            onClose();
          }
        }}
      >
    <div ref={innerRef}>
      <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-lg" style={{
        background: "var(--ls-primary-background-color)"
      }}>
    {children}
      </div>
    </div>
    </main>;
};

export const DialogActions: React.FC = ({ children }) => {
  return <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:w-full">
    {children}
  </div>;
}

interface DialogHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ title, icon }) => {

  return <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
    <div className="sm:flex sm:items-start">
      {icon && <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
        {icon}
      </div>}
      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">{title}</h3>
      </div>
    </div>
  </div>;
};

interface DialogActionProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const DialogAction: React.FC<DialogActionProps> = ({ label, onClick, disabled }) => {
  return <button disabled={disabled} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm" onClick={onClick}>{label}</button>;
}