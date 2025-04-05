import React, { useContext, useEffect, useState } from 'react'
import { ProfessorContext } from '../../context/ProfessorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const ProfessorProfile = () => {

    // Destructuring necessary values and functions from ProfessorContext
    // Destructuring the backendUrl from AppContext for API calls
    // State to toggle between edit and view modes for the profile
    const { dToken, profileData, setProfileData, getProfileData } = useContext(ProfessorContext)
    const { backendUrl } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)

     // Function to handle profile updates when the 'Save' button is clicked
    const updateProfile = async () => {

        try {
            // Prepare the updated profile data to be sent to the backend
            const updateData = {
                about: profileData.about, // The professor's about section content
                available: profileData.available // The availability status (checkbox)
            }

            // Sending the update request to the backend API
            const { data } = await axios.post(backendUrl + '/api/professor/update-profile', updateData, { headers: { dToken } })

            // If the update was successful, show a success toast and refresh profile data
            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                getProfileData()
            } else {
                // If the update fails, show an error message using toast
                toast.error(data.message)
            }

            // Ensure that edit mode is turned off after trying to update
            setIsEdit(false)

        } catch (error) {
             // Handle any errors that occur during the update request
            toast.error(error.message)
            console.log(error)
        }

    }

    // useEffect hook to fetch the professor's profile data when the component mounts or when token changes
    useEffect(() => {
        if (dToken) {
            getProfileData()
        }
    }, [dToken])

    return profileData && (
        <div>
            <div className='flex flex-col gap-4 m-5'>

                {/* Displaying the professor's profile picture */}
                <div>
                    <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="" />
                </div>

                 {/* Profile details container */}
                <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>

                   {/* Professor's name, department & email */}
                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700 '>{profileData.name}</p>
                    <hr className='bg-[#ADADAD] h-[1px] border-none' />
                    <p className='text-gray-600 underline mt-3'>PROFESSOR INFORMATION</p>

                    <div className='flex items-center gap-2 mt-3 text-gray-600'>
                        Department: <span className='text-blue-500'>{profileData.department}</span>              
                    </div>

                    <p className='flex items-center gap-2 mt-1 text-gray-700'>
                        Email: <span className='text-blue-500'>{profileData.email}</span>              
                    </p>

                    {/* About section where the professor can add or edit their description */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About :</p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>
                            
                            {/* If in edit mode, show a textarea for updating the about section */}
                            {
                                isEdit
                                    ? <textarea onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))} 
                                    type='text' className='w-full outline-primary p-2' rows={8} value={profileData.about} />
                                    : profileData.about
                            }
                        </p>
                    </div>
                    
                    {/* Checkbox for toggling availability status */}
                    <div className='flex gap-1 pt-2'>
                        <input type="checkbox" onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))} 
                        checked={profileData.available} />
                        <label htmlFor="">Available</label>
                    </div>
                    
                    {/*
                        This section of the code renders either a "Save" or "Edit" button based on the `isEdit` state.
                        - If `isEdit` is true, the "Save" button is shown. This button allows the professor to save any changes made to their profile, 
                        - If `isEdit` is false, the "Edit" button is displayed. 
                    */}
                    {
                    isEdit
                        ? <button onClick={updateProfile} className='bg-primary text-white px-4 py-1 border border-primary text-sm 
                        rounded-md mt-5 hover:bg-[#4a1022] transition-all'>Save</button>
                        : <button onClick={() => setIsEdit(prev => !prev)} className='bg-primary text-white px-4 py-1 border border-primary 
                        text-sm rounded-md mt-5 hover:bg-[#4a1022] transition-all'>Edit</button>
                    }

                </div>
            </div>
        </div>
    )
}

export default ProfessorProfile