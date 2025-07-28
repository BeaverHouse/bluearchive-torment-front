import React, { useState } from "react";
import VideoCameraAddOutlined from "@ant-design/icons/lib/icons/VideoCameraAddOutlined";
import Space from "antd/es/space";
import Button from "antd/es/button";
import Modal from "antd/es/modal";

interface YoutubeReportModalProps {
  data: PartyData;
  season: string;
  seasonDescription: string;
}

const YoutubeReportModal: React.FC<YoutubeReportModalProps> = () => {
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Space>
        <Button
          type="primary"
          shape="circle"
          icon={<VideoCameraAddOutlined />}
          onClick={showModal}
          style={{ marginLeft: 10 }}
        />
      </Space>
      <Modal
        open={open}
        title="서비스 안내"
        onOk={handleCancel}
        onCancel={handleCancel}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p>이제 영상 정보 업데이트를 지원하지 않아요.</p>
          <p>기존 데이터는 계속 조회할 수 있어요.</p>
        </div>
      </Modal>
    </>
  );
};

export default YoutubeReportModal;
