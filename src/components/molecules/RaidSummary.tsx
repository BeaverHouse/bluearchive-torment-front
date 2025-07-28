import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  basePartyCounts,
  categoryLabels,
  lunaticMinScore,
  translations,
} from "../constants";
import Swal from "sweetalert2";
import Typography from "antd/es/typography";
import Table, { TableProps } from "antd/es/table";
import Input from "antd/es/input";
import Card from "antd/es/card";
import Col from "antd/es/col";
import Row from "antd/es/row";
import Select from "antd/es/select";
import Spin from "antd/es/spin";
import Empty from "antd/es/empty";

const { Text, Title } = Typography;

const strikerStyle: React.CSSProperties = {
  backgroundColor: "#ffffeb",
  width: "17%",
  textAlign: "center",
  padding: "2px",
};
const specialStyle: React.CSSProperties = {
  ...strikerStyle,
  width: "16%",
  backgroundColor: "#f0fbff",
};

const RaidSummary = ({
  season,
  seasonDescription,
  studentsMap,
  level,
}: RaidConmponentProps) => {
  const [Character, setCharacter] = useState<number | null>(null);

  const getSummaryDataQuery = useQuery({
    queryKey: ["getSummaryData", season],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_CDN_URL}/o/batorment/v2/summary/${season}.json`
      );
      return res.json();
    },
    throwOnError: true,
  });

  const getLinksQuery = useQuery({
    queryKey: ["getLinks", season],
    queryFn: async () => {
      try {
        const linksModule = await import(`../../data/links/${season}.json`);
        return linksModule.default;
      } catch {
        return [];
      }
    },
    throwOnError: false,
  });


  useEffect(() => {
    setCharacter(null);
  }, [season]);

  const keywords = Object.keys(translations)
    .filter((key) => seasonDescription.includes(key))
    .map((key) => translations[key]);

  if (getSummaryDataQuery.isLoading || getLinksQuery.isLoading)
    return <Spin spinning={true} fullscreen />;

  const tormentData = getSummaryDataQuery.data.torment as RaidSummaryData;
  const lunaticData = getSummaryDataQuery.data.lunatic as RaidSummaryData;
  const data = level === "L" ? lunaticData : tormentData;

  if (data.clear_count === 0) {
    return (
      <Empty
        image={<img src="empty.webp" alt="Empty" />}
        imageStyle={{ height: 200 }}
        description="클리어 데이터가 없어요."
      />
    );
  }

  const searchKeyword = (
    keywords.join(" ") +
    " " +
    (level === "T" ? "TORMENT" : level === "L" ? "LUNATIC" : "")
  ).trim();

  const youtubeLinkInfos: YoutubeLinkInfo[] = (
    (getLinksQuery.data || []) as YoutubeLinkInfo[]
  ).filter((link) =>
    level === "L"
      ? link.score >= lunaticMinScore
      : link.score > 0 && link.score < lunaticMinScore
  );

  const CharIcon = (char_code: number) => {
    if (char_code === 0) return;
    const name = studentsMap[char_code];
    return (
      <>
        <img
          src={`${
            import.meta.env.VITE_CDN_URL
          }/o/batorment/character/${char_code}.webp`}
          alt={name}
          width={40}
          style={{ border: "3px solid transparent" }}
        />
        <br />
        <Text strong>{name}</Text>
      </>
    );
  };

  const strikerData: CharTableType[] = Object.entries(data.filters)
    .filter(([key, _]) => key.startsWith("1"))
    .sort(
      (a, b) =>
        b[1].reduce((sum, cur) => sum + cur, 0) -
        a[1].reduce((sum, cur) => sum + cur, 0)
    )
    .map(([key, value], idx) => ({
      key: (idx + 1).toString(),
      name: studentsMap[key],
      percent: Number(
        (
          (value.reduce((sum, cur) => sum + cur, 0) / data.clear_count) *
          100
        ).toFixed(2)
      ),
    }));

  const specialData: CharTableType[] = Object.entries(data.filters)
    .filter(([key, _]) => key.startsWith("2"))
    .sort(
      (a, b) =>
        b[1].reduce((sum, cur) => sum + cur, 0) -
        a[1].reduce((sum, cur) => sum + cur, 0)
    )
    .map(([key, value], idx) => ({
      key: (idx + 1).toString(),
      name: studentsMap[key],
      percent: Number(
        (
          (value.reduce((sum, cur) => sum + cur, 0) / data.clear_count) *
          100
        ).toFixed(2)
      ),
    }));

  const assistData: CharTableType[] = Object.entries(data.assist_filters)
    .sort(
      (a, b) =>
        b[1].reduce((sum, cur) => sum + cur, 0) -
        a[1].reduce((sum, cur) => sum + cur, 0)
    )
    .map(([key, value], idx) => ({
      key: (idx + 1).toString(),
      name: studentsMap[key],
      percent: Number(
        (
          (value.reduce((sum, cur) => sum + cur, 0) / data.clear_count) *
          100
        ).toFixed(2)
      ),
    }));

  const charColumns: TableProps<CharTableType>["columns"] = [
    {
      title: "이름",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "사용률 (%)",
      dataIndex: "percent",
      key: "percent",
      render: (_, record) => {
        if (record.percent > 90)
          return <b style={{ color: "red" }}>{record.percent}%</b>;
        else if (record.percent > 20)
          return <b style={{ color: "purple" }}>{record.percent}%</b>;
        else return <div>{record.percent}%</div>;
      },
    },
  ];

  const partyColumns: TableProps<PartyTableType>["columns"] = [
    {
      title: null,
      dataIndex: "key",
      key: "key",
    },
    {
      title: "1파티",
      dataIndex: "one",
      key: "one",
      render: (_, record) => {
        if (record.one > 20)
          return <b style={{ color: "red" }}>{record.one}%</b>;
        else return <div>{record.one}%</div>;
      },
    },
    {
      title: "2파티",
      dataIndex: "two",
      key: "two",
      render: (_, record) => {
        if (record.two > 20)
          return <b style={{ color: "red" }}>{record.two}%</b>;
        else return <div>{record.two}%</div>;
      },
    },
    {
      title: "3파티",
      dataIndex: "three",
      key: "three",
      render: (_, record) => {
        if (record.three > 20)
          return <b style={{ color: "red" }}>{record.three}%</b>;
        else return <div>{record.three}%</div>;
      },
    },
    {
      title: "4파티 이상",
      dataIndex: "fourOrMore",
      key: "fourOrMore",
      render: (_, record) => {
        if (record.fourOrMore > 20)
          return <b style={{ color: "red" }}>{record.fourOrMore}%</b>;
        else return <div>{record.fourOrMore}%</div>;
      },
    },
  ];

  const partyCountData: PartyTableType[] = [
    ...[...basePartyCounts, data.clear_count].filter(
      (count) => count <= data.clear_count && `in${count}` in data.party_counts
    ),
  ].map((count) => {
    const key = `in${count}`;
    return {
      key: `in ${count}`,
      one: Number(((data.party_counts[key][0] / count) * 100).toFixed(2)),
      two: Number(((data.party_counts[key][1] / count) * 100).toFixed(2)),
      three: Number(((data.party_counts[key][2] / count) * 100).toFixed(2)),
      fourOrMore: Number(
        ((data.party_counts[key][3] / count) * 100).toFixed(2)
      ),
    };
  });

  const tormentClearPercent = Number(tormentData.clear_count / 20000) * 100;
  const lunaticClearPercent = Number(lunaticData.clear_count / 20000) * 100;
  const clearPercent =
    level === "T"
      ? tormentClearPercent + lunaticClearPercent
      : lunaticClearPercent;

  return (
    <>
      검색어 (클릭하면 복사됩니다)
      <br />
      <Input
        style={{ width: 300, margin: 5 }}
        variant="filled"
        onClick={() => {
          window.navigator.clipboard.writeText(searchKeyword);
          Swal.fire("복사되었습니다!");
        }}
        value={searchKeyword}
      />
      {level !== "I" && (
        <Title level={4} style={{ color: clearPercent > 50 ? "red" : "" }}>
          Platinum 클리어 비율: {data.clear_count} (
          {(level === "T" ? tormentClearPercent : lunaticClearPercent).toFixed(
            2
          )}
          %)
          <br />
          {level === "T" &&
            lunaticData.clear_count > 0 &&
            `(루나틱: ${lunaticClearPercent.toFixed(
              2
            )}%, 총합 ${clearPercent.toFixed(2)}%)`}
        </Title>
      )}
      <Title level={4}>Top 5 파티</Title>
      <Text strong>※ 전용무기와 배치는 고려하지 않았습니다.</Text>
      <div
        style={{
          width: "100%",
          minWidth: 345,
          margin: "0 auto",
          marginTop: 20,
          overflowX: "auto",
        }}
      >
        {data.top5_partys.map(([party_string, count], idx) => (
          <Card
            title={`${idx + 1}위: ${count}명 사용`}
            key={idx}
            size="small"
            style={{ margin: 5 }}
          >
            {party_string
              .split("_")
              .map(Number)
              .flat()
              .map((party, idx) => {
                return (
                  <Card.Grid
                    key={idx}
                    style={idx % 6 < 4 ? strikerStyle : specialStyle}
                    hoverable={false}
                  >
                    {CharIcon(party)}
                  </Card.Grid>
                );
              })}
          </Card>
        ))}
      </div>
      <Title level={4}>파티 비율</Title>
      <Table<PartyTableType>
        columns={partyColumns}
        dataSource={partyCountData}
        pagination={false}
        size="small"
      />
      <Title level={4}>캐릭터 사용률</Title>
      <Text strong>※ 1% 이상만 표시됩니다.</Text>
      <Row>
        <Col xs={24} sm={12} md={8}>
          <Table<CharTableType>
            columns={charColumns}
            dataSource={strikerData}
            title={() => <b>STRIKER</b>}
            scroll={{ y: 400 }}
            pagination={false}
            size="small"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Table<CharTableType>
            columns={charColumns}
            dataSource={specialData}
            title={() => <b>SPECIAL</b>}
            scroll={{ y: 400 }}
            pagination={false}
            size="small"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Table<CharTableType>
            columns={charColumns}
            dataSource={assistData}
            title={() => <b>조력자</b>}
            scroll={{ y: 400 }}
            pagination={false}
            size="small"
          />
        </Col>
      </Row>
      <Title level={4}>캐릭터 성장 통계</Title>
      <Text strong>※ 1% 이상만 표시됩니다.</Text>
      <br />
      <Select
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        placeholder="캐릭터를 선택하세요"
        value={Character}
        onChange={setCharacter}
        style={{ width: "100%", maxWidth: 300 }}
        options={Object.keys(data.filters).map((key) => ({
          value: key,
          label: studentsMap[key],
        }))}
      />
      {Character !== null && data.filters[Character] && (
        <Card size="small" style={{ margin: 5 }}>
          {data.filters[Character].slice(1).map((count, idx) => {
            const sum = data.filters[Character].reduce(
              (sum, cur) => sum + cur,
              0
            );
            const percent = (count / sum) * 100;
            const color = percent > 20 ? "red" : "black";
            return (
              <Card.Grid
                style={{ width: "25%", padding: 5, color }}
                key={idx}
                hoverable={false}
              >
                <b style={{ fontSize: 20 }}>{categoryLabels[idx + 1]}</b>
                <br />
                <b style={{ fontSize: 16 }}>
                  {count} ({((count / sum) * 100).toFixed(2)}%)
                </b>
              </Card.Grid>
            );
          })}
        </Card>
      )}
      <Title level={4}>공략 영상</Title>
      <Text strong>※ 최대 10개까지 표시됩니다.</Text>
      {youtubeLinkInfos.slice(0, 10).map((linkInfo, idx) => (
        <div className="video-responsive" key={idx}>
          <iframe
            width="853"
            height="480"
            src={linkInfo.youtubeUrl}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded youtube"
          />
        </div>
      ))}
    </>
  );
};

export default RaidSummary;
