import InfoFAB from "./atoms/InfoFAB";
import Empty from "antd/es/empty";
import Button from "antd/es/button/button";
import Typography from "antd/es/typography";
import EmergencyAnnounce from "./atoms/EmergencyAnnounce";

const { Title } = Typography;

function ErrorPage() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 800,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        margin: "0 auto",
      }}
    >
      <Title level={3}>Blue Archive Torment </Title>
      <EmergencyAnnounce />
      <Empty
        image={<img src="error.png" alt="Error" />}
        description="에러가 발생했어요.."
        imageStyle={{ height: 200 }}
      />
      <Button
        block
        color="primary"
        variant="solid"
        href="mailto:haulrest@gmail.com"
        target="_blank"
        style={{ marginTop: 10, marginBottom: 10, width: 400 }}
      >
        오류 제보 (이메일)
      </Button>
      <InfoFAB />
    </div>
  );
}

export default ErrorPage;
