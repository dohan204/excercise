import { useForm, type SubmitHandler } from 'react-hook-form';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import React from 'react'


export type Inputs = {
    productCode: string,
    productName: string,
    unit: string,
    specification: string,
    quantityPerBox: number;
    productWeight: number
}


export interface NewProps {
    open: boolean,
    setOpen: (open: boolean) => void
}

const ProductNewPupup = (props: NewProps) => {
    const { open, setOpen } = props;
    const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = (payload) => {
        console.log(payload);
    }
    return (
        <React.Fragment>
            <Button variant='outlined' onClick={() => setOpen(true)}>
                Thêm mới
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <div
                            className='flex justify-around items-center gap-4'>
                            <div 
                                className='flex flex-col gap-6'>
                                <div
                                    className='flex flex-col'>
                                    <label>
                                        Mã Sản phẩm<em>*</em>
                                    </label>
                                    <input
                                        type='text'
                                        {...register("productCode", { required: true, maxLength: 50 })}
                                        placeholder='Nhập mã sản phẩm'
                                         className='border-1 rounded-md border-gray-200 p-2'
                                    />
                                </div>
                                <div className='flex flex-col'>
                                    <label>
                                        Đơn vị<em>*</em>
                                    </label>
                                    <input
                                        type='text'
                                        {...register("unit", { required: true, maxLength: 50 })}
                                        placeholder='Nhập mã sản phẩm'
                                         className='border-1 rounded-md border-gray-200 p-2'
                                    />
                                </div>
                                <div className='flex flex-col'>
                                    <label>
                                        Số lượng/thùng<em>*</em>
                                    </label>
                                    <input
                                        type='number'
                                        {...register("quantityPerBox", { required: true, valueAsNumber: true })}
                                        placeholder='Nhập mã sản phẩm'
                                         className='border-1 rounded-md border-gray-200 p-2'
                                    />
                                </div>
                            </div>
                            <div className='flex flex-col gap-6'>
                                <div className='flex flex-col'>
                                    <label>
                                        Tên sản phẩm<em>*</em>
                                    </label>
                                    <input
                                        type='text'
                                        {...register("productName", { required: true, maxLength: 200 })}
                                        placeholder='Nhập mã sản phẩm'
                                        className='border-1 rounded-md border-gray-200 p-2'
                                    />
                                </div>
                                <div className='flex flex-col'>
                                    <label>
                                        Quy cách<em>*</em>
                                    </label>
                                    <input
                                        type='text'
                                        {...register("specification", { required: true, maxLength: 200 })}
                                        placeholder='Nhập mã sản phẩm'
                                         className='border-1 rounded-md border-gray-200 p-2'
                                    />
                                </div>
                                <div className='flex flex-col'>
                                    <label>
                                        Trọng lượng<em>*</em>
                                    </label>
                                    <input
                                        type='number'
                                        {...register("productWeight", { required: true, valueAsNumber: true })}
                                        placeholder='Nhập mã sản phẩm'
                                         className='border-1 rounded-md border-gray-200 p-2'
                                    />
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>
                            Hủy
                        </Button>
                        <Button type='submit' variant='contained' className=''>
                            Lưu
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </React.Fragment>
    )
}

export default ProductNewPupup