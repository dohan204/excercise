import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { type SetStateAction } from 'react';
import type { Saleout } from '../../models/Saleout';
export interface DataUpdate {
    unit: string,
    specification: string,
    quantityPerBox: number,
    productWeight: number
}

type Props = Saleout[]
const SaleoutContent = ({ data, setCount }: { data: Props, setCount: React.Dispatch<SetStateAction<number>> }) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align='right'>STT</TableCell>
                        <TableCell align='right'>Action</TableCell>
                        <TableCell align='right'>Số PO Khách hàng</TableCell>
                        <TableCell align='right'>Ngày đặt hàng</TableCell>
                        <TableCell align='right'>Mã sản phẩm</TableCell>
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
                                ok
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
                                {row.productId}
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
                                {row.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND'})}
                            </TableCell>
                            <TableCell align='right'>
                                {row.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND'})}
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}


function ConvertDate(date: string): string {
    const year = date.substring(0, 4);
    const month = date.substring(4,6);
    const day = date.substring(6,8);

    return `${day}/${month}/${year}`
}



export default SaleoutContent