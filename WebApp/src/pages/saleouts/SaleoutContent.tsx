import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useState, type SetStateAction } from 'react';
import type { Saleout } from '../../models/Saleout';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import SalePopupUpdate from './SalePopupUpdate';
import SaleoutDeletePopup from './SaleoutDelete';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
export interface DataUpdate {
    unit: string,
    specification: string,
    quantityPerBox: number,
    productWeight: number
}


type Props = Saleout[]
const SaleoutContent = ({ data, setCount }: { data: Props, setCount: React.Dispatch<SetStateAction<number>> }) => {
    const [item, setItem] = useState<Saleout | null>(null);
    const [open, setOpen] = useState<"update" | "delete" | null>(null);
    const handleEditClick = (currentRow: Saleout) => {
        setItem(currentRow);      // Lưu dữ liệu dòng được chọn vào state
        setOpen("update");        // Mở popup update
    };

    const handleDeleteClick = (currentRow: Saleout) => {
        setItem(currentRow);
        setOpen("delete");
    }
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align='right'>STT</TableCell>
                        <TableCell align='right'>Action</TableCell>
                        <TableCell align='right'>Số PO Khách hàng</TableCell>
                        <TableCell align='right'>Ngày đặt hàng</TableCell>
                        <TableCell align='right'>Tên sản phẩm</TableCell>
                        <TableCell align='right'>Số lượng</TableCell>
                        <TableCell align='right'>Số lượng/ thùng</TableCell>
                        <TableCell align='right'>Số thùng</TableCell>
                        <TableCell align='right'>Đơn giá</TableCell>
                        <TableCell align='right'>Thành tiền</TableCell>
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
                                    <ModeEditIcon
                                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                                        onClick={() => handleEditClick(row)}
                                    />
                                    <DeleteForeverIcon
                                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                                        onClick={() => handleDeleteClick(row)}
                                     />
                                </div>
                            </TableCell>
                            <TableCell align="right">
                                {row.customerPoNo}
                            </TableCell>
                            <TableCell align="right">
                                {
                                    ConvertDate(row.orderDate.toString())
                                }
                            </TableCell>
                            <TableCell align="right">
                                {row.productName}
                            </TableCell>
                            <TableCell align="right">
                                {row.quantity}
                            </TableCell>
                            <TableCell align="right">
                                {row.quantityPerBox}
                            </TableCell>
                            <TableCell align="right">
                                {row.boxQuantity}
                            </TableCell>
                            <TableCell align='right'>
                                {row.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </TableCell>
                            <TableCell align='right'>
                                {row.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>
                {open === "update" && item && (
                    <SalePopupUpdate
                        item={item}
                        open={true}
                        setOpen={(isOpen) => {
                            if (!isOpen) {
                                setOpen(null);
                                setItem(null); // Reset lại item về null khi đóng popup cho sạch dữ liệu
                            }
                        }}
                        setCount={setCount}
                    />
                )}</Table>

            {open === "delete" && (
                <SaleoutDeletePopup
                    open={true}
                    saleoutId={item?.id}
                    setOpen={() => setOpen(null)}
                    setCount={setCount} />
            )}
        </TableContainer>
    )
}


export function ConvertDate(date: string): string {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);

    return `${day}/${month}/${year}`
}



export default SaleoutContent