import React from "react";
import { Form, Input, Button, message, Upload } from "antd";
import ReactDOM from "react-dom";
import { ReviewInterface } from "../../../interface/IReview";
import { CreateReview } from "../../../services/https";
import { useNavigate } from "react-router-dom";
import StarRating from "../../../feature/star";
import "../review.css";
import { PlusOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import type { UploadFile, UploadProps } from "antd";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  UserID: number;
  onReviewCreated: (reviewId: number) => void;
}

const ModalCreate: React.FC<ModalProps> = ({
  open,
  onClose,
  UserID,
  onReviewCreated,
}) => {
  if (!open) return null;

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = React.useState(false);
  const [rating, setRating] = React.useState<number | undefined>(undefined);
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

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
        content: "กรุณาให้คะแนนสวนสัตว์",
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

    const formData = new FormData();
    formData.append("rating", rating.toString());
    formData.append("userID", UserID.toString());
    formData.append("comment", values.Comment || "");

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("imageproduct", fileList[0].originFileObj as File);
    }

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const isValidImages = fileList.every(
      (file) => file.type && validImageTypes.includes(file.type)
    );

    if (!isValidImages) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณาอัพโหลดเฉพาะไฟล์รูปภาพ");
      return;
    }

    setLoading(true);
    try {
      const res = await CreateReview(formData);
      if (res) {
        messageApi.open({
          type: "success",
          content: "การรีวิวสำเร็จ",
          duration: 5,
        });
        setTimeout(() => {
          onClose();
          onReviewCreated(res.id);
          console.log(res.id);
          navigate("/user/myticket");
        }, 5000);
      } else {
        messageApi.open({
          type: "error",
          content: "การรีวิวไม่สำเร็จ",
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "An error occurred!",
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = () => {
    message.warning("กรุณากรอกข้อมูลรีวิวให้ถูกต้อง");
  };

  return ReactDOM.createPortal(
    <>
      {contextHolder}
      <div className="overlay" />
      <div className="modal">
        <div>
          <p className="header-reviewszoo">Review Zoo</p>
          <Form
            form={form}
            name="reviewForm"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
          >
            <br />
            <Form.Item label="Picture" name="Profile" valuePropName="fileList">
              <ImgCrop>
                <Upload
                  fileList={fileList}
                  onChange={onChange}
                  onPreview={onPreview}
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith("image/");
                    if (!isImage) {
                      message.warning("กรุณาอัปโหลดไฟล์รูปภาพ");
                      return Upload.LIST_IGNORE;
                    }
                    setFileList([...fileList, file]);
                    return false;
                  }}
                  maxCount={1}
                  multiple={false}
                  listType="picture-card"
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </ImgCrop>
            </Form.Item>

            <Form.Item>
              <StarRating rating={rating ?? 0} onRatingChange={setRating} />
            </Form.Item>

            <Form.Item
              name="Comment"
              label="Review"
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

export default ModalCreate;
