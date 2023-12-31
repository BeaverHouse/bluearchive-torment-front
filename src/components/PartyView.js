import { Collapse, Card, Typography, Tooltip } from "antd";
import React from "react";
import { isMobile } from "react-device-detect";

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
  backgroundColor: "#f0fbff",
  textAlign: "center",
  display: "flex",
  alignItems: "start",
  justifyContent: "center",
  padding: 6,
};

const PartyView = ({ party }) => {
  const getCharIcon = (char) => {
    if (!char) return "";

    const { name, star, assist } = char;
    const textArr = [];
    if (star > 0 && star < 5) textArr.push(`(★${star})`);
    return (
      <Tooltip title={assist ? `${name} (A)` : name}>
        <img
          src={`/image/${name}.webp`}
          alt={name}
          width={isMobile ? 40 : 50}
          style={{
            border: assist ? "3px solid #4CBB17" : null,
            boxSizing: "border-box",
          }}
        />
        <br />
        {textArr.length > 0 ? (
          <Text
            style={{
              color: assist ? "#4CBB17" : "black",
            }}
          >
            {textArr.join("\n")}
          </Text>
        ) : null}
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
                  <Card.Grid
                    style={{ ...strikerStyle, padding: 4.5 }}
                    hoverable={false}
                  >
                    {getCharIcon(p.strikers[0])}
                  </Card.Grid>
                  <Card.Grid
                    style={{ ...strikerStyle, padding: 4.5 }}
                    hoverable={false}
                  >
                    {getCharIcon(p.strikers[1])}
                  </Card.Grid>
                  <Card.Grid
                    style={{ ...strikerStyle, padding: 4.5 }}
                    hoverable={false}
                  >
                    {getCharIcon(p.strikers[2])}
                  </Card.Grid>
                  <Card.Grid
                    style={{ ...strikerStyle, padding: 4.5 }}
                    hoverable={false}
                  >
                    {getCharIcon(p.strikers[3])}
                  </Card.Grid>
                  <Card.Grid
                    style={{ ...specialStyle, padding: 4.5 }}
                    hoverable={false}
                  >
                    {getCharIcon(p.specials[0])}
                  </Card.Grid>
                  <Card.Grid
                    style={{ ...specialStyle, padding: 4.5 }}
                    hoverable={false}
                  >
                    {getCharIcon(p.specials[1])}
                  </Card.Grid>
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
      {[0, 1, 2, 3].map((i) => {
        const targetParty = party.partys[i];
        return targetParty ? (
          <div style={{ display: "flex" }}>
            <Card.Grid style={labelStyle} hoverable={false}>
              <Text strong>{i + 1}</Text>
            </Card.Grid>
            <Card.Grid style={strikerStyle} hoverable={false}>
              {getCharIcon(targetParty.strikers[0])}
            </Card.Grid>
            <Card.Grid style={strikerStyle} hoverable={false}>
              {getCharIcon(targetParty.strikers[1])}
            </Card.Grid>
            <Card.Grid style={strikerStyle} hoverable={false}>
              {getCharIcon(targetParty.strikers[2])}
            </Card.Grid>
            <Card.Grid style={strikerStyle} hoverable={false}>
              {getCharIcon(targetParty.strikers[3])}
            </Card.Grid>
            <Card.Grid style={specialStyle} hoverable={false}>
              {getCharIcon(targetParty.specials[0])}
            </Card.Grid>
            <Card.Grid style={specialStyle} hoverable={false}>
              {getCharIcon(targetParty.specials[1])}
            </Card.Grid>
          </div>
        ) : null;
      })}
      {restPartys}
    </Card>
  );
};

export default React.memo(PartyView);
