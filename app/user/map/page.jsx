import React from 'react'
import { FaSearch } from "react-icons/fa";


const page = () => {
  return (
    <div>
      <div className='flex bg-gray-200 m-4 p-3 rounded-2xl gap-2'>
        <FaSearch className='text-xl font-bold text-gray-400'/>
        <input type="text" placeholder='Search location or hazard'/>
      </div>
     <div className='w-full h-[80vh] bg-gray-300 flex justify-center items-center'>

     </div>
    </div>
  )
}

export default page
