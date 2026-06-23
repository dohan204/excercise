import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ModeIcon from '@mui/icons-material/Mode';
import type { MasterProduct } from '../../models/MasterProduct';


type Props = MasterProduct[]
const ProductContent = ({data}: {data: Props}) => {
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
                        return <TableRow key={row.productCode}>
                            <TableCell component="th" scope="row">
                                {i + 1}
                            </TableCell>
                            <TableCell align="right">
                                <div className='flex flex-row'>
                                    <ModeIcon fontSize='medium' />
                                    <DeleteForeverIcon fontSize='medium' />
                                </div>
                            </TableCell>
                            <TableCell align="right">{row.productCode}</TableCell>
                            <TableCell align="right">{row.productName}</TableCell>
                            <TableCell align="right">{row.unit}</TableCell>
                            <TableCell align="right">{row.specification}</TableCell>
                            <TableCell align="right">{row.quantityPerBox}</TableCell>
                            <TableCell align="right">{row.productWeight}</TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default ProductContent