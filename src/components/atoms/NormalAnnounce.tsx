import Alert from "antd/es/alert/Alert";

function NormalAnnounce() {
  return (
    <Alert
      style={{ marginBottom: 10, width: "100%", textAlign: "left" }}
      showIcon
      type="info"
      message="임시 데이터 업데이트"
      description={
        <div>
          데이터 획득 + 자동화 방법을 찾았고, 카이텐 대결전까지 최신 업데이트가 된 상태입니다.
          <br />
          다만, 재정비와 검토가 여전히 필요하다고 판단되어 약간의 시간을 가지려고 합니다.
          <br />
          데이터 소스에 대해서는 <a href="https://github.com/BeaverHouse/ba-torment-data-process/discussions/10" target="_blank">이곳</a>을 참고해 주세요.
          <br />
          필요하다면 따로 공지를 남기도록 하겠습니다. 감사합니다.
        </div>
      }
    />
  );
}

export default NormalAnnounce;
