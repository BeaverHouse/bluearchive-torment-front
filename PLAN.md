# 성능 최적화 계획

## ✅ 완료
1. 시간 유틸리티 함수 통합 (`/src/utils/time.ts`)
2. 레이드 유틸리티 함수 통합 (`/src/utils/raid.ts`)
3. 공통 필터 컴포넌트 생성 및 교체 (`party-filter.tsx`)

## 🔲 남은 작업

### 4. 핵심 컴포넌트 메모이제이션
- `PartyCard` - React.memo + useCallback
- `SingleParty` - React.memo + useMemo
- `StudentImage` - React.memo + useMemo
- `MultiSelect`, `Cascader` - React.memo

### 5. 필터 옵션 최적화
- raid-search.tsx: filterOptions useMemo
- video-analysis/page.tsx: 옵션 배열 useMemo

### 6. 데이터 계산 메모이제이션
- studentsMap, raidInfos useMemo
- React Query staleTime/cacheTime 설정

### 7. 이미지 최적화
- StudentImage에 loading="lazy", quality 속성
- blur placeholder 추가

### 8. 필터 상태 리팩토링
- useReducer로 필터 상태 통합
- useDebounce 훅 생성 및 적용

### 9. 캐릭터 사용률 테이블 컴포넌트화
- `CharacterUsageTable` 컴포넌트 생성
- raid-summary.tsx의 3개 테이블 통합
