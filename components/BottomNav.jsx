'use client'
import React from 'react'
import { CiHome,CiMap,CiUser   } from "react-icons/ci";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useRouter } from 'next/navigation';



const BottomNav = () => {
  const router=useRouter();
  const NavItem=[
    {
        icon:<CiHome className="text-3xl"/> ,
        name:"Home",
        route:"/user/dashboard"
    },
    {
        icon:<IoDocumentTextOutline className="text-3xl"/>,
        name:"Report",
        route:"/user/report"
    },
    {
        icon:<CiMap className="text-3xl"/>,
        name:"Map",
        route:"/user/map"
    },
    {
        icon:<IoIosNotificationsOutline className="text-3xl"/>,
        name:"Notifications",
        route:"/user/notifications"
    },
    {
        icon:<CiUser className="text-3xl"/>,
        name:"Profile",
        route:"/user/profile"
    },
  ]
  
    return (
    <div className='w-full h-[10vh] bg-gray-200 fixed bottom-0 flex justify-around'>
      {NavItem.map((item,index)=>(
        <div key={index}
        onClick={()=>router.push(item.route)}
        className='flex flex-col justify-center items-center '>
            {item.icon}
            {item.name}
        </div>
      ))}
    </div>
  )
}

export default BottomNav
