import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import React, { type SetStateAction } from 'react'
import { FileService } from '../../services/HandleFileService';
interface UploadProps {
    open: boolean,
    setOpen: React.Dispatch<SetStateAction<boolean>>;
    setCount: React.Dispatch<SetStateAction<number>>
}

const SaleUploadPopup = ({open, setOpen, setCount}: UploadProps) => {
    const { uploadFile } = FileService("sale-upload");

    const handleSubmit = async () => {
        await uploadFile("saleupload", setOpen, setCount);
    }
  return (
    <React.Fragment>
        <Dialog open={open} fullWidth>
            <DialogTitle>
                Tải lên tập tin
            </DialogTitle>
            <DialogContent>
                <input 
                    id="saleupload"
                    type='file' 
                    accept='.xlsx, .xls'
                    className='bg-lime-100 w-60 p-2 cursor-pointer rounded-md' />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)} variant='outlined'>Hủy</Button>
                <Button variant='contained' onClick={handleSubmit}>Tải lên</Button>
            </DialogActions>
        </Dialog>
    </React.Fragment>
  )
}

export default SaleUploadPopup