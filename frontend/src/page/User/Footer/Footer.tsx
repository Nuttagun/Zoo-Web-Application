import  { useEffect } from 'react'
import './footer.css'
import video2 from '../../../assets/Video Demo1.2.mp4'
import {FiSend} from 'react-icons/fi'
import {AiFillYoutube} from 'react-icons/ai'
import {AiFillInstagram} from 'react-icons/ai'
import {AiOutlineTwitter} from 'react-icons/ai'
import {FaTripadvisor} from 'react-icons/fa'
import Aos from 'aos'
import 'aos/dist/aos.css'
 
const Footer = () => {
   useEffect(()=>{
      Aos.init({duration: 2000})
   }, [])
  return (
    <section id='footer'className='footer'>
      <div className="videoDiv">
      <video src={video2} loop autoPlay muted></video>
      </div>
     <div className="secContent container">
      <div className="contactDiv flex">
        <div className="inputDiv flex">
          <button data-aos="fade-up" data-aos-duration="3000" className='btn flex'  type='submit'>My Team  <FiSend className="icon"/></button>
        </div>
      </div>
       
       <div className="footerCard flex-1">
         <div className="footerIntro flex">
         <div className="logoDiv">
            <a href="#" className="logo flex"><h1>Development Team</h1></a>
          </div>

          <div data-aos="fade-up" data-aos-duration="2000"  className="footerParagraph">
            <p>1.Kanyapron Kd is responsible for <strong>Role Admin</strong> and <strong>Edit Profile</strong></p>
            <p>2.Nuttagun Samanjai is responsible for <strong>Role Veterinary</strong> and <strong>Manage Animal Feed</strong></p>
            <p>3.Rattaphon Phonthaisong is responsible for <strong>Role Zoosale</strong> and <strong>Payment System</strong></p>
            <p>4.Mj Janisata is responsible for <strong>Role Vehicle Manager</strong> and <strong>Ticket/Rent</strong></p>
            <p>5.Sahaphon Art is responsible for <strong>Promotion</strong> and <strong>Chat</strong></p>
            <p>6.Tawunchai Burakhon is responsible for <strong>Role Zookeeper</strong> and <strong>Review</strong></p>
          </div>

          <div data-aos="fade-up" data-aos-duration="3000"  className="footerSocials flex">       
          <AiOutlineTwitter className="icon"/>
          <AiFillYoutube className="icon"/>
          <AiFillInstagram className="icon"/>
          <FaTripadvisor className="icon"/>
          </div>
         </div>

         <div className="footerDiv flex">
           <small></small>
           <small></small>
         </div>
       </div>

     </div>

    </section>
  )
}

export default Footer