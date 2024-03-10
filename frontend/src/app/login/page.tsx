'use client'
import axios from 'axios'
import '../globals.css'
import React from 'react'
import { useRouter } from 'next/navigation';
import config from '@/config';
function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
function LoginPage() {
    const router = useRouter()

    const [disabledBtn, setDisabledBtn] = React.useState(false)
    const [credentials, setCredentials] = React.useState({username: '', password: ''})
    const [shake, setShake] = React.useState(false)
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'username' | 'password') => {
        switch(type) {
            case 'username':
                setCredentials({...credentials, username: e.target.value})
                break
            case 'password':
                setCredentials({...credentials, password: e.target.value})
                break
        }
        console.log(credentials)
    }
    const handleLogin = async () => {
        const response = await axios.get(`${config.serverProtocol}://${config.serverUrl}/api/web/get?username=${credentials.username}&password=${credentials.password}`)
        console.log(response.data)
        if(response.data.code == 200) {
            localStorage.setItem('token', response.data.token)
            router.push('/')
        } else {
            setShake(true)
            await sleep(500)
            setShake(false)
        }
    }
  return (
    <div className='flex justify-center items-center bg-gradient-to-r from-first via-second via-third via-fourth to-fifth min-h-screen'>
        <div className={`rounded-xl flex justify-center items-center flex-col glassy p-8 text-center text-white ${shake ? 'shake-animation' : ''}`}>
            <h1 className='font-sans font-bold text-4xl'>Login</h1>
            <p className='font-sans text-lg mt-4'>Welcome Back! Access the Admin Dashboard</p>
            <div className='flex justify-center items-center w-full flex-col mt-8'>
                <input onChange={(e) => {handleInput(e, 'username')}} className='glassy p-3 w-full rounded-xl border-white border-2 transition duration-500 hover:scale-105 active:scale-100 text-white focus:cursor-text hover:cursor-pointer focus:outline-none text-black bg-transparent' placeholder='Username'/>
                <input type='password' onChange={(e) => {handleInput(e, 'password')}} className='glassy p-3 w-full mt-4 rounded-xl border-white border-2 transition duration-500 text-white hover:scale-105 active:scale-100 focus:cursor-text hover:cursor-pointer focus:outline-none text-black bg-transparent' placeholder='Password'/>
                <button onClick={handleLogin} className='transition duration-500 bg-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90'>Submit</button>
            </div>
        </div>
    </div>
  )
}

export default LoginPage