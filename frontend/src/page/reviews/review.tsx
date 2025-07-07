import { useEffect, useState } from "react";
import { ReviewInterface } from "../../interface/IReview";
import UserDefaultProfile from "../../assets/Profile-user.jpg";
import { ListReview, GetUserByIdReview } from "../../services/https";
import { FaStar } from "react-icons/fa";
import ModalReview from "./Model/model"
import { Card,Button } from "antd";
import "./review.css";

const Review = () => {
  const [filteredReviews, setFilteredReviews] = useState<ReviewInterface[]>([]);
  const [userNames, setUserNames] = useState<string[]>([]);
  const [userProfiles, setUserProfiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
};

const handleCancel = () => {setIsModalVisible(false);};

  const getReviews = async () => {
    try {
      setLoading(true); 
      const res = await ListReview();
      if (res) {
        setFilteredReviews(res.slice(0, 6)); 

        const userPromises = res.map(async (review) => {
          if (review.UserID) {
            const { profile, fullName } = await getUserNameAndProfileById(
              review.UserID
            );
            return { name: fullName, profile };
          }
          return { name: "Unknown User", profile: "" };
        });

        const userInfos = await Promise.all(userPromises);
        console.log(userNames)
        setUserNames(userInfos.map((info) => info.name));
        setUserProfiles(userInfos.map((info) => info.profile));
      }
    } catch (err) {
      setError("Failed to fetch reviews");
      console.error(err);
    } finally {
      setLoading(false); 
    }
  };

  const getUserNameAndProfileById = async (id: number) => {
    const user = await GetUserByIdReview(id);
    console.log(user)
    if (user) {
      return {
        fullName: `${user.FirstName ?? ""} ${user.LastName ?? ""}`,
        profile: user.Profile || "",
      };
    }
    return { fullName: "", profile: "" };
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "Unknown Date";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStarsUser = (rating: number = 0) => (
    <div className="star-container">
      {[...Array(5)].map((_, index) => (
        <FaStar
          key={index}
          className={index < rating ? "star-color-rating" : "star-color-fail"}
        />
      ))}
    </div>
  );

  const truncateComment = (comment?: string) => {
    if (!comment) return "";
    return comment.length > 100 ? `${comment.slice(0, 100)}...` : comment;
  };

  const renderComment = (comment?: string) => {
    if (!comment) return null;
    const truncatedComment = truncateComment(comment);
    return <span dangerouslySetInnerHTML={{ __html: truncatedComment }} />;
  };

  useEffect(() => {
    getReviews();
  }, []);

  if (filteredReviews === null || filteredReviews.length === 0) {
    return (
      <div className="cards">
        <h1>No Data Available</h1> 
      </div>
    );
  }

  return (
    <div>
      <header>
        <center className="reviews-overview">
          <h1>What Our Visitors Say</h1>
        </center>
      </header>

      <body>
        <div className="box-course-profile">
          {loading ? (
            <p>Loading reviews...</p> 
          ) : error ? (
            <p>{error}</p> 
          ) : (
            <div className="reviews-grid">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review, index) => (
                  <Card key={review.ID} className="review-card">
                    <div className="review-container">
                      <img
                        src={`http://localhost:8000/${userProfiles[index]}` || UserDefaultProfile} 
                        className="review-profile-img"
                        alt="User Profile"
                      />
                      <div className="reviews-comment-text">
                        <p>Name: {userNames[index] ?? "Unknown User"}</p>
                        <p>
                          Rating:{" "}
                          <span className="rating-stars">
                            {renderStarsUser(review.Rating ?? 0)}
                          </span>
                          <span className="date-review">
                            {formatDate(review.ReviewDate)}
                          </span>
                        </p>
                        <p>{renderComment(review.Comment)}</p>
                      </div>
                      <hr />
                    </div>
                  </Card>
                ))
              ) : (
                <p>No Reviews Found.</p>
              )}
            </div>
          )}
        </div>
      </body>

      <footer>
        <center className="reviews-readmore">
          <Button type="link" style={{  display: 'block',textAlign: 'center',color: '#002A48',margin: '10px 0',}} onClick={showModal}>Read More Visitor Reviews</Button>
        </center>
      </footer>
      <ModalReview isVisible={isModalVisible} handleCancel={handleCancel} />
      <br />
    </div>
  );
};

export default Review;