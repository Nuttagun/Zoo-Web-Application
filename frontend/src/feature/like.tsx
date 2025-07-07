import React, { useState, useEffect } from 'react'; 
import { onLikeButtonClick, fetchLikeStatus, onUnlikeButtonClick } from '../services/https'; 
import "./feature.css"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faHeart } from '@fortawesome/free-solid-svg-icons'; 

interface LikeProps { 
    reviewID: number; 
    userID: number; 
}

const Like: React.FC<LikeProps> = ({ reviewID, userID }) => { 
    const [hasLiked, setHasLiked] = useState<boolean>(false); 
    const [likeCount, setLikeCount] = useState<number>(0); 

    useEffect(() => { 
        const fetchData = async () => { 
            try {
                const status = await fetchLikeStatus(reviewID, userID); 
                if (status) { 
                    setHasLiked(status.hasLiked); 
                    setLikeCount(status.likeCount); 
                }
            } catch (error) { 
                console.error('ข้อผิดพลาดในการดึงข้อมูลสถานะไลค์:', error); 
            }
        };

        fetchData(); 
    }, [reviewID, userID]); 

    const handleLikeIconClick = async () => { 
        try {
            const response = hasLiked ? await onUnlikeButtonClick(reviewID, userID) : await onLikeButtonClick(reviewID, userID); 
            if (response) { 
                const updatedStatus = await fetchLikeStatus(reviewID, userID); 
                if (updatedStatus) { 
                    setHasLiked(updatedStatus.hasLiked); 
                    setLikeCount(updatedStatus.likeCount); 
                }
            }
        } catch (error) { 
            console.error('ข้อผิดพลาดในการจัดการคลิกไอคอนไลค์:', error); 
        }
    };

    return ( 
        <div className='box-thumup-like'> 
            {hasLiked ? ( 
                <span className='thank'>Thank you for your feedback</span> 
            ) : (
                <span className='hekpful'>Was this review helpful?</span>
            )}
            <div className="icon-and-count"> 
                <FontAwesomeIcon 
                    icon={faHeart} 
                    size="2x" 
                    color={hasLiked ? '#ec4a4a' : 'gray'} 
                    onClick={handleLikeIconClick} 
                    style={{ cursor: 'pointer' }} 
                />
                <span>{likeCount}</span> 
            </div>
        </div>
    ); 
};

export default Like; 
