"use client"
import React from "react";
import AdminPage from "@/components/admin";
import ClansPage from "@/components/clans";
import ShopPage from "@/components/shop";
import UsersPage from "@/components/users";
import { useRouter } from "next/navigation";
import axios from "axios";
import config from "@/config";

export default function Home() {
  const router = useRouter()
  const [stats, setStats] = React.useState<{products: number, users: number, clans: number, keys: number, administrators: number}>({
    products: -1,
    users: -1,
    clans: -1,
    keys: -1,
    administrators: -1,
  })
  const fetchData = async () => {
    const resp = await axios.get(`${config.serverProtocol}://${config.serverUrl}/api/stats/get?token=${localStorage.getItem('token')}`)
    if(resp.data.code == 200) {
      setStats(resp.data.data)
    } else {
      if(resp.data.error = 'Invalid Token Format') {
        localStorage.clear()
        router.push('/login')
      }
    }
  }
  React.useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token) router.push('/login')
    fetchData()
  }, [])
  const [selectedPage, setSelectedPage] = React.useState<'home' | 'users' | 'clans' | 'shop' | 'admin'>('home')
  return (
    <div className="flex justify-center items-center bg-gradient-to-r from-first via-second via-third via-fourth to-fifth min-h-screen text-white flex-col max-w-screen pb-10">
      <div className="flex glassy w-11/12 m-8 mx-0 p-4 overflow-x-auto justify-between flex-row text-sm z-50">
        <ul className="flex justify-center items-center font-bold flex-row">
          <li className={`mx-2 transition duration-500 hover:bg-white hover:text-first p-2 px-4 rounded-lg cursor-pointer active:scale-90 ${selectedPage == 'home' ? 'bg-white text-first' : ''}`} onClick={()=>{setSelectedPage('home')}}>Home</li>
          <li className={`mx-2 transition duration-500 hover:bg-white hover:text-first p-2 px-4 rounded-lg cursor-pointer active:scale-90 ${selectedPage == 'users' ? 'bg-white text-first' : ''}`} onClick={()=>{setSelectedPage('users')}}>Users</li>
          <li className={`mx-2 transition duration-500 hover:bg-white hover:text-first p-2 px-4 rounded-lg cursor-pointer active:scale-90 ${selectedPage == 'clans' ? 'bg-white text-first' : ''}`} onClick={()=>{setSelectedPage('clans')}}>Clans</li>
          <li className={`mx-2 transition duration-500 hover:bg-white hover:text-first p-2 px-4 rounded-lg cursor-pointer active:scale-90 ${selectedPage == 'shop' ? 'bg-white text-first' : ''}`} onClick={()=>{setSelectedPage('shop')}}>Shop</li>
          <li className={`mx-2 transition duration-500 hover:bg-white hover:text-first p-2 px-4 rounded-lg cursor-pointer active:scale-90 ${selectedPage == 'admin' ? 'bg-white text-first' : ''}`} onClick={()=>{setSelectedPage('admin')}}>Admin</li>
          <li className={`mx-2 transition duration-500 hover:bg-white hover:text-first p-2 px-4 rounded-lg cursor-pointer active:scale-90 lgo:hidden`} onClick={()=>{(document.getElementById('modal_logout_main') as HTMLDialogElement).showModal()}}>Logout</li>
        </ul>
        <ul className="flex justify-center items-center font-bold flex-col z-50 lg:hidden">
          <img src="https://images-ext-2.discordapp.net/external/xUPTLOwyTLz3xzcATdcADsiyuK4Or3wAQuQf4rDRU_k/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1186395097386983505/639c0020e392b07d7f18877a3d7b2b83.png?format=webp&quality=lossless&width=40&height=40" className="rounded-full transition duration-500 hover:scale-105 active:scale-90 cursor-pointer" onClick={()=>{(document.getElementById('modal_logout_main') as HTMLDialogElement).showModal()}}></img>
        </ul>
      </div>
      <div className="min-h-screen flex justify-center items-center p-6 mt-2 z-10 glassy w-11/12">
        {
          selectedPage == 'home' ? 
          <div className='flex flex-col justify-start items-start w-full'>
            <h1 className='text-4xl font-bold text-center w-full mb-2 mt-8'>Dashboard</h1>
            <p className='text-center text-lg w-full mb-4'>Below are some shortcuts to your panels</p>
            <div className='flex justify-center items-center flex-row lg:flex-col w-full flex-wrap'>
              {stats.products !== -1 ? 
              <div className='flex justify-start glassy p-8 items-center w-[29%] lg:w-full flex-col m-4 lg:m-0 lg:mt-8'>
                <h1 className={'text-7xl mt-4 text-white font-bold w-full text-center'}>{stats.products}</h1>
                <h1 className='text-3xl w-full text-center'>Products</h1>
                <button className='mt-6 rounded-xl shadow-xl glassy p-4 w-full transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px]' onClick={()=>{setSelectedPage('shop')}}>Manage Products</button>
              </div>
              :
              <></>}
              {stats.users !== -1 ?
              <div className='flex justify-start glassy p-8 items-center w-[29%] lg:w-full flex-col m-4 lg:m-0 lg:mt-8'>
                <h1 className='text-7xl mt-4 text-white font-bold w-full text-center'>{stats.users}</h1>
                <h1 className='text-3xl w-full text-center'>Users</h1>
                <button className='mt-6 rounded-xl shadow-xl glassy p-4 w-full transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px]' onClick={()=>{setSelectedPage('users')}}>Manage Users</button>
              </div> : <></>}
              {stats.clans !== -1 ?
              <div className='flex justify-start glassy p-8 items-center w-[29%] lg:w-full flex-col m-4 lg:m-0 lg:mt-8'>
                <h1 className='text-7xl mt-4 text-white font-bold w-full text-center'>{stats.clans}</h1>
                <h1 className='text-3xl w-full text-center'>Clans</h1>
                <button className='mt-6 rounded-xl shadow-xl glassy p-4 w-full transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px]' onClick={()=>{setSelectedPage('clans')}}>Manage Clans</button>
              </div> : <></> }
              {stats.keys !== -1 ?
              <div className='flex justify-start glassy p-8 items-center w-[29%] lg:w-full flex-col m-4 lg:m-0 lg:mt-8'>
                <h1 className='text-7xl mt-4 text-white font-bold w-full text-center'>{stats.keys}</h1>
                <h1 className='text-3xl w-full text-center'>Keys</h1>
                <button className='mt-6 rounded-xl shadow-xl glassy p-4 w-full transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px]' onClick={()=>{setSelectedPage('shop')}}>Manage Keys</button>
              </div> : <></>}
              {stats.administrators !== -1 ?
              <div className='flex justify-start glassy p-8 items-center w-[29%] lg:w-full flex-col m-4 lg:m-0 lg:mt-8'>
                <h1 className='text-7xl mt-4 text-white font-bold w-full text-center'>{stats.administrators}</h1>
                <h1 className='text-3xl w-full text-center'>Admin Users</h1>
                <button className='mt-6 rounded-xl shadow-xl glassy p-4 w-full transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px]' onClick={()=>{setSelectedPage('admin')}}>Manage Administrators</button>
              </div> : <></>}
            </div>
          </div> :
          selectedPage == 'admin' ? <AdminPage/> :
          selectedPage == 'clans' ? <ClansPage/> :
          selectedPage == 'shop' ? <ShopPage/> :
          selectedPage == 'users' ? <UsersPage/> :
          <></>
        }
      </div>
      <div className="mt-8 glassy p-4 w-11/12 justify-center items-center">
        <p className="text-center w-full">Made by Grab Your Services. Licensed under Amplyfy Gaming. No legal binding. No reselling permitted.</p>
      </div>
      <dialog id="modal_logout_main" className="modal">
        <div className="modal-box glassy-pro bg-transparent">
          <h3 className="font-bold text-lg">Leaving So Soon?</h3>
          <p className="py-4">Click the button below to logout or close this modal.</p>
          <button onClick={()=>{localStorage.clear(); router.push('/login')}} className='transition duration-500 bg-first p-3 border-2 border-first w-full mt-4 rounded-xl hover:bg-second hover:border-second active:scale-90'>Log Out</button>
          <button onClick={()=>{(document.getElementById('modal_logout_main') as HTMLDialogElement).close()}} className='transition duration-500 bg-transparent border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
    </div>
  );
}
