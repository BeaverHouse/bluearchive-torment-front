// 공통 Select 옵션 타입들
export interface BaseSelectOption {
  value: string | number;
  label: string;
}

export interface ImageSelectOption extends BaseSelectOption {
  value: number;
  imageUrl?: string;
}

export interface MultiSelectOption extends BaseSelectOption {
  value: string | number;
}

export interface CascaderOption extends BaseSelectOption {
  value: number;
  children?: CascaderOption[];
}

// 공통 Select Props
export interface BaseSelectProps {
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
}