import {
    Button,
    Dialog,
    DialogActions, DialogContent, DialogTitle, InputLabel, Select, MenuItem,
    type SelectChangeEvent
} from '@mui/material'
import React, { useState, type SetStateAction } from 'react'
import useSaleoutContext from '../../context/SaleoutContext'
import { FileService } from '../../services/HandleFileService';


interface PrintPropsDialog {
    open: boolean,
    setOpen: React.Dispatch<SetStateAction<boolean>>;
}
const SaleoutPrint = ({ open, setOpen }: PrintPropsDialog) => {
    const [saleCode, setSaleCode] = useState<string>('');
    const {data} = useSaleoutContext()
    const {fetchFile} = FileService("print", saleCode)

    const handleChange = (e: SelectChangeEvent) => {
        setSaleCode(e.target.value as string);
    }
    const saleoutCodes = data.map(e => e.id);
    console.log(saleCode);

    const handleFetch = async () => {
        try {
            await fetchFile("pdf", "PhieuXuat");
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <Dialog open={open} maxWidth='xs' fullWidth>
            <DialogTitle>
                In phiếu
            </DialogTitle>
            <DialogContent>
                <InputLabel>Số phiếu</InputLabel>
                <Select
                    value={saleCode}
                    onChange={handleChange}
                    fullWidth
                >
                    {saleoutCodes.map(item => (
                        <MenuItem value={item}>{item}</MenuItem>
                    ))}
                </Select>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>
                    Hủy
                </Button>
                <Button onClick={handleFetch} variant='contained'>
                    In phiếu
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SaleoutPrint