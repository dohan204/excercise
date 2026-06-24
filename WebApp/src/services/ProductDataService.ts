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
        } catch (error) {
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


export const GetDownloadFile = (key: string) => {
    let url: string = "";
    switch (key) {
        case "download":
            url = `${BASE_URL}/products/patternFile`;
            break;
        case "upload":
            url = `${BASE_URL}/products/insertmany`;
            break;
        default: 
            url = "";
    }
    const fetchFile = async () => {
        try {
            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) {
                throw new Error("Tải file thất bại rồi fen ơi!");
            }

            // 1. Đọc dữ liệu trả về dưới dạng BLOB (Binary Large Object)
            const blob = await response.blob();

            // 2. Tạo một đường dẫn URL tạm thời trỏ vào vùng nhớ Blob này
            const downloadUrl = window.URL.createObjectURL(blob);

            // 3. Đọc tên file từ Header "content-disposition" của Server gửi về (nếu có)
            // Hoặc tự đặt một cái tên mặc định nếu Server không trả về tên file
            const contentDisposition = response.headers.get('content-disposition');
            let fileName = "File_Mau.xlsx";
            if (contentDisposition && contentDisposition.includes('filename=')) {
                fileName = contentDisposition.split('filename=')[1].replace(/["']/g, '');
            }

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName; // Đặt tên file khi tải về
            document.body.appendChild(link);
            link.click(); // Kích hoạt lệnh tải

            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error("Lỗi khi tải file:", error);
            alert("Có lỗi xảy ra khi tải file mẫu!");
        }
    }

    return { fetchFile };
}
export default useDataProducts;