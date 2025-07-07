import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import {
  ListReview,
  GetFilteredReviews,
  SearchReviewsByKeyword,
  GetUserByIdReview,
} from "../../../services/https";
import { ReviewInterface } from "../../../interface/IReview";
import {
  Modal as AntModal,
  Input,
  Button,
  Row,
  Col,
  Select,
  Card,
  Image,
  Divider,
} from "antd";
import AverageStar from "../../../feature/averagestar";
import Like from "../../../feature/like";
import "./model.css";
import Noprofile from "../../../assets/no review.jpg";

const { Option } = Select;

interface ReviewModalProps {
  isVisible: boolean;
  handleCancel: () => void;
}

const Modal: React.FC<ReviewModalProps> = ({ isVisible, handleCancel }) => {
  const [reviews, setReviews] = useState<ReviewInterface[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewInterface[]>([]);
  const [starLevel, setStarLevel] = useState<string>("All");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [userProfiles, setUserProfiles] = useState<Record<number, string>>({});
  const [userNames, setUserNames] = useState<Record<number, string>>({});
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [expandedReviewIds, setExpandedReviewIds] = useState<number[]>([]);
  const [uid, setUid] = useState<number>(Number(localStorage.getItem("userid")) || 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reviewsData = await ListReview();
        if (Array.isArray(reviewsData)) {
          setReviews(reviewsData);
          setFilteredReviews(reviewsData);

          const ratings = reviewsData.map(
            (review: ReviewInterface) => review.Rating ?? 0
          );
          const average =
            ratings.length > 0
              ? ratings.reduce(
                  (sum: number, rating: number) => sum + rating,
                  0
                ) / ratings.length
              : 0;
          setAverageRating(parseFloat(average.toFixed(1)));
          setTotalReviews(ratings.length);

          const userIds = Array.from(
            new Set(
              reviewsData
                .map((review: ReviewInterface) => review.UserID)
                .filter((id) => id !== undefined)
            )
          ) as number[];

          const users = await Promise.all(
            userIds.map((userId) => GetUserByIdReview(userId))
          );
          const profileMap: Record<number, string> = {};
          const nameMap: Record<number, string> = {};

          users.forEach((user) => {
            if (user) {
              profileMap[user.ID ?? 0] = user.Profile || "";
              nameMap[user.ID ?? 0] = `${user.FirstName ?? ""} ${
                user.LastName ?? ""
              }`;
            }
          });

          setUserProfiles(profileMap);
          setUserNames(nameMap);
        } else {
          setReviews([]);
          setFilteredReviews([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setUid(Number(localStorage.getItem("userid")));
    setExpandedReviewIds([]);
  }, [isVisible]);

  const searchAndFilterReviews = async () => {
    try {
      let filtered: ReviewInterface[] = reviews;

      if (searchKeyword.length > 0) {
        const result = await SearchReviewsByKeyword(searchKeyword);
        if (result && result.length > 0) {
          const partialMatchRegex = new RegExp(searchKeyword, "gi");
          filtered = result.map((review: ReviewInterface) => {
            const comment = review.Comment || "";
            return {
              ...review,
              Comment: comment.replace(
                partialMatchRegex,
                (match) => `<span class="highlighted-text">${match}</span>`
              ),
            };
          });
        } else {
          filtered = [];
        }
      }

      if (starLevel !== "All") {
        const filteredByStars = await GetFilteredReviews(starLevel); 
        if (filteredByStars && filteredByStars.length > 0) {
          filtered = filtered.filter((review) =>
            filteredByStars.some((starReview) => starReview.ID === review.ID)
          );
        } else {
          filtered = [];
        }
      }

      setFilteredReviews(filtered);
    } catch (error) {
      console.error("Error searching and filtering reviews:", error);
    }
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "Unknown Date";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return typeof date === "string"
      ? new Date(date).toLocaleDateString(undefined, options)
      : date.toLocaleDateString(undefined, options);
  };

  const renderStars = (rating: number = 0) =>
    [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "star-color-rating" : "star-color-fail"}
      />
    ));

  const toggleShowMore = (reviewId: number) => {
    setExpandedReviewIds((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const renderComment = (review: ReviewInterface) => {
    if (!review.Comment) return null;
    const isExpanded = expandedReviewIds.includes(review.ID ?? 0);
    const comment = review.Comment;
  
    if (comment.length > 300 && !isExpanded) {
      return (
        <span>
          <span
            dangerouslySetInnerHTML={{
              __html: comment.substring(0, 300),
            }}
          />
          <span
            onClick={() => toggleShowMore(review.ID ?? 0)}
            style={{
              color: "#007BFF",
              cursor: "pointer",
              fontWeight: "bold",
              marginLeft: "5px",
            }}
          >
            ...Show more
          </span>
        </span>
      );
    }
  
    return (
      <span>
        <span
          dangerouslySetInnerHTML={{
            __html: comment,
          }}
        />
        {comment.length > 300 && (
          <span
            onClick={() => toggleShowMore(review.ID ?? 0)}
            style={{
              color: "#007BFF",
              cursor: "pointer",
              fontWeight: "bold",
              marginLeft: "5px",
            }}
          >
            Show less
          </span>
        )}
      </span>
    );
  };

  return (
    <AntModal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaStar style={{ color: "#ffc107", fontSize: "24px" }} />
          <span
            style={{
              marginLeft: "10px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "rgb(99, 94, 94)",
            }}
          >
            {totalReviews > 0
              ? `${totalReviews.toLocaleString()} Course Rating: ${averageRating} Ratings`
              : "0 Course Rating: 0 Ratings"}
          </span>
        </div>
      }
      visible={isVisible}
      onCancel={handleCancel}
      footer={null}
      className="modal-comment"
      centered
    >
      <Row gutter={16}>
        <Col span={24}>
          <div className="search-container">
            <Input
              id="searchKeyword"
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search Keyword"
              className="search-input"
              style={{ width: "600px" }}
            />
            <Button
              onClick={searchAndFilterReviews}
              type="primary"
              style={{
                marginLeft: "10px",
                marginTop: "10px",
                marginRight: "20px",
              }}
            >
              Search
            </Button>
            <Select
              className="Selector"
              id="starLevel"
              value={starLevel}
              onChange={(value) => setStarLevel(value)}
              style={{ marginTop: "10px", width: "120px" }}
            >
              <Option value="All">All</Option>
              {[5, 4, 3, 2, 1].map((star) => (
                <Option key={star} value={`${star}Star`}>
                  {star}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <div className="header-Modal">
            <AverageStar />
          </div>
        </Col>
      </Row>

      <Row gutter={16} align="top">
        <Col span={24}>
          <Card>
            <div className="review-list-container">
              {filteredReviews &&
              Array.isArray(filteredReviews) &&
              filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <div key={review.ID}>
                    <div className="review-container">
                      <Image
                        className="review-profile-img"
                        src={`http://localhost:8000/${userProfiles[review.UserID ?? 0]}` || Noprofile}
                        alt="Profile"
                        width={80}
                        height={40}
                        style={{ objectFit: "cover" }}
                      />
                      <div className="reviews-comment-text">
                        <p style={{ fontWeight: "bold" }}>
                          {userNames[review.UserID ?? 0]}
                        </p>
                        <p>
                          Rating: {renderStars(review.Rating ?? 0)}
                          <span className="date-review">
                            {formatDate(review.ReviewDate)}
                          </span>
                        </p>

                        <p className="comment-reviews-render">{renderComment(review)}</p>
                        {review.Picture ? (
                          <Image
                            src={`http://localhost:8000/${review.Picture}`}
                            alt="Review Picture"
                            width={90}
                            height={70}
                            style={{ objectFit: "cover", borderRadius: "8px" }}
                          />
                        ) : null}
                      </div>
                    </div>
                    <br />
                    <Like reviewID={review.ID ?? 0} userID={uid} />
                    <Divider />
                  </div>
                ))
              ) : (
                <center>
                  <div
                    style={{
                      color: "rgb(99, 94, 94)",
                      fontSize: "28px",
                      fontFamily: "revert-layer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <p>No Reviews for Zoo</p>
                    <img
                      src={Noprofile}
                      alt="No reviews"
                      style={{ width: "180px" }}
                    />
                  </div>
                </center>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </AntModal>
  );
};

export default Modal;