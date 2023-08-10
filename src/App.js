import { Select, Spin, Slider, Pagination } from "antd";
import { tab_items } from "./constant";
import { useEffect, useState } from "react";
import { filteredPartys } from "./func";
import PartyView from "./components/PartyView";

function App() {

  const [Season, setSeason] = useState("S47")
  const [Data, setData] = useState(null)
  const [IncludeList, setIncludeList] = useState([])
  const [ExcludeList, setExcludeList] = useState([])
  const [Assist, setAssist] = useState(undefined)
  const [PartyCountRange, setPartyCountRange] = useState([1, 100])
  const [Page, setPage] = useState(1)
  const [PageSize, setPageSize] = useState(10)

  useEffect(() => {
    const json = require(`./data/${Season}.json`)
    setData(json)
    setPartyCountRange([1, 100])
  }, [Season])

  useEffect(() => {
    setPage(1)
  }, [IncludeList, ExcludeList, Assist, PartyCountRange, PageSize])

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
      <p>※ 조력자는 2번 사용한 경우에만 제대로 표시됩니다.</p>
      <Select
        placeholder="캐릭터를 선택하세요"
        value={Season}
        onChange={setSeason}
        style={{ width: "70%", margin: "6px auto" }}
        options={tab_items}
      />
      <br />
      {Data ? (
        <div style={{ width: "100%" }}>
          <div style={{
            display: 'flex',
            alignItems: "center",
            margin: "10px auto"
          }}>
            <div style={{ width: "150px" }}>파티 수</div>
            <div style={{ width: "70%", display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px auto" }}>
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
          </div>
          <div style={{
            display: 'flex',
            alignItems: "center",
          }}>
            <div style={{ width: "150px" }}>포함할 캐릭터</div>
            <Select
              mode="tags"
              placeholder="캐릭터를 선택하세요"
              defaultValue={[]}
              onChange={setIncludeList}
              style={{ width: "70%", margin: "6px auto" }}
              options={Data.filter.map((key) => ({
                value: key, label: key
              }))}
            />
          </div>
          <div style={{
            display: 'flex',
            alignItems: "center",
          }}>
            <div style={{ width: "150px" }}>제외할 캐릭터</div>
            <Select
              mode="tags"
              placeholder="제외할 캐릭터를 선택하세요"
              defaultValue={[]}
              onChange={setExcludeList}
              style={{ width: "70%", margin: "6px auto" }}
              options={Data.filter.map((key) => ({
                value: key, label: key
              }))}
            />
          </div>
          <div style={{
            display: 'flex',
            alignItems: "center",
          }}>
            <div style={{ width: "150px" }}>조력자</div>
            <Select
              allowClear={true}
              placeholder="조력자를 선택하세요"
              defaultValue={[]}
              onChange={setAssist}
              style={{ width: "70%", margin: "6px auto" }}
              options={Data.assist_filter.map((key) => ({
                value: key, label: key
              }))}
            />
          </div>
          <br />
          <Pagination
            total={filteredPartys(Data, IncludeList, ExcludeList, Assist, PartyCountRange).length}
            current={Page}
            onChange={setPage}
            pageSize={PageSize}
            onShowSizeChange={(_, size) => setPageSize(size)}
            pageSizeOptions={[10, 20]}
          />
          <br />
          {filteredPartys(Data, IncludeList, ExcludeList, Assist, PartyCountRange)
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
