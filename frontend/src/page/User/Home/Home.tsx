import { useEffect } from 'react';
import './home.css';
import video from '../../../assets/Video Demo1.1.mp4';
import Aos from 'aos';
import 'aos/dist/aos.css';

const Home = () => {
  useEffect(() => {
    Aos.init({ duration: 2000 });
  }, []);

  return (
    <section id="home" className="home">
      <div className="overlay"></div>
      <video src={video} autoPlay loop muted></video>

      <div data-aos="fade-down" className="homeContent container">
        <div className="textDiv">
          <span className="smallText">Our Packages</span>
          <h1 data-aos="fade-down" className="homeTitle">
            Animal In The ZOO
          </h1>
        </div>
      </div>
    </section>
  );
};

export default Home;
