import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ModeIcon from '@mui/icons-material/Mode';
import type { MasterProduct } from '../../models/MasterProduct';
import { useState, type SetStateAction } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import { useUpateDataProduct } from '../../services/ProductDataService';
import ProductDeletePopup from './ProductDeletePopup';
export interface DataUpdate {
    unit: string,
    specification: string,
    quantityPerBox: number,
    productWeight: number
}

type Props = MasterProduct[]
const ProductContent = ({ data, setCount }: { data: Props, setCount: React.Dispatch<SetStateAction<number>>}) => {
    const [editingRow, setEditingRow] = useState<string | null>(null);
    const [product, setProduct] = useState<MasterProduct | null>(null);
    const {message, submit} = useUpateDataProduct();
    const [openPopup, setOpenPopup] = useState<boolean>(false);
    const [selectId, setSelecteId] = useState<string | null>(null);

    
    const handleSaveData = async (e: MasterProduct) => {
        setProduct({ ...e })
        try {
            await submit(editingRow  as string, product as MasterProduct)
            setCount(c => c + 1)
        } catch (err) {
            console.error(err);
        }
        setEditingRow(null);
        console.log('prd: ',product);
    }

    console.log(message);
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align='right'>Số thứ tự</TableCell>
                        <TableCell align='right'>Action</TableCell>
                        <TableCell align='right'>Mã Sản phẩm</TableCell>
                        <TableCell align='right'>Tên Sản phẩm</TableCell>
                        <TableCell align='right'>Đơn vị tính</TableCell>
                        <TableCell align='right'>quy cách</TableCell>
                        <TableCell align='right'>Số lượng thùng</TableCell>
                        <TableCell align='right'>Trọng lượng</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((row, i) => {
                        return <TableRow key={row.id}>
                            <TableCell component="th" scope="row">
                                {i + 1}
                            </TableCell>
                            <TableCell align="right">
                                <div className='flex flex-row'>
                                    {editingRow === row.id ? (
                                        <DoneIcon
                                            fontSize="medium"
                                            onClick={() => handleSaveData(row)}
                                        />
                                    ) : (
                                        <ModeIcon
                                            fontSize="medium"
                                            onClick={() => {
                                                setEditingRow(row.id);
                                                setProduct({ ...row });
                                            }}
                                        />
                                    )}
                                    <DeleteForeverIcon 
                                        fontSize='medium' 
                                        onClick={() => {
                                            setOpenPopup(true);
                                            setSelecteId(row.id);
                                        }} 
                                        />
                                </div>
                            </TableCell>
                            <TableCell align="right">
                                {row.productCode}
                            </TableCell>
                            <TableCell align="right">{row.productName}</TableCell>
                            <TableCell align="right">
                                <input
                                    className={`w-20 m-1 text-right 
                                            ${editingRow === row.id
                                            ? 'border-2 rounded-md border-gray-200'
                                            : 'border-0'}`}
                                    disabled={editingRow !== row.id}
                                    value={editingRow === row.id ? product?.unit : row.unit}
                                    onChange={(e) => setProduct(prev =>
                                        prev ? { ...prev, unit: e.target.value } : null)}
                                    defaultValue={row.unit}
                                />
                            </TableCell>
                            <TableCell align="right">
                                <input
                                    className={`w-20 m-1 text-right 
                                            ${editingRow === row.id
                                            ? 'border-2 rounded-md border-gray-200'
                                            : 'border-0'}`}
                                    disabled={editingRow !== row.id}
                                    onChange={(e) => setProduct(prev =>
                                        prev ? { ...prev, specification: e.target.value } : null)}
                                    defaultValue={row.specification}
                                    value={editingRow === row.id ? product?.specification : row.specification} />
                            </TableCell>
                            <TableCell align="right">
                                <input
                                    className={`w-20 m-1 text-right 
                                            ${editingRow === row.id
                                            ? 'border-2 rounded-md border-gray-200'
                                            : 'border-0'}`}
                                    disabled={editingRow !== row.id}
                                    defaultValue={row.quantityPerBox}
                                    onChange={(e) => setProduct(prev => prev ? { ...prev, quantityPerBox: Number(e.target.value) } : null)}
                                    value={editingRow === row.id ? product?.quantityPerBox : row.quantityPerBox} />
                            </TableCell>
                            <TableCell align="right">
                                <input
                                    className={`w-20 m-1 text-right 
                                            ${editingRow === row.id
                                            ? 'border-2 rounded-md border-gray-200'
                                            : 'border-0'}`}
                                    disabled={editingRow !== row.id}
                                    defaultValue={row.productWeight}
                                    onChange={(e) => setProduct(prev => prev ? { ...prev, productWeight: Number(e.target.value) } : null)}
                                    value={editingRow === row.id ? product?.productWeight : row.productWeight} />
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>
                <ProductDeletePopup 
                    open={openPopup} 
                    setOpen={setOpenPopup} 
                    productId={selectId} 
                    setCount={setCount}/>
            </Table>
        </TableContainer>
    )
}

export default ProductContent