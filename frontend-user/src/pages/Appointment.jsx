import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointment = () => {

    // Extract the professor's ID from the URL params
    const { profId } = useParams()
    // Access the context (professors list, backend URL, authentication token, and data fetching functions)
    const { professors, backendUrl, token, getProfessorsData } = useContext(AppContext)

    // Days of the week for easy reference
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    // State to hold the professor info, available time slots, selected slot index, and selected slot time
    const [profInfo, setProfInfo] = useState(false)
    const [profSlots, setProfSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')

    // Navigate function for routing
    const navigate = useNavigate()

    // Fetch professor info based on profId passed through URL
    const fetchProfInfo = async () => {
        const profInfo = professors.find((prof) => prof._id === profId)
        setProfInfo(profInfo)  // Set the fetched professor data
    }

    // Fetch available slots for the professor, excluding weekends (Saturday & Sunday)
    const getAvailableSolts = async () => {

        // Reset the slots array
        setProfSlots([])

        // Get current date
        let today = new Date()

        // Loop through the next 7 days (to get the week’s available slots)
        for (let i = 0; i < 7; i++) {

            // Create a new date object for each day in the loop
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            
            // Check if the day is Saturday (6) or Sunday (0), skip if it's a weekend
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue;  // Skip weekends
            }

            // setting start time of the date with index (8 AM)
            let startTime = new Date()
            startTime.setDate(today.getDate() + i)
            startTime.setHours(8, 0, 0, 0) // Set the start time to 8 AM

            // setting end time of the date with index (6 PM)
            let endTime = new Date()
            endTime.setDate(today.getDate() + i)
            endTime.setHours(18, 0, 0, 0) // Set the end time to 6 PM

            // Adjust the time if today is the target date (don't allow appointment before 8 AM)
            if (today.getDate() === currentDate.getDate()) {
                // Make sure we don't start before 8 AM
                if (currentDate.getHours() < 8) {
                    currentDate.setHours(8, 0, 0, 0)
                } else {
                    currentDate.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0)
                }
            } else {
                currentDate.setHours(8, 0, 0, 0) // Set to 8 AM for future days
            }

            // Array to hold the available time slots for the current day
            let timeSlots = [];

            // Loop through the time slots from 8 AM to 6 PM in 30-minute increments
            while (currentDate < endTime) {
                // Format the current time into a 2-digit hour and minute format (e.g., "08:30")
                let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                // Extract the day of the month (e.g., 15)
                let day = currentDate.getDate()
                // Extract the month (adding 1 because JavaScript months are 0-indexed, i.e., January is 0)
                let month = currentDate.getMonth() + 1
                // Extract the full year (e.g., 2025)
                let year = currentDate.getFullYear()

                // Combine the day, month, and year into a single string to represent the date (e.g., "15_03_2025")
                const slotDate = day + "_" + month + "_" + year
                // Assign the formatted time (e.g., "08:30") to a variable for later use
                const slotTime = formattedTime

                // Check if this slot is available (not already booked)
                const isSlotAvailable = profInfo.slots_booked[slotDate] && profInfo.slots_booked[slotDate].includes(slotTime) ? false : true

                // Check if the time slot is available (i.e., it is not already booked by the professor)
                if (isSlotAvailable) {

                    // If the slot is available, add it to the 'timeSlots' array
                    // Each slot includes the exact datetime and the formatted time
                    timeSlots.push({
                        // Store the actual datetime for the time slot, which is the current Date object
                        datetime: new Date(currentDate),
                        // Store the formatted time as a string (e.g., "08:30")
                        time: formattedTime
                    })
                }
                // Increment current time by 30 minutes
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }
            // Append the time slots for the current day
            setProfSlots(prev => ([...prev, timeSlots]))
        }
    }

    // Function to handle the appointment booking
    const bookAppointment = async () => {

        // Check if the user is logged in (has a token). If not, show a warning and redirect to login page.
        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login') // Navigate to the login page
        }

        // Get the date of the selected slot from the available slots (profSlots) array
        const date = profSlots[slotIndex][0].datetime

        // Format the date to day, month, and year
        let day = date.getDate()
        // APPEARS AS ONE MONTH LATER ON THE FRONT END FOR SOME REASON
        //let month = date.getMonth() + 1 // months are 0-indexed, so adding 1 
        let month = date.getMonth()  // APPEARS CORRECTLY, BUT ONE MONTH EARLIER ON DATABASE
        let year = date.getFullYear()

        // Create a unique string representing the selected date (used for slot availability)
        const slotDate = day + "_" + month + "_" + year

        try {

            // Make a POST request to the backend to book the appointment, passing profId, slotDate, and slotTime
            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', 
                { profId, slotDate, slotTime }, { headers: { token } })

            // If the booking was successful, show a success message, refresh the professor data, and navigate to 'my-appointments'
            if (data.success) {
                toast.success(data.message)
                getProfessorsData() // Refresh professors data after successful appointment booking
                navigate('/my-appointments') // Redirect to the user's appointments page
            } else {
                // If booking failed, show an error message
                toast.error(data.message)
            }

        } catch (error) {
            // Handle any errors that occurred during the API request
            console.log(error)
            toast.error(error.message)
        }

    }

    // useEffect to fetch professor details when professors list is available
    useEffect(() => {
        if (professors.length > 0) {
            fetchProfInfo() // Fetch professor info for the selected professor
        }
    }, [professors, profId])

    // useEffect to load available slots when professor info is available
    useEffect(() => {
        if (profInfo) {
            getAvailableSolts() // Fetch available slots for the selected professor
        }
    }, [profInfo])


    // Render the appointment booking page if professor info is available
    return profInfo ? (
        <div className='mx-20'>

            {/* ---------- Professor Details ----------- */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={profInfo.image} alt="" />
                </div>

                {/* Professor's name, department & email */}
                <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{profInfo.name}</p>
                    <div>
                        <p className='text-gray-600'>
                            Department: <span className='text-blue-500'>{profInfo.department}</span>
                        </p>
                        <p className='text-gray-600'>
                            Email: <span className='text-blue-500'>{profInfo.email}</span>
                        </p>
                    </div>
                    {/* About section*/}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About <img className='w-3' src="" alt="" /></p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{profInfo.about}</p>
                    </div>
                </div>
            </div>
            
            {/* Booking slots */}
            <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
                <p>Available Booking slots</p>

                {/* ----------- Days of the week and date selection ----------- */}
                {/* This section displays clickable days of the week and their corresponding dates */}
                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
                    {profSlots.length && profSlots.map((item, index) => (
                        <div
                            // On clicking a date, update the selected slot index
                            onClick={() => setSlotIndex(index)}
                            key={index}
                            className={`text-center py-6 min-w-16 rounded-md cursor-pointer ${slotIndex === index ? 
                            'bg-primary text-white' : 'border border-gray-400'}`}>

                            {/* Display day of the week (e.g., Monday, Tuesday) */}
                            <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                            {/* Display the day of the month (e.g., 1, 2, 3, etc.) */}
                            <p>{item[0] && item[0].datetime.getDate()}</p>
                        </div>
                    ))}
                </div>

                {/* ----------- Time slots display ----------- */}
                {/* This section displays the available time slots for the selected day */}
                <div className='flex flex-wrap gap-3 items-center w-full mt-4'>
                    {profSlots.length && profSlots[slotIndex].map((item, index) => (
                        <div key={index} className={`flex-shrink-0 w-1/5`}>
                            <p
                                // On clicking a time slot, update the selected time
                                onClick={() => setSlotTime(item.time)}
                                className={`text-sm font-light px-5 py-2 rounded-md cursor-pointer ${item.time === slotTime ? 
                                'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'}`}>
                                {/* Display the time in lowercase (e.g., "10:00 am", "2:00 pm") */}
                                {item.time.toLowerCase()}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ----------- Book Appointment Button ----------- */}
                {/* This button allows the user to confirm and book the appointment with the selected date and time */}
                <button onClick={bookAppointment} className='bg-primary text-white text-lg font-light px-20 
                py-3 rounded-md my-6 hover:bg-[#4a1022]'>
                    Book a meeting
                </button>
            </div>
        </div>
    ) : null
}

export default Appointment