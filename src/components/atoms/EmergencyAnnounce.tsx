import { useQuery } from "@tanstack/react-query";
import Alert from "antd/es/alert/Alert";

function EmergencyAnnounce() {
  const { isPending, data, error } = useQuery<AnnouncementData, Error>({
    queryKey: ["emergencyAnnounce"],
    queryFn: () =>
      fetch("https://announce.haulrest.me/api/history/latest/emergency").then(
        (res) => {
          if (res.ok) return res.json();
          else if (res.status === 404)
            return {
              announceContentCode: -1,
              koreanDescription: "",
              englishDescription: "",
              title: "",
            };
          else throw new Error("Failed to fetch announce");
        }
      ),
    throwOnError: true,
  });

  if (isPending || error || data.announceContentCode === -1) return null;

  return (
    <Alert
      style={{ marginBottom: 10, width: "100%", textAlign: "left" }}
      showIcon
      message={data.title}
      description={
        <div style={{ whiteSpace: "pre-line" }}>{data.koreanDescription}</div>
      }
      type="error"
    />
  );
}

export default EmergencyAnnounce;
