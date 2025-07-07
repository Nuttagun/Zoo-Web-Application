import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Upload } from "antd";
import ReactDOM from "react-dom";
import { ReviewInterface } from "../../../interface/IReview";
import { UpdateReview, GetReviewsByID } from "../../../services/https/index";
import { useNavigate } from "react-router-dom";
import StarRating from "../../../feature/star";
import "../create/review-create.css";
import { PlusOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import type { UploadFile, UploadProps } from "antd";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  UserID: number;
  reviewId: number;
}

const ModalEdit: React.FC<ModalProps> = ({ open, onClose, reviewId }) => {
  if (!open) return null;

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [reviews, setReviews] = useState<ReviewInterface>();
  console.log(reviews);

  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as File);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const onFinish = async (values: ReviewInterface) => {
    if (rating === undefined || rating < 1 || rating > 5) {
      messageApi.open({
        type: "warning",
        content: "กรุณาให้คะแนนรีวิว!",
      });
      return;
    }

    if (values.Comment === undefined) {
      messageApi.open({
        type: 'warning',
        content: 'กรุณากรอกข้อความรีวิวให้ถูกต้อง',
      });
      return;
    }

    const trimmedComment = values.Comment.trim();
    if (trimmedComment.length === 0) {
      messageApi.open({
        type: "warning",
        content: "กรุณากรอกข้อความรีวิวให้ถูกต้อง",
      });
      return;
    }

    if (!values.Comment || values.Comment.length > 500) {
      messageApi.open({
        type: "warning",
        content: "กรุณาเขียนรีวิวไม่เกิน 500 ตัวอักษร",
      });
      return;
    }

    values.Rating = rating;

    const isRemovePicture = fileList.length === 0;
    values.isRemovePicture = isRemovePicture;

    const profileImage = fileList[0]?.originFileObj as File | undefined;

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

    if (profileImage && !validImageTypes.includes(profileImage.type)) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณาอัพโหลดเฉพาะไฟล์รูปภาพ");
      return;
    }

    setLoading(true);
    try {
      const res = await UpdateReview(reviewId, values, profileImage);
      if (res) {
        messageApi.open({
          type: "success",
          content: "แก้ไขรีวิวสำเร็จ",
        });
        setTimeout(() => {
          onClose();
          navigate("/user/myticket");
        }, 5000);
      } else {
        messageApi.open({
          type: "error",
          content: "แก้ไขรีวิวไม่สำเร็จ!",
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาด!",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const GetReviewById = async () => {
      const res = await GetReviewsByID(reviewId);
      if (res) {
        setReviews(res);
        form.setFieldsValue({
          Rating: res.Rating,
          Comment: res.Comment,
        });
        setRating(res.Rating);
        if (res.Picture) {
          setFileList([
            {
              uid: "-1",
              name: "profile.png",
              status: "done",
              url: `http://localhost:8000/${res.Picture}`,
            },
          ]);
        }
      }
    };
    GetReviewById();
  }, [reviewId, form]);

  return ReactDOM.createPortal(
    <>
      {contextHolder}
      <div className="overlay" />
      <div className="modal">
        <div>
          <p className="header-reviewszoo">Edit Review</p>
          <Form
            form={form}
            name="reviewForm"
            onFinish={onFinish}
            layout="vertical"
          >
            <br />
            <Form.Item label="Picture" name="Profile" valuePropName="fileList">
              <ImgCrop rotationSlider>
                <Upload
                  fileList={fileList}
                  onChange={onChange}
                  onPreview={onPreview}
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith("image/");
                    const isLt2M = file.size / 1024 / 1024 < 2;

                    if (!isImage) {
                      message.error("กรุณาอัปโหลดไฟล์รูปภาพที่ถูกต้อง");
                      return Upload.LIST_IGNORE;
                    }

                    if (!isLt2M) {
                      message.error("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 2MB");
                      return Upload.LIST_IGNORE;
                    }

                    setFileList([file]);
                    return false;
                  }}
                  maxCount={1}
                  multiple={false}
                  listType="picture-card"
                >
                  {fileList.length < 1 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </ImgCrop>
            </Form.Item>

            <Form.Item>
              <StarRating rating={rating ?? 0} onRatingChange={setRating} />
            </Form.Item>

            <Form.Item
              label="Review"
              name="Comment"
              rules={[
                { required: true, message: "Please enter your review!" },
                {
                  min: 1,
                  max: 499,
                  message: "Your review must be between 1 and 500 characters!",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                style={{ width: "400px" }}
                maxLength={500}
              />
            </Form.Item>

            <Form.Item className="box-button-reviews">
              <Button type="default" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: "8px" }}
                loading={loading}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ModalEdit;
