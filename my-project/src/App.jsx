import React from 'react'
import axios from 'axios'
const App = () => {

const getData = async ()=> {
  
  const response = await axios.get('https://picsum.photos/v2/list?page=1&limit=10')
  console.log(response.data);
}

  return (
    <div className='bg-black h-screen p-4 text-white'>
      <button
      onClick={getData}
      className='active:scale-95 bg-green-600 text-white px-5 py-2 rounded '>Get Data</button>
    </div>
  )
}

export default App