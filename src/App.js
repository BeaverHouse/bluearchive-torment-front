import { Select, Spin, Slider, Pagination, Button } from "antd";
import { tab_items } from "./constant";
import { useEffect, useState } from "react";
import { filteredPartys } from "./func";
import PartyView from "./components/PartyView";

function App() {

  const [Season, setSeason] = useState(tab_items[0].value)
  const [Loading, setLoading] = useState(false)
  const [Data, setData] = useState(null)
  const [IncludeList, setIncludeList] = useState([])
  const [ExcludeList, setExcludeList] = useState([])
  const [UnderThreeList, setUnderThreeList] = useState([])
  const [UnderFourList, setUnderFourList] = useState([])
  const [Assist, setAssist] = useState(undefined)
  const [PartyCountRange, setPartyCountRange] = useState([1, 100])
  const [Page, setPage] = useState(1)
  const [PageSize, setPageSize] = useState(10)

  const changeSeason = (season) => {
    setLoading(true)
    setData(null)
    try {
      const json = require(`./data/${season}.json`)
      setData(json)
      setPartyCountRange([1, 100])
      setSeason(season)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    changeSeason(Season)
  }, [Season])


  useEffect(() => {
    setPage(1)
  }, [IncludeList, ExcludeList, Assist, PartyCountRange, PageSize, UnderThreeList, UnderFourList])

  return (
    <div className="App" style={{
      width: "100%",
      maxWidth: "1300px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      margin: "0 auto"
    }}>
      <h1>Blue Archive Torment</h1>

      <div style={{
        display: 'flex',
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        width: "80%"
      }}>
        <Select
          value={Season}
          onChange={changeSeason}
          style={{ width: "50%", marginRight: "30px" }}
          options={tab_items}
        />
        <Button href="https://arona.ai/raidreport" target="_blank" type="primary">
          같이 보면 좋은 총력전 리포트 (Link)
        </Button>
      </div>

      <br />
      {!Loading && Data ? (
        <div style={{ width: "100%" }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: "2fr 3fr 2fr 3fr",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {/* 파티 수 Filter */}
            <div>파티 수</div>
            <div style={{ width: "90%", display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px auto", gridColumn: "span 3" }}>
              <div style={{ margin: "10px" }}><b>{Math.max(PartyCountRange[0], Data.min_party)}파티</b></div>
              <Slider
                range
                style={{ flex: 1 }}
                max={Data.max_party}
                min={Data.min_party}
                onChange={setPartyCountRange}
                value={PartyCountRange}
              />
              <div style={{ margin: "10px" }}><b>{Math.min(PartyCountRange[1], Data.max_party)}파티</b></div>
            </div>
            {/* 포함 캐릭터 Filter */}
            <div>포함할 캐릭터</div>
            <Select
              mode="tags"
              placeholder="캐릭터를 선택하세요"
              defaultValue={[]}
              onChange={setIncludeList}
              style={{ margin: "6px auto", width: "100%", gridColumn: "span 3" }}
              options={Data.filter.map((key) => ({
                value: key, label: key
              }))}
            />
            {/* 제외 캐릭터 Filter */}
            <div>제외할 캐릭터</div>
            <Select
              mode="tags"
              placeholder="제외할 캐릭터를 선택하세요"
              defaultValue={[]}
              onChange={setExcludeList}
              style={{ margin: "6px auto", width: "100%", gridColumn: "span 3" }}
              options={Data.filter.map((key) => ({
                value: key, label: key
              }))}
            />
            {/* 4성 Filter */}
            {Season !== "S47" ? <>
              <div>4성 이하 캐릭터</div>
              <Select
                mode="tags"
                allowClear={true}
                placeholder="4성 이하여야 하는 캐릭터를 선택하세요"
                defaultValue={[]}
                onChange={setUnderFourList}
                style={{ width: "100%", margin: "6px auto" }}
                options={Data.under4_filter.map((key) => ({
                  value: key, label: key
                }))}
              />
            </> : null}
            {/* 조력자 Filter */}
            <div style={{ gridRow: "span 2" }}>조력자</div>
            <Select
              allowClear={true}
              placeholder="조력자를 선택하세요"
              defaultValue={[]}
              onChange={setAssist}
              style={{ width: "100%", margin: "6px auto", gridRow: "span 2", gridColumn: Season === "S47" ? "span 3" : null }}
              options={Data.assist_filter.map((key) => ({
                value: key, label: key
              }))}
            />
            {/* 3성 Filter */}
            {Season !== "S47" ? <>
              <div>3성 이하 캐릭터</div>
              <Select
                mode="tags"
                allowClear={true}
                placeholder="3성 이하여야 하는 캐릭터를 선택하세요"
                defaultValue={[]}
                onChange={setUnderThreeList}
                style={{ width: "100%", margin: "6px auto" }}
                options={Data.under3_filter.map((key) => ({
                  value: key, label: key
                }))}
              />
            </> : null}
          </div>
          <br />
          <Pagination
            total={filteredPartys(Data, IncludeList, ExcludeList, Assist, PartyCountRange, UnderFourList, UnderThreeList).length}
            current={Page}
            onChange={setPage}
            pageSize={PageSize}
            onShowSizeChange={(_, size) => setPageSize(size)}
            pageSizeOptions={[10, 20]}
          />
          <br />
          {filteredPartys(Data, IncludeList, ExcludeList, Assist, PartyCountRange, UnderFourList, UnderThreeList)
            .filter((_, idx) => idx >= (Page - 1) * PageSize && idx < Page * PageSize)
            .map((party, idx) =>
              <PartyView key={idx} party={party} />
            )}
        </div>
      ) : <Spin />}
    </div>
  );
}

export default App;
