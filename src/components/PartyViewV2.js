import { Collapse, Card, Typography, Tooltip } from "antd";
import React from "react";
import { isMobile } from "react-device-detect";
import { weaponLabels } from "../constant";

const { Text } = Typography;

const labelStyle = {
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  maxWidth: "25px",
  padding: 4,
};

const strikerStyle = {
  backgroundColor: "#ffffeb",
  textAlign: "center",
  display: "flex",
  alignItems: "start",
  justifyContent: "center",
  padding: 6,
};
const specialStyle = {
  ...strikerStyle,
  backgroundColor: "#f0fbff",
};

const PartyViewV2 = ({ party }) => {
  const getCharIcon = (char) => {
    if (!char) return;
    const { name, category, assist } = char;
    return (
      <Tooltip title={assist ? `${name} (A)` : name}>
        <img
          src={`/image/${name}.webp`}
          alt={name}
          width={isMobile ? 40 : 50}
          style={{
            border: assist ? "3px solid #4CBB17" : undefined,
          }}
        />
        <br />
        <Text
          style={{
            color: assist ? "#008000" : "black",
            fontWeight: assist ? "bold" : undefined,
          }}
        >
          {weaponLabels[category]}
        </Text>
      </Tooltip>
    );
  };

  const restPartys =
    party.party_count > 4 ? (
      <>
        <br />
        <Collapse
          size="small"
          items={[
            {
              key: "1",
              label: "5파티 이후 보기",
              children: party.partys.slice(4).map((p, idx) => (
                <div style={{ display: "flex" }} key={idx}>
                  <Card.Grid style={labelStyle} hoverable={false}>
                    {idx + 5}
                  </Card.Grid>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Card.Grid
                      style={{
                        ...(i >= 4 ? specialStyle : strikerStyle),
                        padding: 4.5,
                      }}
                      hoverable={false}
                    >
                      {getCharIcon(p.members[i])}
                    </Card.Grid>
                  ))}
                </div>
              )),
            },
          ]}
        />
      </>
    ) : null;

  return (
    <Card
      title={<Text>{`${party.rank}위 : ${party.score}점`}</Text>}
      bodyStyle={{ padding: 4 }}
      style={{ margin: "7px 3px 0 3px" }}
    >
      {party.partys.slice(0, 4).map((party, i) => {
        return (
          <div style={{ display: "flex" }}>
            <Card.Grid style={labelStyle} hoverable={false}>
              <Text strong>{i + 1}</Text>
            </Card.Grid>
            {[0, 1, 2, 3, 4, 5].map((j) => (
              <Card.Grid
                style={j < 4 ? strikerStyle : specialStyle}
                hoverable={false}
              >
                {getCharIcon(party.members[j])}
              </Card.Grid>
            ))}
          </div>
        );
      })}
      {restPartys}
    </Card>
  );
};

export default React.memo(PartyViewV2);
