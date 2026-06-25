import { useEffect, useState } from "react"
import type { Saleout } from "../models/Saleout";
import { BASE_URL } from "../configs/configUrlBase";


export const useGetSaleout = (fieldName?: string, keyword?: string, count?: number, key?: number) => {
    const [data, setData] = useState<Saleout | []>([])
    useEffect(() => {
        console.log(`${BASE_URL}/saleout?fieldName=${fieldName}&keyword=${keyword}`)
        if (fieldName && keyword && count > 0) {
            fetch(`${BASE_URL}/saleout?fieldName=${fieldName}&keyword=${keyword}`, {
                method: 'GET'
            }).then(response => response.json())
                .then(result => setData(result))
                .catch(error => console.error(error));

                return;
        }

        fetch(`${BASE_URL}/saleout`, {
            method: 'GET'
        }).then(response => response.json())
            .then(result => setData(result))
            .catch(error => console.error(error));


    }, [count, key])
    return {
        data
    }
}