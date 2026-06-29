import { useEffect, useState } from "react"
import type { Saleout } from "../models/Saleout";
import { BASE_URL } from "../configs/configUrlBase";


export const useGetSaleout = (fieldName?: string, keyword?: string, count?: number, key?: number) => {
    const [data, setData] = useState<Saleout[] | []>([])
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


export const useDeleteSaleout = () => {
    const [message, setMessage] = useState<string>('');
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${BASE_URL}/saleout/${id}`, {
                method: 'DELETE',
            });

            if(!response.ok) {
                throw new Error(response.statusText);
            }

            setMessage("xóa thành công.");
        } catch (error) {
            setMessage(error as string)
        }
    }

    return {
        message, handleDelete
    }
}