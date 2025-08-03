import Alert from "antd/es/alert/Alert";

function NormalAnnounce() {
  return (
    <Alert
      style={{ marginBottom: 10, width: "100%", textAlign: "left" }}
      showIcon
      type="warning"
      message="임시 데이터 업데이트 (S79 실내 고즈)"
      description={
        <div>
          아직 자동화 방법과 지속 가능성을 판단하는 중입니다.
        </div>
      }
    />
  );
}

export default NormalAnnounce;
