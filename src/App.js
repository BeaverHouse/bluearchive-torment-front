import { Select, Spin, Button, Typography } from "antd";
import {
  announceHTML,
  announceUpdate,
  legacyTorments,
  tabItems,
} from "./constant";
import { useCallback, useEffect, useState } from "react";
import useBAStore from "./useStore";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PageContent from "./components/PageContent";
import PageContentV2 from "./components/PageContentV2";
// import useV2BAStore from "./useV2Store";

const AnnounceInfo = withReactContent(Swal);
const { Title } = Typography;

function App() {
  const { Season, setSeason } = useBAStore();
  // const { SeasonV2, setSeasonV2 } = useV2BAStore();

  const [Loading, setLoading] = useState(false);
  const [Data, setData] = useState(null);

  const changeSeason = useCallback(
    (season) => {
      setLoading(true);
      setData(null);
      const key = tabItems.map((t) => t.value).includes(season)
        ? season
        : tabItems[0].value;
      try {
        const json = require(`./data/${key}.json`);
        setData(json);
        setSeason(key);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    },
    [setSeason]
  );

  useEffect(() => {
    const checkDay = window.localStorage.getItem("BA_INFO");
    if (checkDay !== announceUpdate) {
      // if(true) {
      AnnounceInfo.fire({
        title: announceUpdate + " Update",
        html: announceHTML,
        icon: "info",
      }).then(() => {
        window.localStorage.setItem("BA_INFO", announceUpdate);
      });
    }
  }, []);

  useEffect(() => {
    changeSeason(Season);
  }, [Season, changeSeason]);

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
      <Title level={3}>Blue Archive Torment</Title>

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
          value={Season}
          onChange={changeSeason}
          style={{ width: 270, margin: 5 }}
          options={tabItems}
        />
        <Button
          style={{ width: 270, margin: 5 }}
          href="https://arona.ai/raidreport"
          target="_blank"
          type="primary"
        >
          같이 보면 좋은 총력전 리포트 (Link)
        </Button>
      </div>
      <br />
      {!Loading && Data ? (
        legacyTorments.includes(Season) ? (
          <PageContent Data={Data} />
        ) : (
          <PageContentV2 Data={Data} />
        )
      ) : (
        <Spin />
      )}
    </div>
  );
}

export default App;
