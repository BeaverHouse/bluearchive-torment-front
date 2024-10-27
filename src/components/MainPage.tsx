import useBAStore from "../useV3Store";
import { useQuery } from "@tanstack/react-query";
import RaidSearch from "./molecules/RaidSearch";
import RaidSummary from "./molecules/RaidSummary";
import InfoFAB from "./atoms/InfoFAB";
import NormalAnnounce from "./atoms/NormalAnnounce";
import Typography from "antd/es/typography";
import Tabs, { TabsProps } from "antd/es/tabs";
import Select from "antd/es/select";
import Button from "antd/es/button";

const { Title } = Typography;

function MainPage() {
  const { V3Season, setV3Season } = useBAStore();

  const studentsQuery = useQuery({
    queryKey: ["getStudents"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/students`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
      return res.json();
    },
    throwOnError: true,
  });

  const raidsQuery = useQuery({
    queryKey: ["getRaids"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/raids`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
      return res.json();
    },
    throwOnError: true,
  });

  if (studentsQuery.isLoading || raidsQuery.isLoading) {
    return <div>로딩중...</div>;
  }

  const studentsMap = studentsQuery.data as Record<string, string>;
  const raidInfos = (raidsQuery.data as RaidInfo[]).map((raid) => ({
    value: raid.id,
    label: raid.description,
  }));

  const season = raidInfos.map((raid) => raid.value).includes(V3Season)
    ? V3Season
    : raidInfos[0].value;

  const seasonDescription = raidInfos.find(
    (raid) => raid.value === season
  )!.label;

  const items: TabsProps["items"] = [
    {
      key: "search",
      label: "파티 찾기",
      children: (
        <RaidSearch
          season={season}
          seasonDescription={seasonDescription}
          studentsMap={studentsMap}
        />
      ),
    },
    {
      key: "summary",
      label: "요약",
      children: (
        <RaidSummary
          season={season}
          seasonDescription={seasonDescription}
          studentsMap={studentsMap}
        />
      ),
    },
  ];

  return (
    <div
      className="App"
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
      <NormalAnnounce />
      <InfoFAB />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "90%",
        }}
      >
        <Select
          value={season}
          onChange={setV3Season}
          style={{ width: 270, margin: 5 }}
          options={raidInfos}
        />
        <Button
          style={{ width: 270, margin: 5 }}
          href={
            season.startsWith("3S")
              ? "https://arona.ai/eraidreport"
              : "https://arona.ai/raidreport"
          }
          target="_blank"
          type="primary"
        >
          총력전 리포트 (ARONA.AI)
        </Button>
      </div>
      <br />
      <Tabs
        defaultActiveKey="search"
        items={items}
        centered
        style={{ width: "98%", maxWidth: 1000 }}
      />
    </div>
  );
}

export default MainPage;
