import {
  Select,
  Slider,
  Pagination,
  Button,
  Checkbox,
  Typography,
  Collapse,
} from "antd";
import { announceHTML, announceUpdate } from "../constant";
import { useEffect, useState } from "react";
import { filteredPartys } from "../func";
import PartyView from "./PartyView";
import useBAStore from "../useStore";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { isMobile } from "react-device-detect";

const AnnounceInfo = withReactContent(Swal);
const { Text } = Typography;

function PageContent({ Data }) {
  const {
    IncludeList,
    ExcludeList,
    UnderThreeList,
    UnderFourList,
    Assist,
    HardExclude,
    AllowDuplicate,
    setIncludeList,
    setExcludeList,
    setUnderThreeList,
    setUnderFourList,
    setAssist,
    setHardExclude,
    setAllowDuplicate,
    removeFilters,
  } = useBAStore();

  const [PartyCountRange, setPartyCountRange] = useState([
    Data.min_party,
    Data.max_party,
  ]);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);

  const resetFilter = () => {
    const go = window.confirm("모든 캐릭터 필터가 리셋됩니다.");
    if (go) {
      console.log("Reset Filter");
      removeFilters();
    }
  };

  const toggleHardExclude = (e) => {
    setHardExclude(e.target.checked);
  };
  const toggleAllowDuplicate = (e) => {
    setAllowDuplicate(e.target.checked);
  };

  useEffect(() => {
    const checkDay = window.localStorage.getItem("BA_INFO");
    if (checkDay !== announceUpdate) {
      // if(true) {
      AnnounceInfo.fire({
        title: "Update",
        html: announceHTML,
        icon: "info",
      }).then(() => {
        window.localStorage.setItem("BA_INFO", announceUpdate);
      });
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [
    IncludeList,
    ExcludeList,
    Assist,
    PartyCountRange,
    PageSize,
    UnderThreeList,
    UnderFourList,
    HardExclude,
    AllowDuplicate,
  ]);

  return (
    <>
      <Collapse
        size="small"
        style={{
          marginBottom: 20,
          width: "100%",
          maxWidth: 600,
        }}
      >
        <Collapse.Panel
          header="파티 Filter"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Button
            style={{ width: 240, margin: 5, marginBottom: 20 }}
            onClick={resetFilter}
            danger={true}
          >
            필터 Reset
          </Button>
          <br />
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
              {Math.max(PartyCountRange[0], Data.min_party)}파티
            </Text>
            <Slider
              range
              style={{ flex: 1 }}
              max={Data.max_party}
              min={Data.min_party}
              onChange={setPartyCountRange}
              value={PartyCountRange}
            />
            <Text strong style={{ marginLeft: 10 }}>
              {Math.min(PartyCountRange[1], Data.max_party)}파티
            </Text>
          </div>
          {/* 포함 캐릭터 Filter */}
          <Text>포함할 캐릭터</Text>
          <Select
            mode="tags"
            placeholder="캐릭터를 선택하세요"
            value={IncludeList}
            onChange={setIncludeList}
            style={{ width: "100%", marginBottom: 10 }}
            options={Data.filter.map((key) => ({
              value: key,
              label: key,
            }))}
          />
          {/* 제외 캐릭터 Filter */}
          <Text>제외할 캐릭터</Text>
          <Select
            mode="tags"
            placeholder="제외할 캐릭터를 선택하세요"
            value={ExcludeList}
            onChange={setExcludeList}
            style={{ width: "100%" }}
            options={Data.filter.map((key) => ({
              value: key,
              label: key,
            }))}
          />
          <Checkbox
            style={{ margin: 2, marginBottom: 10 }}
            onChange={toggleHardExclude}
            checked={HardExclude}
            value={HardExclude}
          >
            조력자에서도 제외
          </Checkbox>
          <br />
          {/* 4성 Filter */}
          <Text style={{ marginTop: 10 }}>4성 이하 캐릭터</Text>
          <Select
            mode="tags"
            allowClear={true}
            placeholder="4성 이하여야 하는 캐릭터를 선택하세요"
            value={UnderFourList}
            onChange={setUnderFourList}
            style={{ width: "100%", marginBottom: 5 }}
            options={Data.under4_filter.map((key) => ({
              value: key,
              label: key,
            }))}
          />
          {/* 3성 Filter */}
          <Text style={{ marginTop: 10 }}>3성 이하 캐릭터</Text>
          <Select
            mode="tags"
            allowClear={true}
            placeholder="3성 이하여야 하는 캐릭터를 선택하세요"
            value={UnderThreeList}
            onChange={setUnderThreeList}
            style={{ width: "100%", marginBottom: 15 }}
            options={Data.under3_filter.map((key) => ({
              value: key,
              label: key,
            }))}
          />
          {/* 조력자 Filter */}
          <Text style={{ marginTop: 20 }}>조력자</Text>
          <Select
            allowClear={true}
            placeholder="조력자를 선택하세요"
            value={Assist}
            onChange={setAssist}
            style={{ width: "100%" }}
            options={Data.assist_filter.map((key) => ({
              value: key,
              label: key,
            }))}
          />
          <Checkbox
            style={{ margin: 2 }}
            onChange={toggleAllowDuplicate}
            checked={AllowDuplicate}
            value={AllowDuplicate}
          >
            조력자 포함 중복 허용
          </Checkbox>
        </Collapse.Panel>
      </Collapse>
      <br />
      <Pagination
        total={
          filteredPartys(
            Data,
            IncludeList,
            ExcludeList,
            Assist,
            PartyCountRange,
            UnderFourList,
            UnderThreeList,
            HardExclude,
            AllowDuplicate
          ).length
        }
        current={Page}
        onChange={setPage}
        pageSize={PageSize}
        simple={isMobile}
        onShowSizeChange={(_, size) => setPageSize(size)}
        pageSizeOptions={[10, 20]}
      />
      <br />
      <div
        style={{
          width: "100%",
          minWidth: 345,
          margin: "0 auto",
          overflowX: "auto",
        }}
      >
        {filteredPartys(
          Data,
          IncludeList,
          ExcludeList,
          Assist,
          PartyCountRange,
          UnderFourList,
          UnderThreeList,
          HardExclude,
          AllowDuplicate
        )
          .filter(
            (_, idx) => idx >= (Page - 1) * PageSize && idx < Page * PageSize
          )
          .map((party, idx) => (
            <PartyView key={idx} party={party} />
          ))}
      </div>
    </>
  );
}

export default PageContent;
