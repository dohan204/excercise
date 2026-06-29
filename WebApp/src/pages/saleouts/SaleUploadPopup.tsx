import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import React, { useState, type SetStateAction } from 'react'
import { FileService } from '../../services/HandleFileService';
interface UploadProps {
    open: boolean,
    setOpen: React.Dispatch<SetStateAction<boolean>>;
    setCount: React.Dispatch<SetStateAction<number>>
}

const SaleUploadPopup = ({ open, setOpen, setCount }: UploadProps) => {
    const [fileErro, setFileError] = useState(null);
    const { uploadFile } = FileService("sale-upload");
    console.log('error', fileErro)
    const handleSubmit = async () => {
        try {
            const result = await uploadFile("saleupload", setOpen, setCount);
            if (result?.error) {
                const errorMessage = result?.error?.detail || result?.error?.title || "Đã xảy ra lỗi";

                alert(errorMessage); // Lúc này màn hình sẽ hiện đúng: "Dòng 2 Tên khách hàng không duocj để trống"
                console.log(result);
                return;
            }
        } catch (error) {
            setFileError(error as any)
        }

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