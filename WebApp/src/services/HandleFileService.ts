import type { SetStateAction } from "react";
import { BASE_URL } from "../configs/configUrlBase";

export const FileService = (key: string) => {
    let url: string = "";
    switch (key) {
        case "download":
            url = `${BASE_URL}/products/patternFile`;
            break;
        case "upload":
            url = `${BASE_URL}/products/insertmany`;
            break;
        case "sale-download":
            url = `${BASE_URL}/saleout/download`;
            break;
        case "sale-upload":
            url = `${BASE_URL}/saleout/upload`;
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

            const link = document.createElement('a');
            link.href = downloadUrl; // Đặt tên file khi tải về
            link.download = "filemau.xlsx"
            document.body.appendChild(link);
            link.click(); // Kích hoạt lệnh tải

            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error("Lỗi khi tải file:", error);
            alert("Có lỗi xảy ra khi tải file mẫu!");
        }
    }


    const uploadFile = async (
            keyName: string, 
            setOpen: React.Dispatch<SetStateAction<boolean>>,
            setCount: React.Dispatch<SetStateAction<number>>) => {
        const fileInput = document.querySelector(`#${keyName}`) as HTMLInputElement;
        const file = fileInput?.files[0];

        if (!file) {
            alert("Please select a file first!");
            return;
        }
        const form = new FormData();
        form.append('file', file);

        fetch(url, {
            method: 'POST',
            body: form
        }).then(response => response.json())
            .then(() => alert("Upload dữ liệu thành Công."))
            .then(() => setOpen(false))
            .then(() => setCount(c => c + 1))
            .catch(err => alert(`Dữ liệu không hợp lệ, vui lòng kiểm tra lại: ${err}`));
    }
    return { fetchFile, uploadFile };
}