import React, { useState } from "react";
import { Button, FloatButton, Modal, Space } from "antd";
import InfoCircleOutlined from "@ant-design/icons/lib/icons/InfoCircleOutlined";
import BuyMeACoffeeButton from "./Coffee";

const InfoFAB: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <FloatButton.Group shape="circle">
        <FloatButton.BackTop visibilityHeight={0} target={() => document.body} />
        <FloatButton
          type="primary"
          icon={<InfoCircleOutlined />}
          onClick={showModal}
        />
      </FloatButton.Group>
      <Modal
        title="BA Torment"
        centered
        open={isModalOpen}
        onCancel={handleCancel}
        okButtonProps={{ style: { display: "none" } }}
      >
        <p>Blue Archive copyrighted by NEXON GAMES & YOSTAR</p>
        <p>2023-2024, powered by Austin</p>

        <Button
          block
          color="default"
          variant="filled"
          href="https://schaledb.com/"
          target="_blank"
        >
          Schale DB
        </Button>
        <Button
          block
          color="default"
          variant="filled"
          href="https://arona.ai"
          target="_blank"
          style={{ marginTop: 10, marginBottom: 30 }}
        >
          ARONA.AI
        </Button>

        <Button
          block
          color="primary"
          variant="filled"
          href="https://github.com/BeaverHouse/bluearchive-torment-front"
          target="_blank"
        >
          GitHub
        </Button>
        <Button
          block
          color="primary"
          variant="solid"
          href="mailto:haulrest@gmail.com"
          target="_blank"
          style={{ marginTop: 10, marginBottom: 10 }}
        >
          오류 제보 (이메일)
        </Button>
        <Space
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "10px auto",
          }}
        >
          <BuyMeACoffeeButton />
        </Space>
      </Modal>
    </>
  );
};

export default InfoFAB;
