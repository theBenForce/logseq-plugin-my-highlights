import React from 'react';
import { KindleBook } from "../../utils/parseKindleHighlights";
import { BasicDialog, DialogHeader } from './Basic';

interface SelectBookDetailsDialogProps {
  book: KindleBook;
  show?: boolean;
  onClose: (details?: Record<string, string>) => void;
}

export const SelectBookDetailsDialog: React.FC<SelectBookDetailsDialogProps> = ({ book, show, onClose }) => {
  const [availableBooks, setAvailableBooks] = React.useState<Array<unknown>>([]);

  if (show) {
    return <BasicDialog onClose={onClose}>
      <DialogHeader title={`Select ${book.title} Details`} />
    </BasicDialog>;
  }

  return null;
}