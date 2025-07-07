import { useState, useEffect } from "react";
import { message } from "antd";
import { listBookingsByUserID, listReviewsByUserID } from "../../../../services/https/index";
import ModalCreate from "../../../reviews/create";
import ModalEdit from "../../../reviews/edit";
import "../../../reviews/create/review-create.css";
import NavbarUser from "../../../../component/user/navbar";
import Tour from "../MyTicket/AddTicket/Ticket";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface Ticket {
  ID: number;
  BookingDate: string;
  AllPrice: number;
  UserID: number;
  [key: string]: any;
}

const MyTicket = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [uid, setUid] = useState<number>(
    Number(localStorage.getItem("userid")) || 0
  );
  const [messageApi, contextHolder] = message.useMessage();
  const [checkBookings, setCheckBookings] = useState<boolean>(false);
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0); 
  const [itemsPerPage] = useState<number>(2);

  useEffect(() => {
    setUid(Number(localStorage.getItem("userid")));
    const fetchData = async () => {
      try {
        const bookings = await listBookingsByUserID(uid);
        if (bookings && bookings.length > 0) {
          setCheckBookings(true);
          setTickets(bookings);
        }

        const reviews = await listReviewsByUserID(uid);
        if (reviews && reviews.length > 0) {
          setReviewId(reviews[0].ID ?? null);
        }
      } catch (error) {
        messageApi.error("Failed to fetch data. Please try again.");
        console.error(error);
      }
    };
    fetchData();
  }, [uid, messageApi]);

  const openModalCreate = () => setIsOpen(true);
  const openModalEdit = () => setIsEditOpen(true);

  const handleReviewCreated = (newReviewId: number) => {
    setReviewId(newReviewId);
    setIsOpen(false);
  };

  const processedTickets = tickets.map((ticket) => ({
    ID: ticket.ID,
    AllPrice: ticket.AllPrice,
  }));

  const displayedTickets = processedTickets.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const prevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);

      const previousTickets = processedTickets.slice(
        newPage * itemsPerPage,
        (newPage + 1) * itemsPerPage
      );
      console.log("Previous Page Tickets:", previousTickets);
    }
  };

  const nextPage = () => {
    if ((currentPage + 1) * itemsPerPage < processedTickets.length) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);

      const nextTickets = processedTickets.slice(
        newPage * itemsPerPage,
        (newPage + 1) * itemsPerPage
      );
      console.log("Next Page Tickets:", nextTickets);
    }
  };

  return (
    <>
      <NavbarUser />
      <br />
      <br />
      {contextHolder}
      <div className="review-layer">
        {checkBookings ? (
          reviewId ? (
            <button className="button-edit" onClick={openModalEdit}>
              Edit Review
            </button>
          ) : (
            <button className="button-create" onClick={openModalCreate}>
              Review Zoo
            </button>
          )
        ) : (
          <div className="button-normal"></div>
        )}

        {isOpen && (
          <ModalCreate
            open={isOpen}
            onClose={() => setIsOpen(false)}
            UserID={uid}
            onReviewCreated={handleReviewCreated}
          />
        )}

        {isEditOpen && reviewId && (
          <ModalEdit
            open={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            UserID={uid}
            reviewId={reviewId}
          />
        )}
      </div>

      <div className="pagination-buttons">
        <button
          className="circle-button"
          onClick={prevPage}
          disabled={currentPage === 0}
        >
          <ArrowLeft />
        </button>

        <button
          className="circle-button"
          onClick={nextPage}
          disabled={(currentPage + 1) * itemsPerPage >= processedTickets.length}
        >
          <ArrowRight />
        </button>
      </div>

      <br />
      <br />
      <div className="tickets-layer">
        {displayedTickets.length > 0 ? (
          <Tour bookingDetails={displayedTickets} userId={uid} />
        ) : (
          <center>No tickets available</center>
        )}
      </div>
    </>
  );
};

export default MyTicket;
