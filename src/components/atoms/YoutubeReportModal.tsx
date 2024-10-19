import React, { useState } from "react";
import { Button, InputNumber, Modal, Space } from "antd";
import Input from "antd/es/input/Input";
import Swal from "sweetalert2";
import VideoCameraAddOutlined from "@ant-design/icons/lib/icons/VideoCameraAddOutlined";

interface YoutubeReportModalProps {
  data: PartyData;
  season: string;
}

const YoutubeReportModal: React.FC<YoutubeReportModalProps> = ({
  data,
  season,
}) => {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [score, setScore] = useState<number | null>();
  const [description, setDescription] = useState("");

  const showModal = () => {
    setOpen(true);
  };
  const handleOk = () => {
    if (!link || !score) {
      Swal.fire("error", "영상 링크와 점수를 입력하세요.", "error");
    } else if (score != data.SCORE) {
      Swal.fire("error", "입력한 점수가 동일하지 않아요.", "error");
    } else {
      fetch(`${import.meta.env.VITE_API_URL}/link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: data.USER_ID,
          raidId: season,
          youtubeUrl: link,
          score: score ? score : 0,
          description,
        }),
      }).then((res) => {
        if (res.ok) {
          Swal.fire("success", "영상이 등록되었어요.", "success").then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire("error", "정보를 다시 확인해 주세요.", "error");
        }
      });
    }
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
        title="Youtube 영상을 제보해 주세요"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <div>1. 영상 링크 입력</div>
        <ul>
          <li>
            브라우저에 표시되는 URL을 그대로 복사해 주세요.{" "}
            <b>(https://www.youtube.com/watch...)</b>
          </li>
          <li>
            공유 URL을 입력하셔도 됩니다. <b>(https://youtu.be/...)</b>
          </li>
        </ul>
        <div></div>
        <div></div>
        <Input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          type="url"
          placeholder="Youtube URL"
          style={{ marginBottom: 10 }}
        />
        <div>2. 첨부된 영상의 토먼트 점수를 입력해 주세요.</div>
        <InputNumber
          style={{ width: "100%", marginBottom: 10, marginTop: 5 }}
          placeholder="점수"
          status={score && score !== data.SCORE ? "error" : ""}
          value={score}
          onChange={setScore}
          min={0}
        />
        <div>3. 부연설명을 적어 주세요. (선택)</div>
        <Input
          style={{ marginTop: 5 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default YoutubeReportModal;
