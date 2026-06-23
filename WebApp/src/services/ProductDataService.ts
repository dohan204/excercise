import { useEffect, useState } from "react"
import type { MasterProduct } from "../models/MasterProduct"
import { BASE_URL } from "../configs/configUrlBase";
type Props = {
    fieldName: string,
    keyword: string
}
const useDataProducts = (fieldName?: string, keyword?: string, buttonClick?: number) => {
    const [data, setData] = useState<MasterProduct[] | []>([]);
    const [message, setMessage] = useState<string | null>(null);
    useEffect(() => {
        if(fieldName && keyword && buttonClick > 0) {
            fetch(`${BASE_URL}/products/search?fieldName=${fieldName}&keyword=${keyword}`)
            .then(data => data.json())
                .then(result => setData(result)).catch(error => setMessage(error));
            return;
        }
        fetch(`${BASE_URL}/products`)
            .then(data => data.json())
                .then(result => setData(result)).catch(error => setMessage(error))
    }, [buttonClick]);
    return {data, message};

}



const useSubmitFormData = (data: any) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
}

export default useDataProducts;