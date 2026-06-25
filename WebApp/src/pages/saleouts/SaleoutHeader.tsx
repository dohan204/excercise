import { Button, FormControl, InputLabel, MenuItem, Paper, Select, TextField, type SelectChangeEvent } from "@mui/material";
import React, { useState, type SetStateAction } from "react";
import { GetDownloadFile } from "../../services/ProductDataService";
import SalePopupNew from "./SalePopupNew";
type Props = {
    fieldName: string,
    setFieldName: React.Dispatch<SetStateAction<string>>,
    keyword: string,
    setKeyword: React.Dispatch<SetStateAction<string>>
    button: number,
    setButton: React.Dispatch<SetStateAction<number>>,
    count: number,
    setCount: React.Dispatch<SetStateAction<number>>
}
const fieldFilter = ["customerPoNo", "OrderDate", "customerName", "quantity", "price", "quantityPerBox", "boxQuantity"]
const buttons = [
    { name: "Thêm mới", key: 'new' },
    { name: 'Tải file Mẫu', key: 'download' },
    { name: 'Uploda dữ liệu', key: 'upload' }
] as const;

const buttonRight = [
    {name: "In phiếu", key: "print"},
    {name: "Báo cáo doanh thu", key: 'report'}
]

const SaleoutHeader = ({ fieldName, setFieldName, keyword, setKeyword, setButton, setCount }: Props) => {
    const [popup, setPopup] = useState<"new" | "download" | "upload" | null>(null);
    const handleEvent = (e: SelectChangeEvent) => {
        setFieldName(e.target.value);
    }

    const handleFetch = async (actionKey: string) => {
        const { fetchFile } = GetDownloadFile(actionKey)

        await fetchFile();
    }
    return (
        <Paper>
            <div className="w-full h-full flex flex-row gap-10 p-4">
                <div className="flex flex-2 gap-6 flex-col justify-between">
                    <div className="flex flex-1 flex-row justify-around items-center">
                        <FormControl sx={{ m: 1, minWidth: 150 }}>
                            <InputLabel>Chọn trường</InputLabel>
                            <Select
                                onChange={handleEvent}
                                autoWidth
                                value={fieldName}>
                                {fieldFilter.map(field => (
                                    <MenuItem
                                        key={field}
                                        value={field}>
                                        {field}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Tìm kiếm..."
                            variant="outlined"
                            onChange={(e) => setKeyword(e.target.value)}
                            value={keyword}
                        />
                    </div>
                    <div className="flex flex-1 w-full flex-row justify-around">
                        {buttons.map(item => (
                            <Button key={item.key}
                                variant="contained"
                                onClick={async () => {
                                    setPopup(item.key);
                                    if (item.key === "download") {
                                        await handleFetch(item.key)
                                    }
                                }}
                            >{item.name}</Button>
                        ))}
                        {/* <ProductNewPupup open={popup === 'new'} setOpen={() => setPopup(null)} setCount={setCount} />
                        <ProductUpload open={popup === 'upload'} setOpen={() => setPopup(null)} setCount={setCount} /> */}
                    </div>
                </div>
                <div className="flex flex-1 justify-center items-center flex-col gap-4">
                    <div className='flex flex-1 w-full justify-center items-center'>
                        <Button
                            variant="outlined"
                            onClick={() => setButton(prev => prev + 1)}
                        >
                            Tìm kiếm
                        </Button>
                    </div>
                    <div className="flex flex-1 w-full justify-around items-center">
                        {buttonRight.map(btn => (
                            <Button key={btn.key} variant="contained">
                                {btn.name}
                            </Button>
                        ))}
                    </div>
                </div>


                <SalePopupNew setCount={setCount} open={popup === 'new'} setOpen={() => setPopup(null)} />
            </div>
        </Paper>
    )
}

export default SaleoutHeader;