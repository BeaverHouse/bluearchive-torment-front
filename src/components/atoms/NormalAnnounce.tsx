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
          이제 더 이상 업데이트가 되지 않을 예정입니다. 기존 데이터는 계속 조회
          가능합니다.
          <br />
          자세한 내용은{" "}
          <a
            href="https://github.com/BeaverHouse/bluearchive-torment-front?tab=readme-ov-file#end-of-service"
            target="_blank"
          >
            링크
          </a>
          를 참고해 주세요.
        </div>
      }
    />
  );
}

export default NormalAnnounce;
