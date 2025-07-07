import { useState, useEffect } from "react";
import "./eventing.css";
import CardItem from "./eventItem";
import { getUpcomingEvents } from "../../../services/https/index";
import { EventsInterface } from "../../../interface/IEvent";

function Cards() {
  const [events, setEvents] = useState<EventsInterface[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCards = 3;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getUpcomingEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, events.length - visibleCards)
    );
  };

  if (events === null || events.length === 0) {
    return (
      <div className="cards">
        <h1>No Data Available</h1>
      </div>
    );
  }

  return (
    <div className="cards">
      <h1>Check out these EPIC Destinations!</h1>
      <div className="cards__container">
        <div className="cards__wrapper">
          <ul className="cards__items">
            {events.slice(0, 2).map((event) => (
              <CardItem
                key={event.ID}
                src={`http://localhost:8000/${event.Picture}`}
                text={event.Description || "No description available"}
                label={event.Title || "No title available"}
                path={`/events/${event.ID}`}
                startDate={event.StartDate || "N/A"}
                endDate={event.EndDate || "N/A"}
              />
            ))}
          </ul>
        </div>

        {events.length > 2 && (
          <div className="cards__container">
            <button
              className="nav-button left"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              &#9664;
            </button>
            <div className="cards__wrapper">
              <ul className="cards__items">
                {events
                  .slice(currentIndex + 2, currentIndex + 2 + visibleCards)
                  .map((event) => (
                    <CardItem
                      key={event.ID}
                      src={`http://localhost:8000/${event.Picture}`}
                      text={event.Description || "No description available"}
                      label={event.Title || "No title available"}
                      path={`/events/${event.ID}`}
                      startDate={event.StartDate || "N/A"}
                      endDate={event.EndDate || "N/A"}
                    />
                  ))}
              </ul>
            </div>
            <button
              className="nav-button right"
              onClick={handleNext}
              disabled={currentIndex + visibleCards + 2 >= events.length}
            >
              &#9654;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cards;
