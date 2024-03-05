'use client'
<<<<<<< HEAD
import axios from 'axios'
import '../globals.css'
import React from 'react'
import { useRouter } from 'next/navigation';
function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
=======
import config from '../../config/index'
import '../globals.css'
import React from 'react'
import axios from 'axios'

function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

>>>>>>> 1c05eb3600e24680526510b34d3b5e5a39954dfa
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
<<<<<<< HEAD
    const loginBtn = async () => {
        setDisabledBtn(true)
        const request = await axios.get(`http://localhost:8080/api/web/get?username=${credentials.username}&password=${credentials.password}`)
        console.log(request.data)
        if(request.data.code == 200) {
            localStorage.setItem('token', request.data.token)
            router.push('/')
        } else {
            setDisabledBtn(false)
=======
    const handleLogin = async () => {
        const response = await axios.get(`${config.serverProtocol}://${config.serverUrl}/api/web/get?username=${credentials.username}&password=${credentials.password}`)
        if(response.data.code == 200) {

        } else {
>>>>>>> 1c05eb3600e24680526510b34d3b5e5a39954dfa
            setShake(true)
            await sleep(500)
            setShake(false)
        }
    }
  return (
<<<<<<< HEAD
    <div className='flex text-white justify-center items-center bg-gradient-to-r from-first via-second via-third via-fourth to-fifth min-h-screen'>
        <div className={`rounded-xl flex justify-center items-center flex-col glassy p-8 text-center bg-[rgba(255, 255, 255, 0.34)] ${shake ? 'shake-element' : ''}`}>
=======
    <div className='flex justify-center items-center bg-gradient-to-r from-first via-second via-third via-fourth to-fifth min-h-screen'>
        <div className={`rounded-xl flex justify-center items-center flex-col glassy p-8 text-center ${shake ? 'shake-animation' : ''}`}>
>>>>>>> 1c05eb3600e24680526510b34d3b5e5a39954dfa
            <h1 className='font-sans font-bold text-4xl'>Login</h1>
            <p className='font-sans text-lg mt-4'>Welcome Back! Access the Admin Dashboard</p>
            <div className='flex justify-center items-center w-full flex-col mt-8'>
                <input onChange={(e) => {handleInput(e, 'username')}} className='glassy p-3 w-full rounded-xl border-white border-2 transition duration-500 hover:scale-105 active:scale-100 focus:cursor-text hover:cursor-pointer focus:outline-none text-black' placeholder='Username'/>
<<<<<<< HEAD
                <input onChange={(e) => {handleInput(e, 'password')}} className='glassy p-3 w-full mt-4 rounded-xl border-white border-2 transition duration-500 hover:scale-105 active:scale-100 focus:cursor-text hover:cursor-pointer focus:outline-none text-black' type='password' placeholder='Password'/>
                <button onClick={loginBtn} className={`transition duration-500 bg-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 ${disabledBtn ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}>Submit</button>
=======
                <input type='password' onChange={(e) => {handleInput(e, 'password')}} className='glassy p-3 w-full mt-4 rounded-xl border-white border-2 transition duration-500 hover:scale-105 active:scale-100 focus:cursor-text hover:cursor-pointer focus:outline-none text-black' placeholder='Password'/>
                <button onClick={handleLogin} className='transition duration-500 bg-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90'>Submit</button>
>>>>>>> 1c05eb3600e24680526510b34d3b5e5a39954dfa
            </div>
        </div>
    </div>
  )
}

export default LoginPage