import config from '@/config'
import Purchase from '@/schemas/purchase'
import BotUser, { Balance } from '@/schemas/user'
import axios from 'axios'
import React, { use } from 'react'

function UsersPage() {
  const [users, setUsers] = React.useState<Array<BotUser>>([])
  const [localItems, setLocalItems] = React.useState<Array<Purchase>>([])
  const [localBalance, setLocalBalance] = React.useState<Balance>({snowflakes: 0, iceCubes: 0})
  const [error, setError] = React.useState('')
  const [disabled, setDisabled] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [shake, setShake] = React.useState(false)
  const [updateUser, setUpdateUser] = React.useState<BotUser>({
    userId: '',
    balance: {
      snowflakes: 0,
      iceCubes: 0,
    },
    clanId: '',
    items: []
  })
  const fetchData = async () => {
    const resp = await axios.get(`${config.serverProtocol}://${config.serverUrl}/api/users/fetch?token=${localStorage.getItem('token')}`)
    if(resp.data.code == 200) {
      setUsers(resp.data.data)
    } else console.log(resp.data.error)
  }
  React.useEffect(()=>{
    fetchData()
  }, [])
  const handleOpenBalance = (user: BotUser) => {
    setLocalBalance(user.balance);
    (document.getElementById('modal_view_balance') as HTMLDialogElement).showModal()
  }
  const handleDeletion = async (user: BotUser) => {
    const resp = await axios.post(`${config.serverProtocol}://${config.serverUrl}/api/users/delete`, {
      userId: user.userId,
      token: localStorage.getItem('token')
    });
    if(resp.data.code == 200) {
      fetchData()
    } else (document.getElementById('modal_delete_user_perm_invalid') as HTMLDialogElement).showModal()
  }
  const handleUpdate = async () => {
    setDisabled(true)
    const resp = await axios.post(`${config.serverProtocol}://${config.serverUrl}/api/users/update`, {
      user: updateUser,
      token: localStorage.getItem('token')
    })
    if(resp.data.code == 200) {
        setError('')
        setDisabled(false);
        (document.getElementById('modal_update_user') as HTMLDialogElement).close()
        fetchData()
    } else {
      setError(resp.data.error)
      setShake(true)
      await sleep(500)
      setShake(false)
      setDisabled(false)
    }
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'balance-snowflakes' | 'balance-iceCubes' | 'clanId') => {
    setError('')
    switch (type) {
      case 'clanId':
        setUpdateUser(prevState => ({
          ...prevState,
          clanId: e.target.value
        }))
        break
      case 'balance-snowflakes':
        setUpdateUser(prevState => ({
          ...prevState,
          balance: {
            ...prevState.balance,
            snowflakes: parseInt(e.target.value)
          }
        }))
        break
      case 'balance-iceCubes':
        setUpdateUser(prevState => ({
          ...prevState,
          balance: {
            ...prevState.balance,
            iceCubes: parseInt(e.target.value)
          }
        }))
        break
    }
  }
  const handleItemOpen = (items: Array<Purchase>) => {
    setLocalItems(items);
    (document.getElementById('modal_items_show') as HTMLDialogElement).showModal()
  }
  const filteredUsers = users.filter(user => 
    user.userId.toLowerCase().startsWith(searchQuery.toLowerCase())  
  )
  return (
    <div className='flex justify-start items-center w-full min-h-screen flex-col'>
      <h1 className='text-4xl font-bold text-center w-full mb-2 mt-8'>Users</h1>
      <p className='text-center text-lg w-full mb-4'>Below are all your users that have used any command on the bot</p>
      <input className='w-96 lg:w-full glassy p-3 bg-transparent transition duration-500 hover:cursor-pointer hover:scale-110 active:scale-90 focus:outline-none focus:scale-105 focus:cursor-text placeholder-white' placeholder='Search User ID' onChange={(e)=>{setSearchQuery(e.target.value)}}/>
      <div className='flex flex-col justify-center items-center w-full h-full overflow-y-scroll'>
        {filteredUsers.map((user, index) => (
          <div key={index} className='w-full glassy flex justify-between items-center flex-row lg:flex-col p-10 lg:p-4 lg:pt-8 mt-8'>
            <div className='flex justify-center items-center flex-row lg:flex-col'>
              <div className='flex justify-start items-start h-full flex-col mr-4 lg:mx-2'>
                <h1 className='font-bold text-2xl mb-2 lg:text-center lg:w-full'>User ID</h1>
                <p className='lg:text-center lg:w-full'>{user.userId}</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col mx-4 lg:mx-2'>
                <h1 className='font-bold text-2xl mb-2 lg:text-center lg:w-full'>Clan ID</h1>
                <p className='lg:text-center lg:w-full'>{user.clanId == '' ? 'None Joined' : user.clanId}</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col mx-8 lg:mx-2'>
                <h1 className='font-bold text-2xl mb-2 lg:text-center lg:w-full'>Balance</h1>
                <p className='underline transition duration-500 hover:opacity-50 cursor-pointer lg:text-center lg:w-full' onClick={()=>{handleOpenBalance(user)}}>Click To Show</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col ml-8 lg:mx-2'>
                <h1 className='font-bold text-2xl mb-2 lg:text-center lg:w-full'>Items</h1>
                <p className='underline transition duration-500 hover:opacity-50 cursor-pointer lg:text-center lg:w-full' onClick={()=>{handleItemOpen(user.items)}}>Click To Show</p>
              </div>
            </div>
            <div className='w-96 lg:w-full'>
              <button className='rounded-xl my-4 shadow-xl glassy p-3 transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm w-full' onClick={()=>{window.open(`https://discordapp.com/users/${user.userId}`)}}>Check User on Discord</button>
              <div className='flex justify-center items-center flex-row lg:flex-col'>
                <button className='rounded-xl shadow-xl glassy p-3 transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm w-1/2 mr-2 lg:w-full lg:m-0' onClick={() => { setUpdateUser(user); (document.getElementById('modal_update_user') as HTMLDialogElement).showModal() }}>Edit User</button>
                <button className='rounded-xl shadow-xl glassy p-3 transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm w-1/2 ml-2 bg-red-500 lg:w-full lg:m-0 lg:mt-4' onClick={()=>{handleDeletion(user)}}>Delete User</button>
              </div>
            </div>
          </div>
        ))}
        {users.length == 0 ? <h1 className='text-3xl font-bold mt-32 lg:text-2xl lg:text-center'>You do not have permission to view these Users</h1> : ''}
        {filteredUsers.length == 0 && users.length > 0 ? <h1 className='text-3xl font-bold mt-32 lg:text-2xl lg:text-center'>No Users exist</h1> : ''}
      </div>
      <dialog id="modal_view_balance" className="modal">
        <div className="modal-box p-10 glassy-pro bg-transparent">
          <h3 className="font-bold text-lg text-center w-full">User Balance</h3>
          <p className="py-4 text-center w-full">Below is this users Balance.</p>
          <div className='flex flex-row flex-wrap justify-center items-center w-full'>
            <div className='bg-first rounded-lg p-2 m-1 text-sm'>
              <p><span className='font-bold'>Snowflakes: </span>{localBalance.snowflakes}</p>
            </div>
            <div className='bg-first rounded-lg p-2 m-1 text-sm'>
              <p><span className='font-bold'>Ice Cubes: </span>{localBalance.iceCubes}</p>
            </div>
          </div>
          <button onClick={() => { (document.getElementById('modal_view_balance') as HTMLDialogElement).close() }} className='transition duration-500 bg-first border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
      <dialog id="modal_update_user" className="modal">
        <div className={`modal-box p-10 glassy-pro bg-transparent ${shake ? 'shake-animation' : ''}`}>
          <h3 className="font-bold text-lg text-center w-full">Update User</h3>
          <p className="py-4">Fill out the information below</p>
          {error !== '' ? 
          <div className='bg-red-200 border-2 border-red-500 text-red-500 rounded-xl p-2'>
            <p className='w-full text-center'>{error}</p>
          </div>
          : <></>}
          <div className='flex justify-center items-center w-full flex-col mb-4'>
            <input onChange={(e) => {handleInputChange(e, 'clanId')}} placeholder='Clan ID' value={updateUser.clanId} className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-full mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
            <div className='flex flex-row justify-center items-center'>
              <input onChange={(e) => {handleInputChange(e, 'balance-snowflakes')}} placeholder='Snowflakes' value={updateUser.balance.snowflakes} type='number' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-1/2 mr-2 mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
              <input onChange={(e) => {handleInputChange(e, 'balance-iceCubes')}} placeholder='Ice Cubes' value={updateUser.balance.iceCubes} type='number' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-1/2 ml-2 mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
            </div>
          </div>
          <button onClick={() => {handleUpdate()}} className={`transition duration-500 bg-first p-3 border-2 border-first w-full mt-4 rounded-xl hover:bg-second hover:border-second active:scale-90 ${disabled ? 'cursor-not-allowed pointer-events-none opacity-50' : ''}`}>Update User</button>
          <button onClick={() => { (document.getElementById('modal_update_user') as HTMLDialogElement).close() }} className={`transition duration-500 bg-transparent border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second ${disabled ? 'cursor-not-allowed pointer-events-none opacity-50' : ''}`}>Return</button>
        </div>
      </dialog>
      <dialog id="modal_delete_user_perm_invalid" className="modal">
        <div className="modal-box p-10 glassy-pro bg-transparent">
          <h3 className="font-bold text-lg text-center w-full">No Permission</h3>
          <p className="py-4 text-center w-full">You aren&lsquo;t authorized to delete any User Accounts!</p>
          <button onClick={() => { (document.getElementById('modal_delete_user_perm_invalid') as HTMLDialogElement).close() }} className='transition duration-500 bg-first border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
      <dialog id="modal_items_show" className="modal">
        <div className="modal-box p-10 glassy-pro bg-transparent">
          <h3 className="font-bold text-lg text-center w-full">User Purchase</h3>
          <p className="py-4 text-center w-full">Below are these Users Purchases.</p>
          <div className='flex justify-center items-center w-full flex-col'>
            {localItems.map((item, index) => (
              <div key={index} className='bg-third w-full rounded-lg p-2 mt-2 flex justify-between items-center flex-row'>
                <p>{item.product.name}</p>
                <p>{new Date(item.time).toLocaleDateString('en-us')}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { (document.getElementById('modal_items_show') as HTMLDialogElement).close() }} className='transition duration-500 bg-first border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
    </div>
  )
}

export default UsersPage

function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}