import { useEffect, useState } from "react";
import "./about.css";
import customerImg from "../../../assets/images/visitors.jpg";
import mountainImg from "../../../assets/images/bird111.jpg";
import climbingImg from "../../../assets/images/zonezoo.jpg";
import video from "../../../assets/Video Demo1.3.mp4";
import { ListAnimal,GetZones,GetUserAll } from "../../../services/https";
import Aos from "aos";
import "aos/dist/aos.css";

const About = () => {
  const [animalCount, setAnimalCount] = useState<number>(0);
  const [zonesCount, setZonesCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);

  const getAnimals = async () => {
    console.log("Fetching animal data...");
    try {
      const res = await ListAnimal();
      console.log("ListAnimal response:", res);

      const zones = await GetZones();

      const users = await GetUserAll();

      if (users && users.length > 0) {
        setUsersCount(users.length);
        console.log("Processed User Data:", users.length);
      }

      if (zones && zones.length > 0) {
        setZonesCount(zones.length);
        console.log("Processed Zones Data:", zones.length);
      }

      if (res && res.length > 0) {
        setAnimalCount(res.length);
        console.log("Processed Animals Data:", res.length);
      } else {
        console.error("No data returned from ListAnimal");
      }
    } catch (error) {
      console.error("Error fetching animal data:", error);
    }
  };

  useEffect(() => {
    getAnimals();
    Aos.init({ duration: 2000 });
  }, []);

  return (
    <section className="about  section">
      <div className="secContainer">
        <h2 className="title">Why must you visit the zoo?</h2>

        <div className="mainContent container grid">
          <div
            data-aos="fade-up"
            data-aos-duration="2000"
            className="singleItem"
          >
            <img src={mountainImg} alt="Image" />
            <h3>{animalCount} Animals</h3>
            <p>
              Over {animalCount} Animals Discover a diverse world of wildlife! Meet
              fascinating creatures up close and learn about their unique
              stories.
            </p>
          </div>

          <div
            data-aos="fade-up"
            data-aos-duration="2500"
            className="singleItem"
          >
            <img src={climbingImg} alt="Image" />
            <h3>{zonesCount} Exciting Zones</h3>
            <p>
              "{zonesCount} Exciting Zones Immerse yourself in three unique zones of
              adventure! Explore the Wildlife Zone to meet majestic land animals
              in their natural habitats.
            </p>
          </div>

          <div
            data-aos="fade-up"
            data-aos-duration="3000"
            className="singleItem"
          >
            <img src={customerImg} alt="Image" />
            <h3>{usersCount} Visitors</h3>
            <p>
              Over {usersCount} Visitors Visiting the zoo helps reduce stress and
              improve well-being. Turn an ordinary day into a memorable one!
            </p>
          </div>
        </div>

        <div className="videoCard container">
          <div className=" cardContent grid">
            <div data-aos="fade-right" className="cardText">
              <h2>Wonderful Zoo experience awaits!</h2>
              <p>
                Explore the wonders of nature with amazing wildlife and
                unforgettable adventures at every turn!
              </p>
            </div>

            <div data-aos="fade-left" className="cardVideo">
              <video src={video} autoPlay muted loop></video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
