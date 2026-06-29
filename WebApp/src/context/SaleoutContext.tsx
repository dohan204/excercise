import { createContext, useContext, type ReactNode } from "react";
import type { Saleout } from "../models/Saleout";
import { useGetSaleout } from "../services/SaleoutDataService";

interface SaleoutContextProps {
    data: Saleout[] | []
}


export const SaleoutContext = createContext<SaleoutContextProps | undefined>(undefined);

export const SaleoutContextProvicer = ({children}: {children: ReactNode}) => {
    const { data } = useGetSaleout();

    return <SaleoutContext.Provider value={{data}}>
        {children}
    </SaleoutContext.Provider>
}


const useSaleoutContext = () => {
    const context = useContext(SaleoutContext);
    if(!context) {
        throw new Error("This method must using within useSaleContext")
    }

    return context;
}

export default useSaleoutContext;