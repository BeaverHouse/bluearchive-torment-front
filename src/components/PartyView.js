import { Collapse, Card } from 'antd'
import React from 'react'

const labelStyle = {
    width: '13%',
    height: '20px',
    textAlign: 'center',
    display: "flex",
    alignItems: "center",
};

const strikerStyle = {
    backgroundColor: "lightyellow",
    height: '20px',
    textAlign: 'center',
    display: "flex",
    alignItems: "center",
};
const specialStyle = {
    backgroundColor: "#d4ebf2",
    height: '20px',
    textAlign: 'center',
    display: "flex",
    alignItems: "center",
};


const PartyView = ({
    party
}) => {

    const getCharText = (char) => {
        if (!char) return "";

        const { name, star, assist } = char;
        if (star > 0 && star < 5 && assist) return <b style={{ color: "#880ED4" }}>{`${name} (A, ★${star})`}</b>
        else if (star >= 5 && assist) return <b style={{ color: "#880ED4" }}>{`${name} (A)`}</b>
        else if (star > 0 && star < 5) return <b>{`${name} (★${star})`}</b>
        else return name
    }

    const restPartys = party.party_count > 4 ? (
        <Collapse
            size="small"
            items={[{
                key: '1',
                label: '5파티 이후 보기',
                children: (
                    party.partys.slice(4).map((p, idx) => (
                        <div style={{ display: "flex" }} key={idx}>
                            <Card.Grid style={labelStyle} hoverable={false}>{idx + 5}파티</Card.Grid>
                            <Card.Grid style={strikerStyle} hoverable={false}>{getCharText(p.strikers[0])}</Card.Grid>
                            <Card.Grid style={strikerStyle} hoverable={false}>{getCharText(p.strikers[1])}</Card.Grid>
                            <Card.Grid style={strikerStyle} hoverable={false}>{getCharText(p.strikers[2])}</Card.Grid>
                            <Card.Grid style={strikerStyle} hoverable={false}>{getCharText(p.strikers[3])}</Card.Grid>
                            <Card.Grid style={specialStyle} hoverable={false}>{getCharText(p.specials[0])}</Card.Grid>
                            <Card.Grid style={specialStyle} hoverable={false}>{getCharText(p.specials[1])}</Card.Grid>
                        </div>
                    ))
                )
            }]}
        />
    ) : null;

    return (
        <Card title={`${party.rank}위 : ${party.score}점`}>
            {[0, 1, 2, 3].map(i => {
                const targetParty = party.partys[i]
                return targetParty ? (
                    <div style={{ display: "flex" }}>
                        <Card.Grid style={labelStyle} hoverable={false}>{i + 1}파티</Card.Grid>
                        <Card.Grid style={strikerStyle} hoverable={false}>{getCharText(targetParty.strikers[0])}</Card.Grid>
                        <Card.Grid style={strikerStyle} hoverable={false}>{getCharText(targetParty.strikers[1])}</Card.Grid>
                        <Card.Grid style={strikerStyle} hoverable={false}>{getCharText(targetParty.strikers[2])}</Card.Grid>
                        <Card.Grid style={strikerStyle} hoverable={false}>{getCharText(targetParty.strikers[3])}</Card.Grid>
                        <Card.Grid style={specialStyle} hoverable={false}>{getCharText(targetParty.specials[0])}</Card.Grid>
                        <Card.Grid style={specialStyle} hoverable={false}>{getCharText(targetParty.specials[1])}</Card.Grid>
                    </div>
                ) : null
            })}
            <br />
            {restPartys}
        </Card>
    )
}

export default React.memo(PartyView)