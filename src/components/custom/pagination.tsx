"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20],
}: PaginationProps) {
  const [pageInputValue, setPageInputValue] = useState(currentPage.toString());
  const [isPageInputActive, setIsPageInputActive] = useState(false);

  const totalPages = Math.ceil(totalItems / pageSize);

  // currentPage가 변경될 때 pageInputValue 동기화 (사용자 입력 중이 아닐 때만)
  useEffect(() => {
    if (!isPageInputActive) {
      setPageInputValue(currentPage.toString());
    }
  }, [currentPage, isPageInputActive]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInputValue(value);

    // 숫자가 아닌 문자 제거
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue === "") {
      // 빈 값이면 아무것도 하지 않음 (입력 중일 수 있음)
      return;
    }

    const newPage = parseInt(numericValue);

    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const handlePageInputFocus = () => {
    setIsPageInputActive(true);
    setPageInputValue("");
  };

  const handlePageInputBlur = () => {
    setIsPageInputActive(false);

    // 빈 값이면 첫 페이지로 fallback
    if (pageInputValue === "" || pageInputValue === "0") {
      onPageChange(1);
      setPageInputValue("1");
    } else {
      // 유효하지 않은 값이면 현재 페이지로 복원
      const numericValue = pageInputValue.replace(/[^0-9]/g, "");
      const newPage = parseInt(numericValue);

      if (isNaN(newPage) || newPage < 1 || newPage > totalPages) {
        setPageInputValue(currentPage.toString());
      } else {
        onPageChange(newPage);
        setPageInputValue(newPage.toString());
      }
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        이전
      </Button>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={pageInputValue}
          onChange={handlePageInputChange}
          onFocus={handlePageInputFocus}
          onBlur={handlePageInputBlur}
          onKeyDown={handlePageInputKeyDown}
          placeholder="페이지"
          className="w-16 px-2 py-1 text-sm border rounded text-center"
        />
        <span className="text-sm">/ {totalPages}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        다음
      </Button>
      {pageSizeOptions.length > 1 && (
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(parseInt(value))}
        >
          <SelectTrigger className="w-23">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}개씩
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
