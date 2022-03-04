import React from 'react';
import { BasicDialog, DialogAction, DialogActions, DialogHeader } from './Basic';

interface KindleLoginDialogProps {
  onClose: () => void;
  show: boolean;
}

export const KindleLoginDialog: React.FC<KindleLoginDialogProps> = ({onClose, show}) => {
  return <BasicDialog show={show} onClose={onClose}>
    <DialogHeader title='Login to Kindle' />
    <iframe
      onLoad={console.info}
      className='w-full h-96'
      id='loginFrame'
      seamless
      sandbox=' allow-scripts allow-forms allow-same-origin'
      src="https://read.amazon.com/notebook" />
    <DialogActions>
      <DialogAction label='Close' onClick={onClose} />
    </DialogActions>
  </BasicDialog>;
}