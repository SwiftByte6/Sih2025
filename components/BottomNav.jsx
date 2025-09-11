'use client'
import React from 'react'
import { useI18n } from '@/contexts/I18nContext'
// import icons removed, using images instead
import { useRouter } from 'next/navigation';



const BottomNav = () => {
  const router=useRouter();
  const { t } = useI18n();
  const NavItem=[
  {
    img: "/home.png",
    name: t('app.home'),
    route: "/user/dashboard"
  },

  {
    img: "/map.png",
    name: t('user.map'),
    route: "/user/map"
  },
    {
    img: "/add.png",
    name: t('user.report'),
    route: "/user/report"
  },
  {
    img: "/bell.png",
    name: t('user.notifications'),
    route: "/user/notifications"
  },
  {
    img: "/profile.png",
    name: t('user.profile'),
    route: "/user/profile"
  },
  ]
  
    return (
    <div className='w-full h-[10vh] bg-white/90 fixed bottom-0 left-0 flex justify-around items-center shadow-[0_-2px_12px_rgba(0,0,0,0.08)] z-50 border-t border-gray-200'>
      {NavItem.map((item,index)=>(
        <button
          key={index}
          onClick={()=>router.push(item.route)}
          className='flex flex-col justify-center items-center px-2 focus:outline-none hover:text-blue-600 transition-colors font-medium text-xs text-gray-700 active:scale-95'
          style={{ minWidth: 60 }}
        >
            <img src={item.img} alt={item.name} className="w-8 h-8 mb-1" />
            <span className="mt-1">{item.name}</span>
        </button>
      ))}
    </div>
  )
}

export default BottomNav
