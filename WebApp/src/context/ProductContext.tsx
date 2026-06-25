import { createContext, useContext, type ReactNode } from "react";
import type { MasterProduct } from "../models/MasterProduct";
import useDataProducts from "../services/ProductDataService";

export interface ProductContextProps {
    data: MasterProduct[]
}


export const ProductContext = createContext<ProductContextProps | undefined>(undefined);


interface ProductProviderProps {
    children: ReactNode
}
export const ProductProvider = ({children}: ProductProviderProps) => {
    const {data} = useDataProducts();
    return <ProductContext.Provider value={{data}}>
        {children}
    </ProductContext.Provider>
}



export const useProductContext = () => {
    const context = useContext(ProductContext);

    if(context===undefined) {
        throw new Error("useProductContext must be used within a ProductProvider.");
    }

    return context;
}