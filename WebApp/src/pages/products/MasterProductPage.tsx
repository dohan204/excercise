import {useState} from "react";
import useDataProducts from "../../services/ProductDataService";
import ProductContent from "./ProductContent";
import ProductHeader from "./ProductHeader";


const MasterProductPage = () => {
    const [value, setValue] = useState<string>("");
    const [search, setSeach] = useState<string>("");
    const [button, setButton] = useState<number>(0);
    const { data, message } = useDataProducts(value, search, button);
    console.log(data);
    return (
        <div className="w-full h-full">
            <div className="p-20">
                <ProductHeader
                    fieldName={value}
                    setFieldName={setValue}
                    keyword={search}
                    setKeyword={setSeach}
                    button={button}
                    setButton={setButton}
                />
            </div>
            <div>
                <ProductContent data={data} />
            </div>
        </div>
    )
}


export default MasterProductPage;