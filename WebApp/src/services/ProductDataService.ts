import { useEffect, useState } from "react"
import type { MasterProduct } from "../models/MasterProduct"
import { BASE_URL } from "../configs/configUrlBase";
import type { DataUpdate } from "../pages/products/ProductContent";
type Props = {
    fieldName: string,
    keyword: string
}
const useDataProducts = (fieldName?: string, keyword?: string, buttonClick?: number, trigger?: number) => {
    const [data, setData] = useState<MasterProduct[] | []>([]);
    const [message, setMessage] = useState<string | null>(null);
    useEffect(() => {
        if (fieldName && keyword && buttonClick > 0) {
            fetch(`${BASE_URL}/products/search?fieldName=${fieldName}&keyword=${keyword}`)
                .then(data => data.json())
                .then(result => setData(result)).catch(error => setMessage(error));
            return;
        }
        fetch(`${BASE_URL}/products`)
            .then(data => data.json())
            .then(result => setData(result)).catch(error => setMessage(error))
    }, [buttonClick, trigger]);
    return { data, message };

}



export const useSubmitFormData = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageErr, setMessageErr] = useState('');
    console.log(message)
    console.log(messageErr);
    const submit = async (data: any) => {
        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                if (response.status === 500) {
                    setMessageErr("Sản phẩm đã tồn tại");
                }
                return;
            }

            const result = await response.json();

            setMessage(result.message ?? 'Success');

            return result;
        }
        catch (error) {
            if (error instanceof Error) {
                setMessageErr(error.name);
            }
        }
        finally {
            setLoading(false);
        }
    };

    return {
        submit,
        loading,
        message,
        messageErr
    };
};


export const useUpateDataProduct = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const submit = async (id: string, data: DataUpdate) => {
        setLoading(true)
        try {
            const response = await fetch(`${BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                setMessage(response.statusText)
                return;
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }


    return {
        loading,
        message,
        submit
    }
}


export const useDeleteProduct = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const handleDelete = async (id: string) => {
        setLoading(false);
        try {
            const response = await fetch(`${BASE_URL}/products/delete/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                setSuccess(false);
                throw new Error(response.statusText);
            }

            setSuccess(true);
        } catch(error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }


    return {
        loading, 
        success,
        handleDelete
    }
}
export default useDataProducts;