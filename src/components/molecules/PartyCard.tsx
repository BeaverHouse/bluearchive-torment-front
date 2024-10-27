import React from "react";
import { categoryLabels } from "../constants";
import YoutubeReportModal from "../atoms/YoutubeReportModal";
import YoutubeOutlined from "@ant-design/icons/lib/icons/YoutubeOutlined";
import Typography from "antd/es/typography";
import Button from "antd/es/button";
import Tooltip from "antd/es/tooltip";
import Collapse from "antd/es/collapse";
import Card from "antd/es/card";

const { Text } = Typography;

interface PartyCardProps {
  data: PartyData;
  season: string;
  studentsMap: Record<string, string>;
  seasonDescription: string;
  linkInfos: YoutubeLinkInfo[];
}

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

const PartyCard: React.FC<PartyCardProps> = ({
  data,
  studentsMap,
  seasonDescription,
  linkInfos,
  season,
}) => {
  const partys = Object.values(data.PARTY_DATA);

  const title = (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {data.TORMENT_RANK}위: {data.SCORE}점
      {data.FINAL_RANK !== data.TORMENT_RANK
        ? ` (최종 ${data.FINAL_RANK}위)`
        : ""}
      {linkInfos.length > 0 && (
        <Button
          type="primary"
          danger
          style={{ marginLeft: 10 }}
          icon={<YoutubeOutlined />}
          href={linkInfos[0].youtubeUrl}
          target="_blank"
        >
          {linkInfos[0].score > 0 ? "영상" : "채널"}
        </Button>
      )}
      {(linkInfos.length <= 0 || linkInfos[0].score === 0) && (
        <YoutubeReportModal data={data} season={season} seasonDescription={seasonDescription} />
      )}
    </div>
  );

  const CharIcon = (char: number) => {
    if (char === 0) return;
    const code = Math.floor(char / 1000);
    const star = Math.floor((char % 1000) / 100);
    const weapon = Math.floor((char % 100) / 10);
    const assist = char % 10;
    const name = studentsMap[code];
    return (
      <Tooltip title={assist ? `${name} (A)` : name}>
        <img
          src={`${
            import.meta.env.VITE_CDN_URL
          }/o/batorment/character/${code}.webp`}
          alt={name}
          width={40}
          style={{
            border: assist ? "3px solid #4CBB17" : "3px solid transparent",
          }}
        />
        <br />
        <Text
          style={{
            color: assist ? "#008000" : "black",
            fontWeight: assist ? "bold" : undefined,
          }}
        >
          {categoryLabels[weapon + star]}
        </Text>
      </Tooltip>
    );
  };

  const restPartys =
    partys.length > 4 ? (
      <Collapse
        size="small"
        style={{ width: "100%" }}
        items={[
          {
            key: "1",
            label: "5파티 이후 보기",
            children: (
              <Card>
                {partys
                  .slice(4)
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
            ),
          },
        ]}
      />
    ) : null;

  return (
    <Card title={title} style={{ margin: "4px" }} size="small">
      {partys
        .slice(0, 4)
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
      {restPartys}
    </Card>
  );
};

export default PartyCard;
