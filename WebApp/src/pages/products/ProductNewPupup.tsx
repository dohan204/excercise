import { useForm, type SubmitHandler } from 'react-hook-form';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import React from 'react'
import { useSubmitFormData } from '../../services/ProductDataService';


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
    setOpen: (open: boolean) => void,
    setCount: (value: number | ((prev: number) => number)) => void;
}

const ProductNewPupup = (props: NewProps) => {
    const { open, setOpen, setCount } = props;
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Inputs>();
    const {loading, submit, messageErr} = useSubmitFormData();

    const onSubmit: SubmitHandler<Inputs> = async (payload) => {
        try {
        await submit(payload);
        setOpen(false);
        setCount(c => c + 1);
        reset()
    } catch(err) {
        console.log(err);
        
    }
    }
    return (
        <React.Fragment>
            <Dialog open={open} onClose={() => setOpen(false)}>
                {messageErr && <span className='text-red-600 text-center'>{messageErr}</span>}
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
                        <Button 
                            type='submit' 
                            variant='contained'
                            disabled={loading}
                            >
                            Lưu
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </React.Fragment>
    )
}

export default ProductNewPupup