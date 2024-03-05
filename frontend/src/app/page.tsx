"use client"
import React from "react";
import Image from "next/image";
import HomePage from "@/components/home";
import AdminPage from "@/components/admin";
import ClansPage from "@/components/clans";
import ShopPage from "@/components/shop";
import UsersPage from "@/components/users";

export default function Home() {
  const [selectedPage, setSelectedPage] = React.useState<'home' | 'users' | 'clans' | 'shop' | 'admin'>('home') 
  return (
    <div className="flex justify-center items-center bg-gradient-to-r from-first via-second via-third via-fourth to-fifth min-h-screen text-white flex-col max-w-screen py-6 pb-10">
      <div className="flex glassy w-11/12 m-8 mx-0 p-6 justify-between flex-row">
        <ul className="flex justify-center items-center font-bold flex-row">
          <li className={`mx-2 transition duration-500 hover:bg-white hover:text-first p-2 px-4 rounded-lg cursor-pointer active:scale-90 ${selectedPage == 'home' ? 'bg-white text-first' : ''}`} onClick={()=>{setSelectedPage('home')}}>Home</li>
          <li className={`mx-2 transition duration-500 hover:bg-white hover:text-first p-2 px-4 rounded-lg cursor-pointer active:scale-90 ${selectedPage == 'users' ? 'bg-white text-first' : ''}`} onClick={()=>{setSelectedPage('users')}}>Users</li>
          <li className={`mx-2 transition duration-500 hover:bg-white hover:text-first p-2 px-4 rounded-lg cursor-pointer active:scale-90 ${selectedPage == 'clans' ? 'bg-white text-first' : ''}`} onClick={()=>{setSelectedPage('clans')}}>Clans</li>
          <li className={`mx-2 transition duration-500 hover:bg-white hover:text-first p-2 px-4 rounded-lg cursor-pointer active:scale-90 ${selectedPage == 'shop' ? 'bg-white text-first' : ''}`} onClick={()=>{setSelectedPage('shop')}}>Shop</li>
          <li className={`mx-2 transition duration-500 hover:bg-white hover:text-first p-2 px-4 rounded-lg cursor-pointer active:scale-90 ${selectedPage == 'admin' ? 'bg-white text-first' : ''}`} onClick={()=>{setSelectedPage('admin')}}>Admin</li>
        </ul>
        <ul className="flex justify-center items-center font-bold flex-row">
          <img src="https://images-ext-2.discordapp.net/external/xUPTLOwyTLz3xzcATdcADsiyuK4Or3wAQuQf4rDRU_k/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1186395097386983505/639c0020e392b07d7f18877a3d7b2b83.png?format=webp&quality=lossless&width=48&height=48" className="rounded-full"></img>
        </ul>
      </div>
      <div className="min-h-screen flex justify-center items-center p-6 mt-2 glassy w-11/12">
        {
          selectedPage == 'home' ? <HomePage/> :
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
    </div>
  );
}
