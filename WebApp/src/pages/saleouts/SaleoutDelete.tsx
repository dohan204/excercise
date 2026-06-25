import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React, { type SetStateAction } from 'react'
import { useDeleteProduct } from '../../services/ProductDataService';
import { useDeleteSaleout } from '../../services/SaleoutDataService';
interface DeleteProps {
    open: boolean,
    saleoutId: string | null,
    setOpen: React.Dispatch<SetStateAction<boolean>>;
    setCount: React.Dispatch<SetStateAction<number>>;
}
const SaleoutDeletePopup = ({ open, setOpen, saleoutId, setCount }: DeleteProps) => {
    const {handleDelete} = useDeleteSaleout();

    const handleSubmit = async () => {
        await handleDelete(saleoutId as string)
        setOpen(false);
        setCount(c => c + 1);
    } 
    return (
        <React.Fragment>
            <Dialog open={open}>
                <DialogContent>
                    <DialogTitle>
                        Xác nhận xóa sản phẩm
                    </DialogTitle>
                    <DialogContentText>
                        Bạn có chắc là muốn xóa sản phẩm này không?, nếu có hãy ấn xác nhận!.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} variant='outlined'>
                        Không
                    </Button>
                    <Button 
                        type='submit' 
                        variant='outlined'
                        onClick={handleSubmit}>
                        Có
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    )
}

export default SaleoutDeletePopup