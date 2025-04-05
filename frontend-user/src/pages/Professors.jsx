import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'

const Professors = () => {

  // Get the department name from the URL parameters
  const { department } = useParams()

  // State to store filtered list of professors based on the selected department
  const [filterProf, setFilterProf] = useState([])
  // State to control the visibility of the filter menu on small screens
  const [showFilter, setShowFilter] = useState(false)
  // Hook for navigation within the app
  const navigate = useNavigate();

  // Access the list of professors from the global context
  const { professors } = useContext(AppContext)


  // Function to filter professors based on the selected department
  const applyFilter = () => {
    if (department) {
      // Filter the professors based on the department from the URL
      setFilterProf(professors.filter(prof => prof.department === department))
    } else {
      // If no department is selected, show all professors
      setFilterProf(professors)
    }
  }

  // Run the filter function whenever the list of professors or department changes
  useEffect(() => {
    applyFilter()
  }, [professors, department])

  return (
    <div className='mx-20'>

      {/* Header description */}
      <p className='text-gray-600'>Browse through the professor list by department.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>

        {/* Toggle button for filter menu (only visible on small screens) */}
        <button onClick={() => setShowFilter(!showFilter)} className={`py-1 px-3 border rounded text-sm  transition-all sm:hidden 
          ${showFilter ? 'bg-primary text-white' : ''}`}>Filters</button>

        {/* Filter options for selecting a department */}
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={() => department === 'Math' ? navigate('/professors') : navigate('/professors/Math')} 
          className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
          ${department === 'Math' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Math</p>
          <p onClick={() => department === 'Engineering' ? navigate('/professors') : navigate('/professors/Engineering')} 
          className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
          ${department === 'Engineering' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Engineering</p>
          <p onClick={() => department === 'Business' ? navigate('/professors') : navigate('/professors/Business')} 
          className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
          ${department === 'Business' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Business</p>
          <p onClick={() => department === 'Science' ? navigate('/professors') : navigate('/professors/Science')} 
          className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
          ${department === 'Science' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Science</p>
          <p onClick={() => department === 'English' ? navigate('/professors') : navigate('/professors/English')} 
          className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
          ${department === 'English' ? 'bg-[#E2E5FF] text-black ' : ''}`}>English</p>
          <p onClick={() => department === 'Art' ? navigate('/professors') : navigate('/professors/Art')} 
          className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
          ${department === 'Art' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Art</p>
        </div>

         {/* Display the list of filtered professors */}
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {filterProf.map((item, index) => (
            <div onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} 
            className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] 
            transition-all duration-500' key={index}>

              {/* Professor's image */}
              <img className='bg-[#EAEFFF]' src={item.image} alt="" />

              {/* Availability status */}
              <div className='p-4'>
                <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : "text-gray-500"}`}>
                  <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : "bg-gray-500"}`}></p>
                  <p>{item.available ? 'Available' : "Not Available"}</p>
                </div>

                {/* Professor's name */}
                <p className='text-[#262626] text-lg font-medium'>{item.name}</p>

                {/* Professor's department */}
                <p className='text-[#5C5C5C] text-sm'>{item.department}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Professors