import React from "react";
import Image from "next/image";

interface CharTableType {
  key: string;
  studentId: string;
  name: string;
  percent: number;
}

interface CharacterUsageTableProps {
  title: string;
  data: CharTableType[];
}

const StudentImage = ({
  studentId,
  name,
}: {
  studentId: string;
  name: string;
}) => {
  const [error, setError] = React.useState(false);

  return (
    <Image
      src={
        error
          ? "/empty.webp"
          : `${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${studentId}.webp`
      }
      alt={name}
      width={20}
      height={20}
      className="rounded object-cover flex-shrink-0"
      onError={() => setError(true)}
    />
  );
};

export const CharacterUsageTable = React.memo(
  ({ title, data }: CharacterUsageTableProps) => {
    return (
      <div className="min-w-0">
        <h4 className="font-bold mb-2 text-left text-sm sm:text-base">
          {title}
        </h4>
        <div className="max-h-80 overflow-y-auto border rounded">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left p-1 sm:p-2">이름</th>
                <th className="text-right p-1 sm:p-2">사용률 (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((char) => (
                <tr key={char.key} className="border-b hover:bg-muted/50">
                  <td className="p-1 sm:p-2">
                    <div className="flex items-center gap-2">
                      <StudentImage studentId={char.studentId} name={char.name} />
                      <span className="truncate">{char.name}</span>
                    </div>
                  </td>
                  <td
                    className={`p-1 sm:p-2 text-right ${
                      char.percent > 90
                        ? "text-red-600 font-bold"
                        : char.percent > 20
                        ? "text-sky-500  font-bold"
                        : ""
                    }`}
                  >
                    {char.percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

CharacterUsageTable.displayName = "CharacterUsageTable";
