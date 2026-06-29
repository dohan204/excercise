import React from 'react'

const useConvertDateToNumber = (date: Date) => {
    const year = date?.getFullYear();
    const month = date ? String(date.getMonth() + 1).padStart(2, '0') : '';
    const day = date ? String(date.getDate()).padStart(2, '0') : '';

    return Number(`${year}${month}${day}`)
}

export default useConvertDateToNumber