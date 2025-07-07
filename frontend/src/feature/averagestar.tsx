import { useState, useEffect } from "react"; 
import "./starbar.css"; 
import { ListReview, GetAllRatingsAvg } from "../services/https"; 
import { ReviewInterface } from "../interface/IReview"; 

const StarBar = () => {
  const [averageRatings, setAverageRatings] = useState< { rating: number; percentage: number }[] >([]); 
  const [reviews, setReviews] = useState<ReviewInterface[]>([]); 

  const getAverageRatings = async () => { 
    const avgRatings = await GetAllRatingsAvg(); 
    if (avgRatings && avgRatings.length > 0) { 
      setAverageRatings(avgRatings); 
    } else {
      setAverageRatings( 
        Array.from({ length: 5 }, (_, i) => ({ 
          rating: i + 1, 
          percentage: 0, 
        }))
      );
    }
  };

  const getReviews= async () => { 
    const res = await ListReview(); 
    if (res) { 
      setReviews(res); 
    }
  };

  useEffect(() => { 
    getReviews(); 
  }, []); 

  useEffect(() => { 
    if (reviews.length > 0) { 
      getAverageRatings(); 
    }
  }, [reviews]); 

  const getColor = (rating: number) => { 
    switch (rating) { 
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        return "gold"; 
      default:
        return "#ccc"; 
    }
  };

  const renderStars = (rating: number) => { 
    const totalStars = 5; 
    let stars = ""; 
    for (let i = 1; i <= totalStars; i++) { 
      stars += i <= rating ? "★" : "☆"; 
    }
    return stars; 
  };

  return (
    <div className="container"> 
      {averageRatings.map((ratingData) => ( 
        <div key={ratingData.rating} className="star-rating"> 
          <div className="progress-bar"> 
            <div
              className="progress-bar-fill" 
              style={{ 
                width: `${ratingData.percentage}%`,
                backgroundColor: getColor(ratingData.rating), 
              }}
            ></div>
          </div>
          <div className="stars"> 
            <div className="star-text"> 
              {renderStars(ratingData.rating)} 
            </div>
            <span className="percentage"> 
              {ratingData.percentage.toFixed(2)}% 
            </span>
          </div>
        </div>
      ))} 
    </div>
  ); 
}
export default StarBar; 
