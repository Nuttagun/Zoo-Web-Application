import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./popular.css";
import { BsArrowRightShort } from "react-icons/bs";
import { BsArrowLeftShort } from "react-icons/bs";
import Aos from "aos";
import "aos/dist/aos.css";
import { getWorkByEmployeeID } from "../../../../services/https/index";
import { WorkInterface } from "../../../../interface/IWork";

const Popular = () => {
  const [works, setWorks] = useState<WorkInterface[]>([]);
  const [employeeid, setEmployeeid] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks the current slide index
  const navigate = useNavigate();
  console.log(employeeid)

  useEffect(() => {
    const idFromStorage = Number(localStorage.getItem("employeeid")) || 2;
    setEmployeeid(idFromStorage);
    Aos.init({ duration: 2000 });

    const fetchWorks = async () => {
      const employeeID = idFromStorage;
      const fetchedWorks = await getWorkByEmployeeID(employeeID);
      if (fetchedWorks) {
        setWorks(fetchedWorks);
      }
    };

    fetchWorks();
  }, []);

  const itemsPerPage = 4; // Number of items to display per page
  const maxIndex = Math.ceil(works.length / itemsPerPage) - 1; // Calculate the maximum index

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const displayedWorks = works
  .filter((work) => work.Habitat?.Picture) 
  .slice(currentIndex * itemsPerPage, currentIndex * itemsPerPage + itemsPerPage);

   // Conditional rendering if no works are fetched
   if (works.length === 0) {
    return null; // Render nothing
  }

 

  return (
    <section
      className="popular section container"
      style={{ padding: "20px", minHeight: "100vh" }}
    >
      <br />
      <br />
      <br />
      <br />
      <div className="secContainter">
        <div className="secHeader flex">
          <div
            data-aos="fade-right"
            data-aos-duration="2500"
            className="textDiv"
          >
            <h2 className="secTitle">Receipt Works</h2>
            <p>
              From feeding to cleaning, explore the essential works completed by
              employees!
            </p>
          </div>

          <div
            data-aos="fade-left"
            data-aos-duration="2500"
            className="iconsDiv flex"
          >
            <BsArrowLeftShort
              className={`icon leftIcon ${currentIndex === 0 ? "disabled" : ""}`}
              onClick={handlePrevious}
            />
            <BsArrowRightShort
              className={`icon ${currentIndex === maxIndex ? "disabled" : ""}`}
              onClick={handleNext}
            />
          </div>
        </div>

        <div className="mainContent grid">
          {displayedWorks.map(({ ID, Habitat, finish_date }) => (
            <div data-aos="fade-up" className="singleDestination" key={ID}>
              <div className="destImage">
                <img
                  src={`http://localhost:8000/${Habitat?.Picture}`}
                  alt="Work Image"
                />
                <div className="overlayInfo">
                  <h3>{Habitat?.Name || "Unknown Habitat"}</h3>
                  <p>{new Date(finish_date).toLocaleDateString()}</p>
                  <BsArrowRightShort
                    className="icon"
                    onClick={() =>
                      navigate("/Zookeeper/scription", {
                        state: { workID: ID },
                      })
                    }
                  />
                </div>
              </div>

              <div className="destFooter">
                <div className="number">0{ID}</div>
                <div className="destText flex">
                  <h6>{Habitat?.Name || "Unknown Habitat"}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Popular;
