import {useState} from "react";
import useDataProducts from "../../services/ProductDataService";
import ProductContent from "./ProductContent";
import ProductHeader from "./ProductHeader";
import { Paper } from "@mui/material";


const MasterProductPage = () => {
    const [value, setValue] = useState<string>("");
    const [search, setSeach] = useState<string>("");
    const [button, setButton] = useState<number>(0);
    const [count, setCount] = useState<number>(0);
    const { data, message } = useDataProducts(value, search, button, count);
    console.log(data);
    return (
        <div className="w-full">
            <Paper sx={{padding: 6, margin: 6}}>
                <ProductHeader
                    fieldName={value}
                    setFieldName={setValue}
                    keyword={search}
                    setKeyword={setSeach}
                    button={button}
                    setButton={setButton}
                    count={count}
                    setCount={setCount}
                />
            </Paper>
            <div>
                <ProductContent data={data} setCount={setCount} />
            </div>
        </div>
    )
}


export default MasterProductPage;