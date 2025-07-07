import { useEffect, useState } from "react";
import { Layers, SquareChartGantt, SquarePlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ListEvent, DeleteEventByID } from "../../../services/https";
import { EventsInterface } from "../../../interface/IEvent";
import { Modal, message } from "antd";
import "./event.css";

const Event = () => {
  const [events, setEvents] = useState<EventsInterface[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [eventCount, setEvent] = useState<number>(0);

  const getEvents = async () => {
    try {
      const data = await ListEvent();
      if (data) {
        setEvents(data);
        setEvent(data.length);
      } else {
        console.error("No data returned from ListEvent");
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  const handleOk = async () => {
    setConfirmLoading(true);
    console.log("Attempting to delete event with ID:", deleteId);

    try {
      const res = await DeleteEventByID(deleteId);
      if (res) {
        setOpen(false);
        messageApi.open({
          type: "success",
          content: "ลบข้อมูลอีเว้นสำเร็จ",
        });
        await getEvents();
      } else {
        throw new Error("ลบข้อมูลอีเว้นไม่สำเร็จ");
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "An error occurred while deleting the event!",
      });
    }
    setConfirmLoading(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const showModal = (event: EventsInterface) => {
    setModalText(`Are you sure you want to delete "${event.Title}"?`);
    setDeleteId(event.ID);
    setOpen(true);
  };

  return (
    <div style={{ margin: 0, padding: 0,marginBottom:"100px" }}>
      {contextHolder}
      {events.length === 0 ? (
        <div></div>
      ) : (
        <div style={{ display: "flex", width: "97%",margin:0 }}>
          <h1 className="header-event-box">
            <Layers size={24} style={{ marginRight: "10px"}} />
            Event
          </h1>
          <h1 className="header-eventcount-animals-box">
            <SquareChartGantt size={28} style={{ marginRight: "10px" }} />
            Total Event : {eventCount}
          </h1>
          <Link to="/zookeeper/create-event">
            <h1 className="header-create-event-box">
              <SquarePlus size={28} style={{ marginRight: "10px" }} />
              Create Event
            </h1>
          </Link>
        </div>
      )}
      <div className="container">
        {events.length === 0 ? (
          <div className="no-data-message">
            <h1>No Data Available</h1>
          </div>
        ) : (
          <div className="card__container">
            {events.map((event, index) => (
              <article key={index} className="card__article">
                <img
                  src={`http://localhost:8000/${event.Picture}`}
                  alt="Event Picture"
                  style={{
                    width: "240px",
                    height: "210px",
                    borderRadius: "1.5rem",
                    cursor: "pointer",
                  }}
                />
                <div className="card__data">
                  <span className="card__description">Event Zoo</span>
                  <h2 className="card__title">
                    {event.Title && event.Title.length > 30
                      ? `${event.Title.substring(0, 30)}...`
                      : event.Title || "Untitled"}
                  </h2>
                  <button
                    onClick={() => navigate(`/zookeeper/events/edit/${event.ID}`)}
                    className="card__button_Edit"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => showModal(event)}
                    className="card__button_Delete"
                  >
                    DELETE
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <Modal
        title="Delete Confirmation"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>{modalText}</p>
      </Modal>
    </div>
  );  
};

export default Event;
