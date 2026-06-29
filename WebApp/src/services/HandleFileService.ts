import { useState, type SetStateAction } from "react";
import { BASE_URL } from "../configs/configUrlBase";

export const FileService = (key: string, Id?: string) => {
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
        case "print":
            url = `${BASE_URL}/saleout/print/${Id}`
            break;
        case "revenue":
            url = `${BASE_URL}/saleout/revenue`
            break;
        default:
            url = "";
    }
    const fetchFile = async (fileType: string, fileName: string, date?: any) => {
        if (date) {
            url = `${BASE_URL}/saleout/revenue?fromDate=${date.fromDate}&toDate=${date.toDate}`;
        }
        try {

            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) {
                try {
                    const errorJson = await response.json();
                    return { error: errorJson };
                } catch {
                    const errorText = await response.text().catch(() => "Unknown error");
                    return { error: { detail: errorText } };
                }
            }

            // 1. Đọc dữ liệu trả về dưới dạng BLOB (Binary Large Object)
            const blob = await response.blob();

            // 2. Tạo một đường dẫn URL tạm thời trỏ vào vùng nhớ Blob này
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl; // Đặt tên file khi tải về
            switch (fileType.toLowerCase()) {
                case "xlsx":
                case "xls":
                    link.download = `${fileName}.xlsx`;
                    break;
                case "pdf":
                    link.download = `${fileName}.pdf`
                    break;
                default:
                    throw new Error("Key không hợp lệ");

            }
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);


        } catch (error) {
            console.error("Lỗi khi tải file:", error);
            alert("sảy ra lỗi khi tải file.");
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
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: form
            });

            if (!response.ok) {
                try {
                    const errorJson = await response.json();
                    return { error: errorJson };
                } catch {
                    const errorText = await response.text().catch(() => "Unknown error");
                    return { error: { detail: errorText } };
                }
            }
            alert("Upload dữ liệu thànhcoong");
            setOpen(false);
            setCount(c => c + 1);
            return {error: null}
        } catch (error) {
            console.log(error);
            return {error: error};
        }
    }
    return { fetchFile, uploadFile };
}