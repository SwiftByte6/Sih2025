import LogoutButton from '@/components/LogoutButton'
import React from 'react'

const page = () => {
    return (
        <div>
            <h1 className='text-center font-medium text-2xl'>Profile</h1>
            <div className='w-full flex-col gap-3   flex justify-center items-center mt-10'>
                <div className='w-44 h-44 bg-gray-400 rounded-full flex justify-center items-center text-5xl font-bold text-white'>

                </div>
                <h1 className='text-2xl font-bold '>Sophia Carter</h1>
                <div className='flex flex-col gap-1'>
                    <h2 className='text-gray-500 text-sm text-center  '>Citizen Reporter</h2>
                    <p className='text-gray-500 text-sm text-center  '>San Francisco,CA</p>
                </div>
                <button className='w-[90%] px-4 py-2 rounded-3xl bg-blue-300 font-bold'>
                    Edit Profile
                </button>
            </div>
            <div className='w-full p-4 mt-10'>
                <h1 className='text-2xl'>Report History</h1>
                <div className='w-full h-40 bg-gray-200 rounded-2xl flex justify-center items-center mt-4'>
                    No Reports Yet
                </div>
            </div>
            <div className='w-full p-4 mt-10'>
               <LogoutButton/>

            </div>
        </div>
    )
}

export default page
