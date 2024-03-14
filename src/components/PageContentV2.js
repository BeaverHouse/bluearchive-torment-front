import {
  Select,
  Slider,
  Pagination,
  Button,
  Checkbox,
  Typography,
  Collapse,
  Cascader,
} from "antd";
import { useEffect, useState } from "react";
import { filteredPartysV2, makeCascaderOptions } from "../func";
import { isMobile } from "react-device-detect";
import useV2BAStore from "../useV2Store";
import PartyViewV2 from "./PartyViewV2";

const { Text } = Typography;

function PageContentV2({ Data }) {
  const {
    IncludeList,
    ExcludeList,
    Assist,
    HardExclude,
    AllowDuplicate,
    setIncludeList,
    setExcludeList,
    setAssist,
    setHardExclude,
    setAllowDuplicate,
    removeFilters,
  } = useV2BAStore();

  const [PartyCountRange, setPartyCountRange] = useState([
    Data.min_party,
    Data.max_party,
  ]);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);

  const confirmReset = () => {
    const confirm = window.confirm("모든 캐릭터 필터가 리셋됩니다.");
    if (confirm) removeFilters();
  };

  const toggleHardExclude = (e) => {
    setHardExclude(e.target.checked);
  };
  const toggleAllowDuplicate = (e) => {
    setAllowDuplicate(e.target.checked);
  };

  const filter = (inputValue, path) =>
    path.some(
      (option) =>
        option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );

  useEffect(() => {
    setPage(1);
  }, [
    IncludeList,
    ExcludeList,
    Assist,
    PartyCountRange,
    PageSize,
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
            onClick={confirmReset}
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
          <Text>
            포함할 <b>내 캐릭터</b>
          </Text>
          <Cascader
            multiple={true}
            changeOnSelect
            dropdownRender={(menu) => (
              <div>
                {menu}
                <div style={{ padding: "4px 8px" }}>
                  <sub>1. 캐릭터의 성급은 1개만 선택해주세요.</sub>
                  <br />
                  <sup>
                    2. 성급 관계없이 보고 싶다면 왼쪽 체크박스를 사용하세요.
                  </sup>
                </div>
              </div>
            )}
            placeholder="캐릭터를 선택하세요"
            showSearch={{ filter }}
            value={IncludeList}
            onChange={setIncludeList}
            style={{ width: "100%", marginBottom: 15 }}
            options={makeCascaderOptions(Data.filter)}
          />
          {/* 제외 캐릭터 Filter */}
          <Text>제외할 캐릭터</Text>
          <Select
            mode="tags"
            placeholder="제외할 캐릭터를 선택하세요"
            value={ExcludeList}
            onChange={setExcludeList}
            style={{ width: "100%" }}
            options={Object.keys(Data.filter).map((key) => ({
              value: key,
              label: key,
            }))}
          />
          <Checkbox
            style={{ margin: 2, marginBottom: 15 }}
            onChange={toggleHardExclude}
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
            value={Assist}
            defaultValue={[]}
            onChange={setAssist}
            showSearch={{ filter }}
            style={{ width: "100%" }}
            displayRender={(label) => label[1]}
            options={makeCascaderOptions(Data.assist_filter)}
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
          filteredPartysV2(
            Data,
            IncludeList,
            ExcludeList,
            Assist,
            PartyCountRange,
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
        {filteredPartysV2(
          Data,
          IncludeList,
          ExcludeList,
          Assist,
          PartyCountRange,
          HardExclude,
          AllowDuplicate
        )
          .filter(
            (_, idx) => idx >= (Page - 1) * PageSize && idx < Page * PageSize
          )
          .map((party, idx) => (
            <PartyViewV2 key={idx} party={party} />
          ))}
      </div>
    </>
  );
}

export default PageContentV2;
