import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import React, { useState, type SetStateAction } from 'react'
import useConvertDateToNumber from '../../hooks/useConvertDateToNumber';
import { FileService } from '../../services/HandleFileService';
interface RevenuaDialogReportProps {
  open: boolean,
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}

interface DateRange {
  fromDate: Date | null,
  toDate: Date | null
}

const SaleoutRevenueReport = ({ open, setOpen }: RevenuaDialogReportProps) => {

  const [selectDate, setSelectDate] = useState<DateRange>({
    fromDate: new Date(),
    toDate: new Date()
  })
  const {fetchFile} = FileService("revenue")

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const newDateQuery = {
      fromDate: useConvertDateToNumber(selectDate.fromDate as Date),
      toDate: useConvertDateToNumber(selectDate.toDate as Date)
    }
    await fetchFile("xlsx", "BaoCaoDoanhThu", newDateQuery);
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} maxWidth='sm' fullWidth>
        <DialogTitle>
          Ngày giao hàng
        </DialogTitle>
        <form onSubmit={onSubmit}>
          <DialogContent>
            <div className='flex flex-row gap-6'>

            <div className='flex flex-col justify-center'>
              <label className='left-0'>Từ ngày: </label>
              <DatePicker
                format='dd/MM/yyyy'
                value={selectDate.fromDate}
                onChange={(newDate) => setSelectDate(prev => ({
                  ...prev,
                  fromDate: newDate
                }))}
              />
            </div>

            <div className='flex flex-col justify-center'>
              <label>Đến ngày: </label>
              <DatePicker
                format='dd/MM/yyyy'
                value={selectDate.toDate}
                onChange={(newDate) => setSelectDate(prev => ({
                  ...prev,
                  toDate: newDate
                }))}
              />
            </div>
            </div>

          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type='submit'>
              Lưu
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  )
}

export default SaleoutRevenueReport