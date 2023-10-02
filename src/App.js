import { Select, Spin, Slider, Pagination, Button, Checkbox } from "antd";
import { announceHTML, announceUpdate, tab_items } from "./constant";
import { useCallback, useEffect, useState } from "react";
import { filteredPartys } from "./func";
import PartyView from "./components/PartyView";
import useBAStore from "./useStore";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const AnnounceInfo = withReactContent(Swal)

function App() {

  const {
    Season,
    IncludeList,
    ExcludeList,
    UnderThreeList,
    UnderFourList,
    Assist,
    HardExclude,
    AllowDuplicate,
    setSeason,
    setIncludeList,
    setExcludeList,
    setUnderThreeList,
    setUnderFourList,
    setAssist,
    setHardExclude,
    setAllowDuplicate,
    removeFilters,
  } = useBAStore();

  const [Loading, setLoading] = useState(false)
  const [Data, setData] = useState(null)
  const [PartyCountRange, setPartyCountRange] = useState([1, 100])
  const [Page, setPage] = useState(1)
  const [PageSize, setPageSize] = useState(10)

  const changeSeason = useCallback((season) => {
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
  }, [setSeason])

  const resetFilter = () => {
    const go = window.confirm("모든 캐릭터 필터가 리셋됩니다.")
    if (go) {
      console.log("Reset Filter")
      removeFilters()
    }
  }

  const toggleHardExclude = (e) => {
    setHardExclude(e.target.checked)
  }
  const toggleAllowDuplicate = (e) => {
    setAllowDuplicate(e.target.checked)
  }

  useEffect(() => {
    const checkDay = window.localStorage.getItem("BA_INFO")
    if (checkDay !== announceUpdate) {
      // if(true) {
      AnnounceInfo.fire({
        title: 'Update',
        html: announceHTML,
        icon: 'info',
      }).then(() => {
        window.localStorage.setItem("BA_INFO", announceUpdate)
      })
    }
  }, [])

  useEffect(() => {
    changeSeason(Season)
  }, [Season, changeSeason])

  useEffect(() => {
    setPage(1)
  }, [Season, IncludeList, ExcludeList, Assist, PartyCountRange, PageSize, UnderThreeList, UnderFourList, HardExclude, AllowDuplicate])

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
          style={{ width: "50%", marginRight: "20px" }}
          options={tab_items}
        />
        <Button
          style={{ width: "40%", marginRight: "40px" }}
          href="https://arona.ai/raidreport"
          target="_blank"
          type="primary"
        >
          같이 보면 좋은 총력전 리포트 (Link)
        </Button>
        <Button onClick={resetFilter} danger={true}>
          필터 Reset
        </Button>
      </div>
      <br />
      {["3S2-T"].includes(Season) ? <b>
        ※ 클리어 인원이 많아 최종 랭킹 in 1500만 표기합니다.
      </b> : null}
      <br />
      {!Loading && Data ? (
        <div style={{ width: "100%" }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: "2fr 3fr 2fr 1fr 2fr",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {/* 파티 수 Filter */}
            <div>파티 수</div>
            <div style={{ width: "90%", display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px auto", gridColumn: "span 4" }}>
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
              value={IncludeList}
              onChange={setIncludeList}
              style={{ margin: "6px auto", width: "100%", gridColumn: "span 4" }}
              options={Data.filter.map((key) => ({
                value: key, label: key
              }))}
            />
            {/* 제외 캐릭터 Filter */}
            <div>제외할 캐릭터</div>
            <Select
              mode="tags"
              placeholder="제외할 캐릭터를 선택하세요"
              value={ExcludeList}
              onChange={setExcludeList}
              style={{ margin: "6px auto", width: "100%", gridColumn: "span 3" }}
              options={Data.filter.map((key) => ({
                value: key, label: key
              }))}
            />
            <div>
              <Checkbox onChange={toggleHardExclude} checked={HardExclude} value={HardExclude}>
                조력자에서도 제외
              </Checkbox>
            </div>
            {/* 4성 Filter */}
            <div>4성 이하 캐릭터</div>
            <Select
              mode="tags"
              allowClear={true}
              placeholder="4성 이하여야 하는 캐릭터를 선택하세요"
              value={UnderFourList}
              onChange={setUnderFourList}
              style={{ width: "100%", margin: "6px auto" }}
              options={Data.under4_filter.map((key) => ({
                value: key, label: key
              }))}
            />
            {/* 조력자 Filter */}
            <div style={{ gridRow: "span 2" }}>조력자</div>
            <div
              style={{ width: "100%", gridRow: "span 2", gridColumn: "span 2" }}
            >
              <Select
                allowClear={true}
                placeholder="조력자를 선택하세요"
                value={Assist}
                onChange={setAssist}
                style={{ width: "100%", margin: "6px auto" }}
                options={Data.assist_filter.map((key) => ({
                  value: key, label: key
                }))}
              />
              <Checkbox onChange={toggleAllowDuplicate} checked={AllowDuplicate} value={AllowDuplicate}>
                조력자 포함 중복 허용
              </Checkbox>
            </div>
            {/* 3성 Filter */}
            <div>3성 이하 캐릭터</div>
            <Select
              mode="tags"
              allowClear={true}
              placeholder="3성 이하여야 하는 캐릭터를 선택하세요"
              value={UnderThreeList}
              onChange={setUnderThreeList}
              style={{ width: "100%", margin: "6px auto" }}
              options={Data.under3_filter.map((key) => ({
                value: key, label: key
              }))}
            />
          </div>
          <br />
          <Pagination
            total={filteredPartys(Data, IncludeList, ExcludeList, Assist, PartyCountRange, UnderFourList, UnderThreeList, HardExclude, AllowDuplicate).length}
            current={Page}
            onChange={setPage}
            pageSize={PageSize}
            onShowSizeChange={(_, size) => setPageSize(size)}
            pageSizeOptions={[10, 20]}
          />
          <br />
          {filteredPartys(Data, IncludeList, ExcludeList, Assist, PartyCountRange, UnderFourList, UnderThreeList, HardExclude, AllowDuplicate)
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
