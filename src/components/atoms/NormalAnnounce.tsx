import Alert from "antd/es/alert/Alert";

function NormalAnnounce() {
  return (
    <Alert
      style={{ marginBottom: 10, width: "100%", textAlign: "left" }}
      showIcon
      type="info"
      message="서비스 업데이트 종료 안내"
      description={
        <div>
          Blue Archive Torment의 데이터 업데이트가 종료되었습니다.
          <br />
          기존 데이터는 계속 조회 가능합니다.
        </div>
      }
    />
  );
}

export default NormalAnnounce;
