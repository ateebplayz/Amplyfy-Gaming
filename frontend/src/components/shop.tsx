import config from '@/config'
import Product from '@/schemas/product'
import axios from 'axios'
import React from 'react'
function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function ShopPage() {
  const [products, setProducts] = React.useState<Array<Product>>([])
  const [shake, setShake] = React.useState(false)
  const [localKey, setLocalKey] = React.useState('')
  const [localProductId, setLocalProductId] = React.useState('')
  const [updateProduct, setUpdateProduct] = React.useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    values: []
  })
  const [localKeys, setLocalKeys] = React.useState<Array<string>>([])
  const [localDescription, setLocalDescription] = React.useState('')
  const [disabled, setDisabled] = React.useState(false)
  const [error, setError] = React.useState('')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [error2, setError2] = React.useState('')
  const [createProduct, setCreateProduct] = React.useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    values: []
  })
  const fetchData = async () => {
    const resp = await axios.get(`${config.serverProtocol}://${config.serverUrl}/api/products/fetch?token=${localStorage.getItem('token')}`)
    if(resp.data.code == 200) {
      setProducts(resp.data.data)
    } else console.log(resp.data.error)
  }
  React.useEffect(()=>{
    fetchData()
  }, [])
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'name' | 'description' | 'price' | 'stock') => {
    setError('')
    setCreateProduct(prevState => ({
      ...prevState,
      [type]: e.target.value
    }))
  }
  const handleInputChangeUpdate = (e: React.ChangeEvent<HTMLInputElement>, type: 'name' | 'description' | 'price' | 'stock') => {
    setError('')
    setUpdateProduct(prevState => ({
      ...prevState,
      [type]: e.target.value
    }))
  }
  const handleCreation = async () => {
    setDisabled(true)
    const resp = await axios.post(`${config.serverProtocol}://${config.serverUrl}/api/products/create`, {
      product: createProduct,
      token: localStorage.getItem('token')
    })
    if(resp.data.code == 200) {
        setError('')
        setDisabled(false);
        (document.getElementById('modal_create_product') as HTMLDialogElement).close()
        fetchData()
    } else {
      setError(resp.data.error)
      setShake(true)
      await sleep(500)
      setShake(false)
      setDisabled(false)
    }
  }
  const handleUpdate = async () => {
    setDisabled(true)
    const resp = await axios.post(`${config.serverProtocol}://${config.serverUrl}/api/products/update`, {
      product: updateProduct,
      token: localStorage.getItem('token')
    })
    if(resp.data.code == 200) {
        setError('')
        setDisabled(false);
        (document.getElementById('modal_update_product') as HTMLDialogElement).close()
        fetchData()
    } else {
      setError(resp.data.error)
      setShake(true)
      await sleep(500)
      setShake(false)
      setDisabled(false)
    }
  }
  const handleDeletion = async (product: Product) => {
    const resp = await axios.post(`${config.serverProtocol}://${config.serverUrl}/api/products/delete`, {
      productId: product.id,
      token: localStorage.getItem('token')
    });
    if(resp.data.code == 200) {
      fetchData()
    } else (document.getElementById('modal_delete_product_perm_invalid') as HTMLDialogElement).showModal()
  }
  const handleViewKeys = (product: Product) => {
    setLocalKeys(product.values)
    setLocalProductId(product.id);
    (document.getElementById('modal_keys_product') as HTMLDialogElement).showModal()
  }
  const handleKeyAddition = async () => {
    const resp = await axios.post(`${config.serverProtocol}://${config.serverUrl}/api/products/key/add`, {
      key: localKey,
      productId: localProductId,
      token: localStorage.getItem('token')
    });
    if(resp.data.code == 200) {
      (document.getElementById('modal_keys_product_add') as HTMLDialogElement).close();
      (document.getElementById('modal_keys_product') as HTMLDialogElement).close()
      fetchData()
    } else {
      setError(resp.data.error)
    }
  }
  const handleKeyRemoval = async (key: string) => {
    const resp = await axios.post(`${config.serverProtocol}://${config.serverUrl}/api/products/key/remove`, {
      key: key,
      productId: localProductId,
      token: localStorage.getItem('token')
    });
    if(resp.data.code == 200) {
      (document.getElementById('modal_keys_product') as HTMLDialogElement).close()
      fetchData()
    } else {
      setError2(resp.data.error)
    }
  }
  const filteredProducts = products.filter(product =>
    product.id.toLowerCase().startsWith(searchQuery.toLowerCase()) || product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  return (
    <div className='flex justify-start items-center w-full min-h-screen flex-col'>
      <h1 className='text-4xl font-bold text-center w-full mb-2 mt-8'>Products</h1>
      <p className='text-center text-lg w-full mb-4'>Below are all your Products that are available for purchase.</p>
      <button className='rounded-xl shadow-xl glassy p-4 transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm' onClick={() => {setCreateProduct({id: '',name: '',description: '',price: 0,stock: 0,values: []});(document.getElementById('modal_create_product') as HTMLDialogElement).showModal()}}>Create New</button>
      <input className='w-96 lg:w-full glassy p-3 bg-transparent transition duration-500 hover:cursor-pointer hover:scale-110 active:scale-90 focus:outline-none focus:scale-105 focus:cursor-text placeholder-white my-4' placeholder='Search Product ID or Product Name' onChange={(e)=>{setSearchQuery(e.target.value)}}/>
      <div className='flex flex-col justify-center items-center w-full h-full overflow-y-scroll'>
        {filteredProducts.map((product, index) => (
          <div key={index} className='w-full glassy flex justify-between items-center flex-row p-10 mt-8 lg:flex-col lg:p-4 lg:pt-8'>
            <div className='flex justify-center items-center flex-row lg:flex-col'>
              <div className='flex justify-start items-start h-full flex-col mr-2 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-lg mb-2 lg:w-full lg:text-center'>Product ID</h1>
                <p className='lg:w-full lg:text-center'>{product.id}</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col mx-2 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-lg mb-2 lg:w-full lg:text-center'>Product Name</h1>
                <p className='lg:w-full lg:text-center'>{product.name}</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col mx-2 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-lg mb-2 lg:w-full lg:text-center'>Product Description</h1>
                <p className='underline transition duration-500 hover:opacity-50 cursor-pointer lg:w-full lg:text-center' onClick={()=>{setLocalDescription(product.description); (document.getElementById('modal_description_product') as HTMLDialogElement).showModal()}}>Click To Show</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col mx-2 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-lg mb-2 lg:w-full lg:text-center'>Product Price</h1>
                <p className='lg:w-full lg:text-center'>{product.price}</p>
              </div>
              <div className='flex justify-start items-start h-full flex-col ml-2 lg:mx-2 lg:mb-4'>
                <h1 className='font-bold text-lg mb-2 lg:w-full lg:text-center'>Product Stock</h1>
                <p className='lg:w-full lg:text-center'>{product.stock}</p>
              </div>
            </div>
            <div className='w-96 lg:w-full'>
              <button className='rounded-xl my-4 shadow-xl glassy p-3 transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm w-full' onClick={()=>{handleViewKeys(product)}}>View Product Keys</button>
              <div className='flex justify-center items-center flex-row lg:flex-col'>
                <button className='rounded-xl shadow-xl glassy p-3 transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm w-1/2 mr-2 lg:mx-0 lg:mb-4 lg:w-full' onClick={() => { setUpdateProduct(product); (document.getElementById('modal_update_product') as HTMLDialogElement).showModal() }}>Edit Product</button>
                <button className='rounded-xl shadow-xl glassy p-3 transition duration-500 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm w-1/2 ml-2 bg-red-500 lg:mx-0 lg:mb-4 lg:w-full' onClick={()=>{handleDeletion(product)}}>Delete Product</button>
              </div>
            </div>
          </div>
        ))}
        {products.length == 0 ? <h1 className='text-3xl font-bold mt-32 lg:text-center lg:text-2xl'>You do not have permission to view these Products</h1> : ''}
        {filteredProducts.length == 0 && products.length > 0 ? <h1 className='text-3xl font-bold mt-32 lg:text-2xl lg:text-center'>No Products exist</h1> : ''}
      </div>
      <dialog id="modal_create_product" className="modal">
        <div className={`modal-box p-10 glassy-pro bg-transparent ${shake ? 'shake-animation' : ''}`}>
          <h3 className="font-bold text-lg">Create A Product</h3>
          <p className="py-4">Fill out all the information below</p>
          {error !== '' ? 
          <div className='bg-red-200 border-2 border-red-500 text-red-500 rounded-xl p-2'>
            <p className='w-full text-center'>{error}</p>
          </div>
          : <></>}
          <div className='flex justify-center items-center w-full flex-col mb-4'>
            <input onChange={(e) => { handleInputChange(e, 'name') }} placeholder='Name' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-full mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
            <input onChange={(e) => { handleInputChange(e, 'description') }} placeholder='Short Description' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-full mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
            <div className='flex flex-row justify-center items-center'>
              <input onChange={(e) => {handleInputChange(e, 'price')}} placeholder='Price' type='number' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-1/2 mr-2 mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
              <input onChange={(e) => {handleInputChange(e, 'stock')}} placeholder='Stock' type='number' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-1/2 ml-2 mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
            </div>
          </div>
          <button onClick={() => {handleCreation()}} className={`transition duration-500 bg-first p-3 border-2 border-first w-full mt-4 rounded-xl hover:bg-second hover:border-second active:scale-90 ${disabled ? 'cursor-not-allowed pointer-events-none opacity-50' : ''}`}>Create Product</button>
          <button onClick={() => { (document.getElementById('modal_create_product') as HTMLDialogElement).close() }} className={`transition duration-500 bg-transparent border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second ${disabled ? 'cursor-not-allowed pointer-events-none opacity-50' : ''}`}>Return</button>
        </div>
      </dialog>
      <dialog id="modal_update_product" className="modal">
        <div className={`modal-box p-10 glassy-pro bg-transparent ${shake ? 'shake-animation' : ''}`}>
          <h3 className="font-bold text-lg">Update A Product</h3>
          <p className="py-4">Fill out the information below</p>
          {error !== '' ? 
          <div className='bg-red-200 border-2 border-red-500 text-red-500 rounded-xl p-2'>
            <p className='w-full text-center'>{error}</p>
          </div>
          : <></>}
          <div className='flex justify-center items-center w-full flex-col mb-4'>
            <input onChange={(e) => { handleInputChangeUpdate(e, 'name') }} value={updateProduct.name} className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-full mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
            <input onChange={(e) => { handleInputChangeUpdate(e, 'description') }} value={updateProduct.description} className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-full mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
            <div className='flex flex-row justify-center items-center'>
              <input onChange={(e) => {handleInputChangeUpdate(e, 'price')}} value={updateProduct.price} type='number' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-1/2 mr-2 mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
              <input onChange={(e) => {handleInputChangeUpdate(e, 'stock')}} value={updateProduct.stock} type='number' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-1/2 ml-2 mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
            </div>
          </div>
          <button onClick={() => {handleUpdate()}} className={`transition duration-500 bg-first p-3 border-2 border-first w-full mt-4 rounded-xl hover:bg-second hover:border-second active:scale-90 ${disabled ? 'cursor-not-allowed pointer-events-none opacity-50' : ''}`}>Update Product</button>
          <button onClick={() => { (document.getElementById('modal_update_product') as HTMLDialogElement).close() }} className={`transition duration-500 bg-transparent border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second ${disabled ? 'cursor-not-allowed pointer-events-none opacity-50' : ''}`}>Return</button>
        </div>
      </dialog>
      <dialog id="modal_delete_product_perm_invalid" className="modal">
        <div className="modal-box p-10 glassy-pro bg-transparent">
          <h3 className="font-bold text-lg text-center w-full">No Permission</h3>
          <p className="py-4 text-center w-full">You aren&lsquo;t authorized to delete any Products!</p>
          <button onClick={() => { (document.getElementById('modal_delete_product_perm_invalid') as HTMLDialogElement).close() }} className='transition duration-500 bg-first border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
      <dialog id="modal_description_product" className="modal">
        <div className="modal-box p-10 glassy-pro bg-transparent">
          <h3 className="font-bold text-lg text-center w-full">Product Description</h3>
          <p className="py-4 text-center w-full">{localDescription}</p>
          <button onClick={() => { (document.getElementById('modal_description_product') as HTMLDialogElement).close() }} className='transition duration-500 bg-first border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
      <dialog id="modal_keys_product" className="modal">
        <div className="modal-box p-10 glassy-pro bg-transparent justify-center items-center flex flex-col">
          <h3 className="font-bold text-lg text-center w-full">Product Keys</h3>
          <p className="py-4 text-center w-full">Below are all the keys for this product</p>
          <button className='rounded-xl shadow-xl glassy p-3 transition duration-500 mb-4 hover:translate-y-[5px] hover:scale-105 active:scale-90 active:translate-y-[-5px] text-sm' onClick={() => {(document.getElementById('modal_keys_product_add') as HTMLDialogElement).showModal()}}>Add New</button>
          {error2 !== '' ? 
          <div className='bg-red-200 w-full border-2 border-red-500 text-red-500 rounded-xl p-2'>
            <p className='w-full text-center'>{error2}</p>
          </div>
          : <></>}
          {
            localKeys.map((localKey, index) => (
              <div key={index} className='bg-third w-full rounded-lg p-2 mt-2 flex justify-between items-center flex-row'>
                <p>{localKey}</p>
                <p className='underline transition duration-500 hover:opacity-50 cursor-pointer' onClick={()=>{handleKeyRemoval(localKey)}}>Remove</p>
              </div>
            ))
          }
          <button onClick={() => { (document.getElementById('modal_keys_product') as HTMLDialogElement).close() }} className='transition duration-500 bg-first border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
      <dialog id="modal_keys_product_add" className="modal">
        <div className="modal-box p-10 glassy-pro bg-transparent">
          <h3 className="font-bold text-lg text-center w-full">Add A Key</h3>
          <p className="py-4 text-center w-full">Fill out all the information below.</p>
          {error !== '' ? 
          <div className='bg-red-200 border-2 border-red-500 text-red-500 rounded-xl p-2'>
            <p className='w-full text-center'>{error}</p>
          </div>
          : <></>}
          <input onChange={(e) => { setLocalKey(e.target.value) }} placeholder='Key' className='transition duration-500 bg-secondTrans p-3 border-2 border-secondTrans w-full mt-4 rounded-xl cursor-pointer hover:scale-105 focus:outline-none focus:scale-110 focus:cursor-text active:scale-90 placeholder-white text-white' />
          <button onClick={() => { handleKeyAddition() }} className='transition duration-500 bg-first border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Add Key</button>
          <button onClick={() => { (document.getElementById('modal_keys_product_add') as HTMLDialogElement).close() }} className='transition duration-500 bg-transparent border-2 border-first p-3 w-full mt-4 rounded-xl hover:bg-second active:scale-90 hover:border-second'>Return</button>
        </div>
      </dialog>
    </div>
  )
}

export default ShopPage