import config from '@/config'
import WebUser from '@/schemas/webUser'
import axios from 'axios'
import '../app/globals.css'
import React, { use } from 'react'
function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function AdminPage() {
  const [users, setUsers] = React.useState<Array<WebUser>>([])
  const [disabled, setDisabled] = React.useState(false)
  const [shake, setShake] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [error, setError] = React.useState('')
  const [perms, setPerms] = React.useState<Array<{ name: string, value: number }>>([])
  const [localUser, setLocalUser] = React.useState<WebUser>({
    username: '',
    password: '',
    permissions: 0b0000000000000000
  })
  const [updateUser, setUpdateUser] = React.useState<WebUser>({
    username: '',
    password: '',
    permissions: 0b0000000000000000
  })
  const [localPerms, setLocalPerms] = React.useState<Array<string>>([])
  const fetchData = async () => {
    axios.get(`${config.serverProtocol}://${config.serverUrl}/api/web/fetch?token=${localStorage.getItem('token')}`).then((resp) => {
      if (resp.data.code == 200) {
        setUsers(resp.data.data)
      }
    })
    axios.get(`${config.serverProtocol}://${config.serverUrl}/api/permissions/fetch`).then((resp) => {
      if (resp.data.code == 200) {
        setPerms(resp.data.data)
      }
    })}
  React.useEffect(() => {
    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'username' | 'password') => {
    setError('')
    setLocalUser(prevState => ({
      ...prevState,
      [type]: e.target.value
    }))
  }
  const handleInputChangeUpdate = (e: React.ChangeEvent<HTMLInputElement>, type: 'username' | 'password') => {
    setError('')
    setUpdateUser(prevState => ({
      ...prevState,
      [type]: e.target.value
    }))
  }

  const handlePermissionChange = (permValue: number) => {
    setError('')
    setLocalUser(prevState => ({
      ...prevState,
      permissions: prevState.permissions ^ permValue
    }))
    console.log(localUser.permissions)
  }
  const handlePermissionChangeUpdate = (permValue: number) => {
    setError('')
    setUpdateUser(prevState => ({
      ...prevState,
      permissions: prevState.permissions ^ permValue
    }))
  }

  const isPermissionEnabled = (permission: number) => {
    return !!(localUser.permissions & permission)
  }
  const isPermissionEnabledUpdate = (permission: number) => {
    return !!(updateUser.permissions & permission)
  }
  const handleCreation = async () => {
    setDisabled(true)
    const resp = await axios.post(`${config.serverProtocol}://${config.serverUrl}/api/web/create`, {
      username: localUser.username,
      password: localUser.password,
      permissions: localUser.permissions,
      token: localStorage.getItem('token')
    })
    if(resp.data.code == 200) {
        setError('')
        setDisabled(false);
        (document.getElementById('modal_create_admin') as HTMLDialogElement).close()
        fetchData()
    } else {
      setError(resp.data.error)
      setShake(true)
      await sleep(500)
      setShake(false)
      setDisabled(false)
    }
  }
  const handleViewPermissionsClick = async (user: WebUser) => {
    setLocalUser(prevUser => ({ ...prevUser, ...user }));
    const resp = await axios.get(`${config.serverProtocol}://${config.serverUrl}/api/permissions/name?perm=${user.permissions}`);
    if(resp.data.code == 200) {
      setLocalPerms(resp.data.data);
      (document.getElementById('modal_view_admin_perm') as HTMLDialogElement).showModal();
      return
    }
  }
  const handleDeletion = async (user: WebUser) => {
    const resp = await axios.post(`${config.serverProtocol}://${config.serverUrl}/api/web/delete`, {
      username: user.username,
      token: localStorage.getItem('token')
    });
    if(resp.data.code == 200) {
      fetchData()
    } else (document.getElementById('modal_delete_admin_perm_invalid') as HTMLDialogElement).showModal()
  }
  const handleUpdate = async () => {
    setDisabled(true)
    console.log(updateUser)
    const resp = await axios.post(`${config.serverProtocol}://${config.serverUrl}/api/web/update`, {
      username: updateUser.username,
      password: updateUser.password,
      permissions: updateUser.permissions,
      token: localStorage.getItem('token')
    })
    if(resp.data.code == 200) {
        setError('')
        setDisabled(false);
          (document.getElementById('modal_update_admin') as HTMLDialogElement).close()
          fetchData()
    } else {
      setError(resp.data.error)
      setShake(true)
      await sleep(500)
      setShake(false)
      setDisabled(false)
    }
  }
  const filteredAdmins = users.filter(admin => 
    admin.username.toLowerCase().includes(searchQuery.toLowerCase())
  )
  return (
    <div className='flex justify-start items-center w-full min-h-screen flex-col'>
      <h1 className='text-4xl font-bold text-center w-full mb-2 mt-8'>Administrators</h1>
      <p className='text-center text-lg w-full mb-4'>Below are all your administrators that have access to this panel</p>
      <button className='rounded-xl shadow-xl glassy p-4 transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm' onClick={() => {setLocalUser({username: '', password: '', permissions: 0b0000000000000000}),(document.getElementById('modal_create_admin') as HTMLDialogElement).showModal()}}>Create New</button>
      <input className='w-96 lg:w-full glassy p-3 bg-transparent transition duration-500 hover:cursor-pointer hover:scale-110 active:scale-90 focus:outline-none focus:scale-105 focus:cursor-text placeholder-white my-4' placeholder='Search Admin Name' onChange={(e)=>{setSearchQuery(e.target.value)}}/>
      <div className='flex flex-col justify-center items-center w-full h-full overflow-y-scroll'>
        {filteredAdmins.map((user, index) => (
          <div key={index} className='w-full glassy flex justify-between items-center flex-row p-10 mt-8 lg:flex-col lg:p-4 lg:pt-8'>
            <div className='flex justify-center items-center flex-row lg:flex-col'>
              <div className='flex justify-start items-start h-full flex-col mr-8 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-2xl mb-2 lg:text-center lg:w-full'>Username</h1>
                <p className='lg:text-center lg:w-full'>{user.username}</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col ml-8 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-2xl mb-2 lg:text-center lg:w-full'>Password</h1>
                <p className='lg:text-center lg:w-full'>
                  {user.password.split('').map((char, index) => (
                    <span key={index}>*</span>
                  ))}
                </p>
              </div>
            </div>
            <div className='w-96 lg:w-full'>
              <button className='rounded-xl my-4 shadow-xl glassy p-3 transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm w-full' onClick={async()=>{handleViewPermissionsClick(user)}}>View Permissions</button>
              <div className='flex justify-center items-center flex-row lg:flex-col'>
                <button className='rounded-xl shadow-xl glassy p-3 transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm w-1/2 mr-2 lg:mx-0 lg:w-full lg:w-full lg:mb-4' onClick={()=>{setUpdateUser(user); (document.getElementById('modal_update_admin') as HTMLDialogElement).showModal()}}>Edit User</button>
                <button onClick={()=>{handleDeletion(user)}} className='rounded-xl shadow-xl glassy p-3 transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm w-1/2 ml-2 bg-red-500 lg:mx-0 lg:w-full lg:w-full'>Delete User</button>
              </div>
            </div>
          </div>
        ))}
        {users.length == 0 ? <h1 className='text-3xl font-bold mt-32'>You do not have permission to view these Administrators</h1> : ''}
        {filteredAdmins.length == 0 && users.length > 0 ? <h1 className='text-3xl font-bold mt-32 lg:text-2xl lg:text-center'>No Clans exist</h1> : ''}
      </div>
      <dialog id="modal_view_admin_perm" className="modal">
        <div className="modal-box p-10 glassy-pro bg-transparent">
          <h3 className="font-bold text-lg text-center w-full">User Permissions</h3>
          <p className="py-4 text-center w-full">Below are the permissions for this user.</p>
          <div className='flex flex-row flex-wrap justify-center items-center w-full'>
            {localPerms.map((localperm, index) => (
              <div className='bg-first rounded-lg p-2 m-1 text-sm' key={index}>
                {localperm}
              </div>
            ))}
          </div>
          <button onClick={() => { (document.getElementById('modal_view_admin_perm') as HTMLDialogElement).close() }} className='transition duration-500 bg-first border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
      <dialog id="modal_delete_admin_perm_invalid" className="modal">
        <div className="modal-box p-10 glassy-pro bg-transparent">
          <h3 className="font-bold text-lg text-center w-full">No Permission</h3>
          <p className="py-4 text-center w-full">You aren&lsquo;t authorized to delete any Administrative Accounts!</p>
          <button onClick={() => { (document.getElementById('modal_delete_admin_perm_invalid') as HTMLDialogElement).close() }} className='transition duration-500 bg-first border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
      <dialog id="modal_create_admin" className="modal">
        <div className={`modal-box p-10 glassy-pro bg-transparent ${shake ? 'shake-animation' : ''}`}>
          <h3 className="font-bold text-lg">Create An Administrator</h3>
          <p className="py-4">Fill out all the information below</p>
          {error !== '' ? 
          <div className='bg-red-200 border-2 border-red-500 text-red-500 rounded-xl p-2'>
            <p className='w-full text-center'>{error}</p>
          </div>
          : <></>}
          <div className='flex justify-center items-center w-full flex-col mb-4'>
            <input onChange={(e) => { handleInputChange(e, 'username') }} placeholder='Username' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-full mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
            <input type='password' onChange={(e) => { handleInputChange(e, 'password') }} placeholder='Password' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-full mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
            <div className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-full mt-4 rounded-xl cursor-pointer  placeholder-white text-white'>
              {perms.map((perm, index) => (
                <div key={index} className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text text-white">{perm.name}</span>
                    <input type="checkbox" checked={isPermissionEnabled(perm.value)} onClick={() => { handlePermissionChange(perm.value) }} className="checkbox checkbox-primary" />
                  </label>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => {handleCreation()}} className={`transition duration-500 bg-first p-3 border-2 border-first w-full mt-4 rounded-xl hover:bg-second hover:border-second active:scale-90 ${disabled ? 'cursor-not-allowed pointer-events-none opacity-50' : ''}`}>Create User</button>
          <button onClick={() => { (document.getElementById('modal_create_admin') as HTMLDialogElement).close() }} className={`transition duration-500 bg-transparent border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second ${disabled ? 'cursor-not-allowed pointer-events-none opacity-50' : ''}`}>Return</button>
        </div>
      </dialog>
      <dialog id="modal_update_admin" className="modal">
        <div className={`modal-box p-10 glassy-pro bg-transparent ${shake ? 'shake-animation' : ''}`}>
          <h3 className="font-bold text-lg">Update An Administrator</h3>
          <p className="py-4">Fill out the information below</p>
          {error !== '' ? 
          <div className='bg-red-200 border-2 border-red-500 text-red-500 rounded-xl p-2'>
            <p className='w-full text-center'>{error}</p>
          </div>
          : <></>}
          <div className='flex justify-center items-center w-full flex-col mb-4'>
            <input type='password' onChange={(e) => { handleInputChangeUpdate(e, 'password') }} placeholder='New Password (Optional)' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-full mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
            <div className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-full mt-4 rounded-xl cursor-pointer  placeholder-white text-white'>
              {perms.map((perm, index) => (
                <div key={index} className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text text-white">{perm.name}</span>
                    <input type="checkbox" checked={isPermissionEnabledUpdate(perm.value)} onClick={() => { handlePermissionChangeUpdate(perm.value) }} className="checkbox checkbox-primary" />
                  </label>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => {handleUpdate()}} className={`transition duration-500 bg-first p-3 border-2 border-first w-full mt-4 rounded-xl hover:bg-second hover:border-second active:scale-90 ${disabled ? 'cursor-not-allowed pointer-events-none opacity-50' : ''}`}>Update User</button>
          <button onClick={() => { (document.getElementById('modal_update_admin') as HTMLDialogElement).close() }} className={`transition duration-500 bg-transparent border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second ${disabled ? 'cursor-not-allowed pointer-events-none opacity-50' : ''}`}>Return</button>
        </div>
      </dialog>
    </div>
  )
}

export default AdminPage
