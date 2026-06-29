import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import React, { useState, type SetStateAction } from 'react'
import { BASE_URL } from '../../configs/configUrlBase';

interface PropsUpload {
    open: boolean,
    setOpen: React.Dispatch<SetStateAction<boolean>>;
    setCount: React.Dispatch<SetStateAction<number>>;
}

const ProductUpload = ({ open, setOpen, setCount }: PropsUpload) => {
    const handleUpload = async () => {
        const fileInput = document.querySelector("#fileUploadInsert") as HTMLInputElement;
        const file = fileInput?.files[0];

        if (!file) {
            alert("Please select a file first!");
            return;
        }
        const form = new FormData();
        form.append('file', file);
        try {
            const response = await fetch(`${BASE_URL}/products/insertmany`, {
                method: 'POST',
                body: form
            });

            if(!response.ok) {
                const errors = await response.json();
                alert(`${errors.detail}`)
            }

            setOpen(false);
            setCount(c => c + 1);
            return {errors: null}
        } catch (error) {
            console.error(error);
            return {errors: error}
        }
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
                        id="fileUploadInsert"
                            type="file"
                            className="block w-full text-sm text-gray-500
                            file:mr-4
                            file:py-2
                            file:px-4
                            file:rounded-md
                            file:border-0
                            file:bg-blue-50
                            file:text-blue-700
                            hover:file:bg-blue-100"
                        />
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