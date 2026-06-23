import { Button, FormControl, InputLabel, MenuItem, Select, TextField, type SelectChangeEvent } from "@mui/material";
import React, { useState, type SetStateAction } from "react";
import ProductNewPupup from "./ProductNewPupup";
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
const fieldFilter = ["productCode", "productName", "unit", "specification", "quantityPerBox", "productWeight"]
const buttons = [
    { name: "Thêm mới", key: 'new' },
    { name: 'Tải file Mẫu', key: 'parttern' },
    { name: 'Uploda dữ liệu', key: 'upload' }
] as const;

const ProductHeader = ({ fieldName, setFieldName, keyword, setKeyword, setButton, setCount }: Props) => {
    const [popup, setPopup] = useState<"new" | "parttern" | "upload" | null>(null);
    const handleEvent = (e: SelectChangeEvent) => {
        setFieldName(e.target.value);
    }
    return (

            <div className="w-full h-full flex flex-row gap-10">
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
                                onClick={() => setPopup(item.key)}
                            >{item.name}</Button>
                        ))}
                        <ProductNewPupup open={popup === 'new'} setOpen={() => setPopup(null)} setCount={setCount} />
                    </div>
                </div>
                <div className="flex flex-1 justify-center items-center">
                    <Button
                        variant="outlined"
                        onClick={() => setButton(prev => prev + 1)}
                    >
                        Tìm kiếm
                    </Button>
                </div>
            </div>

    )
}

export default ProductHeader;