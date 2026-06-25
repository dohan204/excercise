import React, {useState} from 'react'
import SaleoutHeader from './SaleoutHeader'
import SaleoutContent from './SaleoutContent';
import { useGetSaleout } from '../../services/SaleoutDataService';

const SaleoutPage = () => {
  const [value, setValue] = useState<string>("");
  const [search, setSeach] = useState<string>("");
  const [button, setButton] = useState<number>(0);
  const [count, setCount] = useState<number>(0);

  console.log(value);
  console.log(search);
  const {data} = useGetSaleout(value, search, button, count);
  return (
    <div className='flex flex-col'>
      <div className='w-full'>
        <SaleoutHeader 
          button={button} 
          setButton={setButton} 
          count={count}
          setCount={setCount}
          fieldName={value}
          setFieldName={setValue}
          keyword={search}
          setKeyword={setSeach}  />
      </div>
      <div className='w-full'>
        <SaleoutContent data={data} setCount={setCount} />
      </div>
    </div>
  )
}

export default SaleoutPage