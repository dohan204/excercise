import { Button, Dialog, DialogActions, DialogContent } from '@mui/material'
import React, { type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { BASE_URL } from '../../configs/configUrlBase'
import type { Saleout } from '../../models/Saleout'
import { ConvertDate } from './SaleoutContent'

interface PopupPropsNew {
    open: boolean,
    setOpen: React.Dispatch<SetStateAction<boolean>>,
    setCount: React.Dispatch<SetStateAction<number>>
    item: Saleout
}

interface FormValues {
    boxQuantity: number
    quantity: number,
    price: number,
}

const SalePopupUpdate = ({ open, setOpen, item, setCount }: PopupPropsNew) => {
    const { register, handleSubmit } = useForm<FormValues>({
        defaultValues: {
            boxQuantity: item?.boxQuantity,
            price: item?.price,
            quantity: item?.quantity
        }
    });

    const onSubmit = async (formData: FormValues) => {
        console.log(formData);
        try {
            const response = await fetch(`${BASE_URL}/saleout/${item.id}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            if(!response.ok) 
                throw new Error(`Error: ${response.text}`);
            alert('Sửa dữ liệu thành coonng.');
            setOpen(false);
            setCount(c => c + 1);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <div className='flex flex-row p-4 gap-4 items-center justify-center'>

                        <div className='flex gap-4 flex-col justify-center items-center'>
                            <div>
                                <label className='block mb-1 text-sm font-medium'>Số PO Khách hàng</label>
                                <input disabled value={item?.customerPoNo} className='border border-gray-200 rounded-md p-2 w-56' placeholder='Nhập số PO...' />
                            </div>
                            <div>
                                <label className='block mb-1 text-sm font-medium'>Tên khách hàng</label>
                                <input disabled value={item?.customerName} className='border border-gray-200 rounded-md p-2 w-56' placeholder='Nhập tên khách hàng...' />
                            </div>
                            <div>
                                <label className='block mb-1 text-sm font-medium'>Đơn vị tính</label>
                                <input readOnly value={item?.unit || ''} className='border border-gray-200 rounded-md p-2 w-56 bg-gray-50' placeholder='Tự động điền' />
                            </div>
                            <div>
                                <label className='block mb-1 text-sm font-medium'>Số lượng</label>
                                <input type="number" {...register("quantity", { valueAsNumber: true })} className='border border-gray-200 rounded-md p-2 w-56' placeholder='Nhập số lượng...' />
                            </div>
                        </div>

                        <div className='flex gap-4 flex-col justify-center items-center'>
                            <div className='w-56'>
                                <label className='block mb-1 text-sm font-medium'>Ngày đặt hàng</label>
                                <input disabled value={ConvertDate(item.orderDate.toString())} className='border border-gray-200 rounded-md p-2 w-56' />
                            </div>

                            <div>
                                <label className='block mb-1 text-sm font-medium'>Sản phẩm</label>
                                <select id="productId"
                                    disabled
                                    className='border border-gray-200 rounded-md p-2 w-56 bg-white'
                                >
                                    <option value="">{item?.productName}</option>
                                </select>
                            </div>
                            <div>
                                <label className='block mb-1 text-sm font-medium'>Đơn giá</label>
                                <input
                                    type="number"
                                    className='border border-gray-200 rounded-md p-2 w-56'
                                    placeholder='Nhập đơn giá...'
                                    {...register("price", { valueAsNumber: true })}
                                />
                            </div>
                            <div>
                                <label className='block mb-1 text-sm font-medium'>Số lượng/thùng</label>
                                <input {...register('boxQuantity')} className='border border-gray-200 rounded-md p-2 w-56 bg-gray-50' placeholder='Tự động điền' />
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
    )
}

export default SalePopupUpdate;
