import { useQuery } from "@tanstack/react-query";
import Alert from "antd/es/alert/Alert";

function NormalAnnounce() {
  const { isPending, data, error } = useQuery<AnnouncementData, Error>({
    queryKey: ["normalAnnounce"],
    queryFn: () =>
      fetch("https://announce.haulrest.me/api/history/latest/batorment").then(
        (res) => {
          if (res.ok) return res.json();
          else if (res.status === 404)
            return {
              announceContentCode: -1,
              koreanDescription: "",
              title: "",
            };
          else throw new Error("Failed to fetch announce");
        }
      ),
    throwOnError: true,
  });

  const announceCode = window.localStorage.getItem("BA_ANNOUNCE");

  if (isPending || error || data.announceContentCode === -1) return null;
  if (Number(announceCode) === data.announceContentCode) return null;

  return (
    <Alert
      style={{ marginBottom: 10, width: "100%", textAlign: "left" }}
      showIcon
      message={data.title}
      description={
        <div style={{ whiteSpace: "pre-line" }}>{data.koreanDescription}</div>
      }
      closable
      onClose={() => window.localStorage.setItem("BA_ANNOUNCE", String(data.announceContentCode))}
      type="info"
    />
  );
}

export default NormalAnnounce;
