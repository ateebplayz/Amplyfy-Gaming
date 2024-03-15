import Clan, { ClanUser } from '@/schemas/clan'
import axios from 'axios'
import config from '../config'
import React, { use } from 'react'
import { getUserLevel } from '@/modules/f'

function ClansPage() {
  const [clans, setClans] = React.useState<Array<Clan>>([])
  const [localDescription, setLocalDescription] = React.useState('')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [localUsers, setLocalUsers] = React.useState<Array<ClanUser>>([])
  const fetchData = async () => {
    const resp = await axios.get(`${config.serverProtocol}://${config.serverUrl}/api/clans/fetch?token=${localStorage.getItem('token')}`)
    if(resp.data.code == 200) {
      setClans(resp.data.data)
    } else console.log(resp.data.error)
  }
  React.useEffect(()=>{
    fetchData()
  }, [])
  const handleOpenDescription = (clanDesc: string) => {
    setLocalDescription(clanDesc);
    (document.getElementById('modal_clan_desc') as HTMLDialogElement).showModal()
  }
  const handleOpenUsers = (clanUsers: Array<ClanUser>) => {
    setLocalUsers(clanUsers);
    (document.getElementById('modal_clan_users') as HTMLDialogElement).showModal()
  }
  const filteredClans = clans.filter(clan => 
    clan.name.toLowerCase().startsWith(searchQuery.toLowerCase()) || clan.clanId.startsWith(searchQuery)
  )
  return (
    <div className='flex justify-start items-center w-full min-h-screen flex-col'>
      <h1 className='text-4xl font-bold text-center w-full mb-2 mt-8'>Clans</h1>
      <p className='text-center text-lg w-full mb-4'>Below are all clans created on the server.</p>
      <input className='w-96 lg:w-full glassy p-3 bg-transparent transition duration-500 hover:cursor-pointer hover:scale-110 active:scale-90 focus:outline-none focus:scale-105 focus:cursor-text placeholder-white' placeholder='Search Clan ID or Clan Name' onChange={(e)=>{setSearchQuery(e.target.value)}}/>
      <div className='flex flex-col justify-center items-center w-full h-full overflow-y-scroll'>
        {filteredClans.map((clan, index) => (
          <div key={index} className='w-full glassy flex justify-between items-center flex-row p-10 mt-8 lg:flex-col'>
            <div className='flex justify-center items-center flex-row lg:flex-col'>
              <div className='flex justify-start items-start h-full flex-col mr-4 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-2xl mb-2 lg:w-full lg:text-center'>Clan ID</h1>
                <p className='lg:w-full lg:text-center'>{clan.clanId}</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col mr-4 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-2xl mb-2 lg:w-full lg:text-center'>Clan Name</h1>
                <p className='lg:w-full lg:text-center'>{clan.name}</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col mx-4 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-2xl mb-2 lg:w-full lg:text-center'>Clan Balance</h1>
                <p className='lg:w-full lg:text-center'>{clan.balance}</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col mx-8 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-2xl mb-2 lg:w-full lg:text-center'>Description</h1>
                <p className='underline transition duration-500 hover:opacity-50 cursor-pointer lg:w-full lg:text-center' onClick={()=>{handleOpenDescription(clan.description)}}>Click To Show</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col ml-8 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-2xl mb-2 lg:w-full lg:text-center'>Clan Leader ID</h1>
                <p className='lg:w-full lg:text-center'>{clan.leaderId}</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col ml-8 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-2xl mb-2 lg:w-full lg:text-center'>Clan Users</h1>
                <p className='underline transition duration-500 hover:opacity-50 cursor-pointer lg:w-full lg:text-center' onClick={()=>{handleOpenUsers(clan.Users)}}>{clan.Users.length} Users</p>
              </div>
            </div>
          </div>
        ))}
        {clans.length == 0 ? <h1 className='text-3xl font-bold mt-32 lg:text-center lg:text-2xl'>You do not have permission to view these Clans</h1> : ''}
        {filteredClans.length == 0 && clans.length > 0 ? <h1 className='text-3xl font-bold mt-32 lg:text-2xl lg:text-center'>No Clans exist</h1> : ''}
      </div>
      <dialog id="modal_clan_desc" className="modal">
        <div className="modal-box p-10 glassy-pro bg-transparent">
          <h3 className="font-bold text-lg text-center w-full">Clan Description</h3>
          <p className="py-4 text-center w-full">{localDescription}</p>
          <button onClick={() => { (document.getElementById('modal_clan_desc') as HTMLDialogElement).close() }} className='transition duration-500 bg-first border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
      <dialog id="modal_clan_users" className="modal">
        <div className="modal-box p-10 glassy-pro bg-transparent">
          <h3 className="font-bold text-lg text-center w-full">Clan Users</h3>
          <p className="py-4 text-center w-full">Below are the users belonging to this clan.</p>
          <div className='flex justify-center items-center w-full flex-col'>
            {localUsers.map((localUser, index) => (
              <div key={index} className='bg-third w-full rounded-lg p-2 mt-2 flex justify-between items-center flex-row'>
                <p>{localUser.user}</p>
                <p>{getUserLevel(localUser.permissionLevel)}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { (document.getElementById('modal_clan_users') as HTMLDialogElement).close() }} className='transition duration-500 bg-first border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
    </div>
  )
}

export default ClansPage