import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import React, { useState, type SetStateAction } from 'react'
import { BASE_URL } from '../../configs/configUrlBase';

interface PropsUpload {
    open: boolean,
    setOpen: React.Dispatch<SetStateAction<boolean>>;
    setCount: React.Dispatch<SetStateAction<number>>;
}

const ProductUpload = ({ open, setOpen, setCount }: PropsUpload) => {
    const handleUpload = () => {
        const fileInput = document.querySelector("#fileUploadInsert") as HTMLInputElement;
        const file = fileInput?.files[0];

        if (!file) {
            alert("Please select a file first!");
            return;
        }
        const form = new FormData();
        form.append('file', file);

        fetch(`${BASE_URL}/products/insertmany`, {
            method: 'POST',
            body: form
        }).then(response => response.json())
            .then(() => alert("Upload dữ liệu thành Công."))
            .then(() => setOpen(false))
            .then(() => setCount(c => c + 1))
            .catch(err => console.error(err));
    }
    return (
        <div>
            <Dialog open={open}>
                <Button>

                </Button>
                <DialogTitle>
                    Tải lên tập tin
                </DialogTitle>
                <form>
                    <DialogContent>
                        <input
                            id='fileUploadInsert'
                            className='border-1 p-0.5 rounded-sm'
                            type='file'
                             multiple />
                    </DialogContent>
                    <DialogActions>
                        <Button variant='outlined' onClick={() => setOpen(false)}>Hủy</Button>
                        <Button 
                            variant='contained'
                            onClick={handleUpload}
                        >Tải lên
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    )
}

export default ProductUpload