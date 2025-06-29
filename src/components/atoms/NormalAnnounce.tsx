import { useQuery } from "@tanstack/react-query";
import Alert from "antd/es/alert/Alert";

function NormalAnnounce() {
  const { isPending, data, error } = useQuery<AnnouncementData, Error>({
    queryKey: ["normalAnnounce"],
    queryFn: () =>
      fetch(
        "https://raw.githubusercontent.com/BeaverHouse/service-status/refs/heads/master/assets/announce-status.json"
      ).then((res) => {
        if (res.ok) return res.json();
        else
          return {
            state: "",
            title: "",
            link: "",
            createdTime: "",
            effect: [],
            category: "",
          };
      }),
    throwOnError: true,
  });

  const announceViewed =
    window.localStorage.getItem("BA_ANNOUNCE") === data?.createdTime;

  if (
    isPending ||
    error ||
    !data.effect.includes("ba-torment") ||
    announceViewed
  )
    return null;

  const type =
    data.state === "closed"
      ? "success"
      : data.category === "maintenance"
      ? "warning"
      : "error";

  const message = () => {
    if (data.state === "closed") {
      if (data.category === "maintenance") return "점검 완료";
      else return "장애 복구 완료";
    } else {
      if (data.category === "maintenance") return "점검 안내";
      else return "장애가 발생했어요.";
    }
  };

  return (
    <Alert
      style={{ marginBottom: 10, width: "100%", textAlign: "left" }}
      showIcon
      type={type}
      message={message()}
      description={
        <div style={{ whiteSpace: "pre-line" }}>
          <a href={data.link} target="_blank" rel="noopener noreferrer">
            {data.title}
          </a>
        </div>
      }
      closable
      onClose={() => {
        if (data.state === "closed") {
          window.localStorage.setItem("BA_ANNOUNCE", String(data.createdTime));
        }
      }}
    />
  );
}

export default NormalAnnounce;
