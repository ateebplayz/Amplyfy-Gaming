import React from 'react'

function HomePage() {
  return (
    <div className='flex flex-col justify-start items-start w-full'>
      <h1 className='text-4xl font-bold text-center w-full mb-2 mt-8'>Dashboard</h1>
      <p className='text-center text-lg w-full mb-4'>Below are some shortcuts to your panels</p>
      <div className='flex justify-center items-center flex-row w-full flex-wrap'>
        <div className='flex justify-start glassy p-8 items-center w-[29%] flex-col m-4'>
          <h1 className='text-7xl mt-4 text-white font-bold w-full text-center'>15</h1>
          <h1 className='text-3xl w-full text-center'>Products</h1>
          <button className='mt-6 rounded-xl shadow-xl glassy p-4 w-full transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px]'>Manage Products</button>
        </div>
        <div className='flex justify-start glassy p-8 items-center w-[29%] flex-col m-4'>
          <h1 className='text-7xl mt-4 text-white font-bold w-full text-center'>400</h1>
          <h1 className='text-3xl w-full text-center'>Users</h1>
          <button className='mt-6 rounded-xl shadow-xl glassy p-4 w-full transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px]'>Manage Users</button>
        </div>
        <div className='flex justify-start glassy p-8 items-center w-[29%] flex-col m-4'>
          <h1 className='text-7xl mt-4 text-white font-bold w-full text-center'>9</h1>
          <h1 className='text-3xl w-full text-center'>Clans</h1>
          <button className='mt-6 rounded-xl shadow-xl glassy p-4 w-full transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px]'>Manage Clans</button>
        </div>
        <div className='flex justify-start glassy p-8 items-center w-[29%] flex-col m-4'>
          <h1 className='text-7xl mt-4 text-white font-bold w-full text-center'>130</h1>
          <h1 className='text-3xl w-full text-center'>Keys</h1>
          <button className='mt-6 rounded-xl shadow-xl glassy p-4 w-full transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px]'>Manage Keys</button>
        </div>
        <div className='flex justify-start glassy p-8 items-center w-[29%] flex-col m-4'>
          <h1 className='text-7xl mt-4 text-white font-bold w-full text-center'>3</h1>
          <h1 className='text-3xl w-full text-center'>Admin Users</h1>
          <button className='mt-6 rounded-xl shadow-xl glassy p-4 w-full transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px]'>Manage Administrators</button>
        </div>
      </div>
    </div>
  )
}

export default HomePage