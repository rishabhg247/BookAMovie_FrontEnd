import React, { useEffect, useState } from "react";
import { movies, slots, seats } from './data'
import axios from 'axios';
import '../styles/App.css';
import '../styles/bootstrap.min.css'

function App() {
  //sending main Object(details) to localStorage and getting it..
  const [bookingData, setBookingData] = useState(JSON.parse(localStorage.getItem('Object'))
  ||  {movieName: '',timeSlot: '',seats: {A1: 0,A2: 0,A3: 0,A4:0,D1: 0,D2: 0 }});
  const [lastBooking, setLastBooking] = useState(null);
  const[selectedMovie,setSelectedMovie]=useState(localStorage.getItem('selectedMovieName') ||null);
  const[selectedTime,setSelectedTime]=useState(localStorage.getItem('selectedTimeSlot') ||null);
  const[loading,setLoading]=useState(true);

  //useEffect to get selected details even on reload..
  useEffect(() => { localStorage.setItem('Object', JSON.stringify(bookingData)) }, [bookingData]);
  //useEffects to highlght selected option..
  useEffect(()=>{localStorage.setItem('selectedMovieName',selectedMovie)},[selectedMovie]);
  useEffect(()=>{localStorage.setItem('selectedTimeSlot',selectedTime)},[selectedTime]);


  //function to set selected moviename and timeslot in bookingdata(main Object)..
  function movieAndTimeValuesHandler(e) {
    const { name, value } = e.target;
    setBookingData((prev) => { return { ...prev, [name]: value } });
    if(name==='movieName'){setSelectedMovie(value)}
    if(name==='timeSlot'){setSelectedTime(value)};

  }
  //function to set selected seats as object in bookingdata(main Object)..
  function seatObjHandler(e) {
    const { name, value } = e.target;
    setBookingData((prev) => {
      return {...prev, seats:{...prev.seats,[name]:value}}})
  }
  
  //api call to sumbmit selected data..
  async function submitDetails() {
    setLoading(true);
    await axios
      .post('https://book-a-movie-backend.vercel.app/api/booking', bookingData)
      .then((res) => {setLastBooking(res.data);setLoading(false);alert('Booking Successfull');})
      .catch(err => {
        if (err.response.status === 422) {setLoading(false); alert(err.response.data) }
        else {console.log(err.result);setLoading(false) };
      });
    setBookingData({ movieName: '', timeSlot: '', seats: { A1: 0, A2: 0, A3: 0, A4: 0, D1: 0, D2: 0 } });
    setSelectedMovie(null);setSelectedTime(null);
  }
    //api call to get last booking when the page load for the first time..
  async function lastBookingDetails() {
    setLoading(true);
      await axios
      .get('https://book-a-movie-backend.vercel.app/api/booking')
      .then(res => {setLastBooking(res.data);setLoading(false)})
      .catch(err => {console.log(err);setLoading(false)})
  }
  useEffect(() => { lastBookingDetails() }, []);
    //api call to  delete Previous Bookings..
  async function deletePreviousBookings(){
    setLoading(true);
    await axios
    .delete('https://book-a-movie-backend.vercel.app/api/booking')
    .then(res=>{alert(res.data)})
    .catch(err=>{console.log(err)});
    lastBookingDetails();
  }

  return (
    <div className="d-flex" style={{padding:'10vh'}}>
            {/*------------------------Booking Form--------------------- */}
      <div className="container" style={{width:'70%'}}>
        <div className="movie-row">
          <h4>Select a Movie</h4>
          {movies.map((item, index) =>
            <button key={index} className={selectedMovie===item?'bg-info text-light btn movie-column':'bg-light btn movie-column'} name='movieName' value={item} 
            onClick={movieAndTimeValuesHandler}>
              {item}
            </button>)}
        </div>
        <div className="slot-row">
          <h4>Select a Time Slot</h4>
          {slots.map((item, index) =>
            <button key={index} className={selectedTime===item?'bg-info text-light btn slot-column':'bg-light btn slot-column'} name='timeSlot' value={item} onClick={movieAndTimeValuesHandler} >
              {item}
            </button>)}
        </div>
        <div className="seat-row">
          <h4>Select the Seats</h4>

          {seats.map((item, index) =>
          (<div key={index} className="btn btn-light seat-column">
            <h6>{item}</h6>
            <input name={item} onChange={seatObjHandler}
              type="number" min="0" max="10" value={bookingData.seats[item]} />
          </div>))}
        </div>
        <div className="book-button">
          {loading?<h5>Please wait</h5>:
          <button onClick={submitDetails}>Book Now</button>}
        </div>
      </div>
      {/*------------------------show last booking details------------------- */}
      <div className="container w-25">
        <h4 className="text-center pb-3">Last Booking Details:</h4>
        {loading?
        <div className="d-flex align-items-center">
        <strong>Loading...</strong>
        <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
      </div>
         :
        <div>
          {lastBooking ? (
          <>
          <div className="border rounded px-3 py-3 bg-light text-secondary" style={{ lineHeight: "3px" }}>
            <p>Movie Name : <span style={{ lineHeight: "18px" }}>{lastBooking.movieName}</span>
            </p>
            <p>Time-Slot : {lastBooking.timeSlot}</p>
            <p>Seats :-</p>
            <p>A1: {lastBooking.seats.A1}</p>
            <p>A2: {lastBooking.seats.A2}</p>
            <p>A3 : {lastBooking.seats.A3}</p>
            <p>A4 : {lastBooking.seats.A4}</p>
            <p>D1 : {lastBooking.seats.D1}</p>
            <p>D2 : {lastBooking.seats.D2}</p>
          </div>
          <hr />
          <button className="border rounded px-3 py-1 bg-light text-danger" onClick={deletePreviousBookings} >Delete Previous Bookings</button>
          </>
        ):
        (<p className="text-danger text-center">No Previous Booking Found!</p>)}
        </div>
        }

      </div>
    </div>
  )
}
export default App;
