import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useBAStore from "../../useV3Store";
import { filteredPartys, getFilters } from "../function";
import PartyCard from "./PartyCard";
import Typography from "antd/es/typography";
import Button from "antd/es/button";
import Slider from "antd/es/slider";
import Cascader from "antd/es/cascader";
import Select from "antd/es/select";
import Checkbox from "antd/es/checkbox";
import Collapse from "antd/es/collapse";
import Pagination from "antd/es/pagination";
import Empty from "antd/es/empty";
import Spin from "antd/es/spin";
import { lunaticMinScore, tormentMinScore } from "../constants";

const { Text } = Typography;

const RaidSearch = ({
  season,
  studentsMap,
  seasonDescription,
}: RaidConmponentProps) => {
  const [PartyCountRange, setPartyCountRange] = useState([0, 99]);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);

  const {
    LevelList,
    IncludeList,
    ExcludeList,
    Assist,
    HardExclude,
    AllowDuplicate,
    YoutubeOnly,
    setLevelList,
    setIncludeList,
    setExcludeList,
    setAssist,
    setHardExclude,
    setAllowDuplicate,
    setYoutubeOnly,
    removeFilters,
  } = useBAStore();

  useEffect(() => {
    setPage(1);
  }, [
    LevelList,
    IncludeList,
    ExcludeList,
    Assist,
    PartyCountRange,
    PageSize,
    HardExclude,
    AllowDuplicate,
    YoutubeOnly,
    season,
  ]);

  const getPartyDataQuery = useQuery({
    queryKey: ["getPartyData", season],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_CDN_URL}/o/batorment/v2/party/${season}.json`
      );
      return res.json();
    },
    throwOnError: true,
  });

  const getLinksQuery = useQuery({
    queryKey: ["getLinks", season],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/links/${season}`,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return res.json();
    },
    throwOnError: true,
  });

  if (getPartyDataQuery.isLoading || getLinksQuery.isLoading)
    return <Spin spinning={true} fullscreen />;

  const data = getPartyDataQuery.data as RaidData;
  const youtubeLinkInfos: YoutubeLinkInfo[] = getLinksQuery.data;

  const topScore = data.parties[0].SCORE;
  const levelCategoryCount =
    topScore > lunaticMinScore ? 3 : topScore > tormentMinScore ? 2 : 1;

  const levelOptions = [
    {
      value: "I",
      label: "Insane",
    },
    {
      value: "T",
      label: "Torment",
    },
    {
      value: "L",
      label: "Lunatic",
    },
  ].slice(0, levelCategoryCount);

  const confirmReset = () => {
    const confirm = window.confirm("모든 캐릭터 필터가 리셋됩니다.");
    if (confirm) removeFilters();
  };

  const filter = (inputValue: string, path: Option[]) =>
    path.some(
      (option: Option) =>
        option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );

  const FilterComponent = () => {
    return (
      <>
        <Button
          style={{ width: 240, margin: 5, marginBottom: 20 }}
          onClick={confirmReset}
          danger={true}
        >
          필터 Reset
        </Button>
        <br />
        {/* 난이도 Filter */}
        <Text style={{ marginRight: 10 }}>난이도</Text>
        <Checkbox.Group
          value={LevelList}
          onChange={setLevelList}
          options={levelOptions}
        />

        {/* 파티 수 Filter */}
        <div
          style={{
            width: "98%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "0 auto",
            marginBottom: 10,
          }}
        >
          <Text strong style={{ marginRight: 10 }}>
            {Math.max(PartyCountRange[0], data.min_partys)}파티
          </Text>
          <Slider
            range
            style={{ flex: 1 }}
            max={data.max_partys}
            min={data.min_partys}
            onChange={setPartyCountRange}
            value={PartyCountRange}
          />
          <Text strong style={{ marginLeft: 10 }}>
            {Math.min(PartyCountRange[1], data.max_partys)}파티
          </Text>
        </div>
        {/* 포함 캐릭터 Filter */}
        <Text>
          포함할 <b>내 캐릭터</b>
        </Text>
        <div
          style={{
            width: "100%",
            minHeight: 32,
            marginBottom: 15,
            display: "flex",
          }}
        >
          <Cascader
            multiple
            changeOnSelect
            dropdownRender={(menu) => (
              <div>
                {menu}
                <div style={{ padding: "4px 8px" }}>
                  <sup>
                    <br />※ 성급 관계없이 보고 싶다면 왼쪽 체크박스를
                    사용하세요.
                  </sup>
                </div>
              </div>
            )}
            placeholder="캐릭터를 선택하세요"
            showSearch={{ filter }}
            value={IncludeList}
            style={{ width: "100%" }}
            onChange={setIncludeList}
            options={getFilters(data.filters, studentsMap)}
          />
        </div>
        {/* 제외 캐릭터 Filter */}
        <Text>
          제외할 <b>내 캐릭터</b>
        </Text>
        <div style={{ width: "100%", minHeight: 32, display: "flex" }}>
          <Select
            mode="tags"
            placeholder="제외할 캐릭터를 선택하세요"
            value={ExcludeList}
            allowClear={true}
            onChange={setExcludeList}
            optionFilterProp="label"
            style={{ width: "100%" }}
            options={Object.keys(data.filters).map((key) => ({
              value: Number(key),
              label: studentsMap[key],
            }))}
          />
        </div>
        <Checkbox
          style={{ margin: 2, marginBottom: 15 }}
          onChange={(e) => setHardExclude(e.target.checked)}
          checked={HardExclude}
          value={HardExclude}
        >
          조력자에서도 제외
        </Checkbox>
        <br />
        {/* 조력자 Filter */}
        <Text style={{ marginTop: 20 }}>조력자</Text>
        <Cascader
          allowClear={true}
          placeholder="조력자를 선택하세요"
          defaultValue={Assist}
          value={Assist}
          onChange={setAssist}
          showSearch={{ filter }}
          style={{ width: "100%", height: 32 }}
          displayRender={(label) => label[1]}
          options={getFilters(data.assist_filters, studentsMap)}
        />
        <Checkbox
          style={{ margin: 2 }}
          onChange={(e) => setAllowDuplicate(e.target.checked)}
          checked={AllowDuplicate}
          value={AllowDuplicate}
        >
          조력자 포함 중복 허용
        </Checkbox>
        <br />
        <Checkbox
          style={{ margin: 2 }}
          onChange={(e) => setYoutubeOnly(e.target.checked)}
          checked={YoutubeOnly}
          value={YoutubeOnly}
        >
          Youtube 링크 (beta)
        </Checkbox>
      </>
    );
  };

  const parties = filteredPartys(
    data,
    youtubeLinkInfos,
    LevelList,
    IncludeList,
    ExcludeList,
    Assist,
    PartyCountRange,
    HardExclude,
    AllowDuplicate,
    YoutubeOnly
  );

  return (
    <>
      <Collapse
        size="small"
        style={{
          margin: "0 auto",
          marginBottom: 20,
          width: "100%",
          maxWidth: 600,
        }}
        defaultActiveKey={["1"]}
        items={[
          {
            key: "1",
            label: "파티 Filter",
            children: FilterComponent(),
          },
        ]}
      />
      <Pagination
        total={parties.length}
        align="center"
        current={Page}
        onChange={setPage}
        pageSize={PageSize}
        simple
        onShowSizeChange={(_, size) => setPageSize(size)}
        pageSizeOptions={[10, 20]}
      />
      <div
        style={{
          width: "100%",
          minWidth: 345,
          margin: "0 auto",
          marginTop: 20,
          overflowX: "auto",
        }}
      >
        {parties.length > 0 ? (
          parties
            .filter(
              (_, idx) => idx >= (Page - 1) * PageSize && idx < Page * PageSize
            )
            .map((party, idx) => (
              <PartyCard
                key={idx}
                data={party}
                season={season}
                seasonDescription={seasonDescription}
                studentsMap={studentsMap}
                linkInfos={youtubeLinkInfos.filter(
                  (link) => link.userId === party.USER_ID
                )}
              />
            ))
        ) : (
          <Empty
            image={<img src="empty.webp" alt="Empty" />}
            imageStyle={{ height: 200 }}
            description="검색 결과가 없어요."
          />
        )}
      </div>
    </>
  );
};

export default RaidSearch;
