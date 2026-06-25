import { Button, Dialog, DialogActions, DialogContent } from '@mui/material'
import React, { type SetStateAction, useState, useEffect } from 'react'
import { useProductContext } from '../../context/ProductContext'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useForm } from 'react-hook-form'
import { BASE_URL } from '../../configs/configUrlBase'

interface PopupPropsNew {
    open: boolean,
    setOpen: React.Dispatch<SetStateAction<boolean>>,
    setCount: React.Dispatch<SetStateAction<number>>
}

interface FormValues {
    customerPoNo: string,
    customerName: string,
    quantity: number,
    price: number,
}

const SalePopupNew = ({ open, setOpen, setCount }: PopupPropsNew) => {
    const { data } = useProductContext();
    const { register, handleSubmit, reset, setValue } = useForm<FormValues>();
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const products = new Map(
        data.map(product => [product.id, product])
    );

    const currentProduct = products.get(selectedProductId);

    const year = selectedDate?.getFullYear();
    const month = selectedDate ? String(selectedDate.getMonth() + 1).padStart(2, '0') : '';
    const day = selectedDate ? String(selectedDate.getDate()).padStart(2, '0') : '';

    const onSubmit = async (formData: FormValues) => {
        if (!selectedProductId || !selectedDate) {
            alert('Vui lòng chọn đầy đủ sản phẩm và ngày đặt hàng!');
            return;
        }

        const payload = { 
            ...formData, 
            productId: selectedProductId, 
            orderDate: Number(`${year}${month}${day}`),
            quantityPerBox: currentProduct?.quantityPerBox || 0 
        };

        try {
            const response = await fetch(`${BASE_URL}/saleout`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        
            if (!response.ok) {
                throw new Error(`${response.text}`);
            }
            alert("Tạo mới thành công.")
            setOpen(false);
            setCount(c => c + 1);
            reset();
            setSelectedProductId('');
            setSelectedDate(null);
       } catch (error) {
            console.log(error);
       }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <div className='flex flex-row p-4 gap-4 items-center justify-center'>
                            
                            <div className='flex gap-4 flex-col justify-center items-center'>
                                <div>
                                    <label className='block mb-1 text-sm font-medium'>Số PO Khách hàng</label>
                                    <input {...register("customerPoNo", { required: true })} className='border border-gray-200 rounded-md p-2 w-56' placeholder='Nhập số PO...' />
                                </div>
                                <div>
                                    <label className='block mb-1 text-sm font-medium'>Tên khách hàng</label>
                                    <input {...register("customerName", { required: true })} className='border border-gray-200 rounded-md p-2 w-56' placeholder='Nhập tên khách hàng...' />
                                </div>
                                <div>
                                    <label className='block mb-1 text-sm font-medium'>Đơn vị tính</label>
                                    <input readOnly value={currentProduct?.unit || ''} className='border border-gray-200 rounded-md p-2 w-56 bg-gray-50' placeholder='Tự động điền' />
                                </div>
                                <div>
                                    <label className='block mb-1 text-sm font-medium'>Số lượng</label>
                                    <input type="number" {...register("quantity", { required: true, valueAsNumber: true })} className='border border-gray-200 rounded-md p-2 w-56' placeholder='Nhập số lượng...' />
                                </div>
                            </div>

                            <div className='flex gap-4 flex-col justify-center items-center'>
                                <div className='w-56'>
                                    <label className='block mb-1 text-sm font-medium'>Ngày đặt hàng</label>
                                    <DatePicker
                                        format="dd/MM/yyyy"
                                        value={selectedDate}
                                        onChange={(newValue) => setSelectedDate(newValue)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                fullWidth: true,
                                                className: 'bg-white rounded-md'
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className='block mb-1 text-sm font-medium'>Sản phẩm</label>
                                    <select id="productId"
                                        className='border border-gray-200 rounded-md p-2 w-56 bg-white'
                                        value={selectedProductId}
                                        onChange={(e) => setSelectedProductId(e.target.value)}>
                                        <option value="">Chọn sản phẩm</option>
                                        {[...products].map(([id, product]) => (
                                            /* Sửa đổi format hiển thị đúng chuẩn Mã (Tên) tại đây */
                                            <option key={id} value={id}>
                                                {`${product.productCode} (${product.productName})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className='block mb-1 text-sm font-medium'>Đơn giá</label>
                                    <input
                                        type="number"
                                        className='border border-gray-200 rounded-md p-2 w-56'
                                        placeholder='Nhập đơn giá...'
                                        {...register("price", { required: true, valueAsNumber: true })}
                                    />
                                </div>
                                <div>
                                    <label className='block mb-1 text-sm font-medium'>Số lượng/thùng</label>
                                    <input readOnly value={currentProduct?.quantityPerBox || ''} className='border border-gray-200 rounded-md p-2 w-56 bg-gray-50' placeholder='Tự động điền' />
                                </div>
                            </div>

                        </div>
                    </DialogContent>

                    <DialogActions className='p-4'>
                        <Button onClick={() => setOpen(false)} variant="outlined" color="inherit">Hủy</Button>
                        <Button type="submit" variant="contained" color="primary">Xác nhận</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </LocalizationProvider>
    )
}

export default SalePopupNew;
