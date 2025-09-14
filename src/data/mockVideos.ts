import { VideoAnalysisData } from "@/types/video"

export const mockVideos: VideoAnalysisData[] = [
  {
    id: 1,
    video_id: "OT93rwPOs4g",
    analysis_result: {
      party_compositions: [
        {
          party_number: 1,
          specials: [
            {
              code: 20023,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 1
            },
            {
              code: 20008,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 2
            },
            {
              code: 20039,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 3
            }
          ],
          strikers: [
            {
              code: 10073,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 1
            },
            {
              code: 10007,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 3
            },
            {
              code: 10049,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 3
            }
          ]
        },
        {
          party_number: 2,
          specials: [
            {
              code: 20039,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 2
            },
            {
              code: 20027,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 2
            }
          ],
          strikers: [
            {
              code: 10017,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 2
            },
            {
              code: 10011,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 1
            },
            {
              code: 13005,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 3
            },
            {
              code: 10085,
              coordinate: [0, 0],
              is_assist: false,
              star: 5,
              weapon_star: 2
            }
          ]
        }
      ],
      skill_orders: [
        { cost: 80, order: 1, party_number: 1, remaining_time: "02:41.833", type: "special" },
        { cost: 60, order: 3, party_number: 1, remaining_time: "02:37.933", type: "special" },
        { cost: 60, order: 2, party_number: 1, remaining_time: "02:32.900", type: "special" },
        { cost: 80, order: 3, party_number: 1, remaining_time: "02:22.066", type: "striker" },
        { cost: 90, order: 2, party_number: 1, remaining_time: "02:11.100", type: "special" },
        { cost: 40, order: 1, party_number: 1, remaining_time: "02:13.866", type: "striker" },
        { cost: 20, order: 1, party_number: 1, remaining_time: "02:10.633", type: "special" },
        { cost: 40, order: 3, party_number: 1, remaining_time: "02:08.100", type: "striker" },
        { cost: 0, order: 2, party_number: 1, remaining_time: "02:07.100", type: "striker" },
        { cost: 90, order: 3, party_number: 1, remaining_time: "01:49.300", type: "striker" },
        { cost: 50, order: 2, party_number: 1, remaining_time: "01:48.766", type: "special" },
        { cost: 50, order: 3, party_number: 1, remaining_time: "01:43.133", type: "special" },
        { cost: 10, order: 1, party_number: 1, remaining_time: "01:41.966", type: "special" },
        { cost: 40, order: 3, party_number: 1, remaining_time: "01:36.300", type: "striker" },
        { cost: 0, order: 2, party_number: 1, remaining_time: "01:33.766", type: "striker" },
        { cost: 90, order: 2, party_number: 1, remaining_time: "01:17.500", type: "special" },
        { cost: 80, order: 1, party_number: 1, remaining_time: "01:14.500", type: "striker" },
        { cost: 80, order: 3, party_number: 1, remaining_time: "01:13.700", type: "striker" },
        { cost: 70, order: 1, party_number: 1, remaining_time: "01:12.900", type: "striker" },
        { cost: 70, order: 3, party_number: 1, remaining_time: "01:11.400", type: "special" },
        { cost: 50, order: 1, party_number: 1, remaining_time: "01:08.800", type: "special" },
        { cost: 70, order: 3, party_number: 1, remaining_time: "01:05.233", type: "striker" },
        { cost: 40, order: 2, party_number: 1, remaining_time: "01:03.666", type: "striker" },
        { cost: 50, order: 3, party_number: 1, remaining_time: "01:01.666", type: "special" },
        { cost: 70, order: 3, party_number: 1, remaining_time: "00:57.600", type: "striker" },
        { cost: 40, order: 1, party_number: 1, remaining_time: "00:56.533", type: "special" },
        { cost: 40, order: 2, party_number: 1, remaining_time: "00:55.933", type: "striker" },
        { cost: 50, order: 3, party_number: 1, remaining_time: "00:54.533", type: "striker" },
        { cost: 70, order: 1, party_number: 1, remaining_time: "00:49.833", type: "striker" },
        { cost: 60, order: 1, party_number: 1, remaining_time: "00:48.300", type: "striker" },
        { cost: 70, order: 2, party_number: 1, remaining_time: "00:47.633", type: "special" },
        { cost: 40, order: 3, party_number: 1, remaining_time: "00:46.166", type: "special" },
        { cost: 40, order: 2, party_number: 1, remaining_time: "00:45.866", type: "special" },
        { cost: 50, order: 2, party_number: 1, remaining_time: "00:43.700", type: "striker" },
        { cost: 60, order: 1, party_number: 1, remaining_time: "00:42.700", type: "striker" },
        { cost: 70, order: 3, party_number: 1, remaining_time: "00:39.700", type: "striker" },
        { cost: 80, order: 3, party_number: 1, remaining_time: "00:38.800", type: "special" },
        { cost: 60, order: 1, party_number: 1, remaining_time: "00:37.000", type: "special" },
        { cost: 30, order: 2, party_number: 1, remaining_time: "00:34.266", type: "striker" },
        { cost: 40, order: 2, party_number: 1, remaining_time: "00:33.433", type: "striker" },
        { cost: 40, order: 2, party_number: 1, remaining_time: "00:32.200", type: "striker" },
        { cost: 40, order: 1, party_number: 1, remaining_time: "00:31.200", type: "striker" },
        { cost: 50, order: 2, party_number: 1, remaining_time: "00:30.733", type: "striker" },
        { cost: 60, order: 1, party_number: 1, remaining_time: "00:28.066", type: "striker" },
        { cost: 30, order: 1, party_number: 1, remaining_time: "00:22.033", type: "special" },
        { cost: 0, order: 2, party_number: 1, remaining_time: "00:20.033", type: "striker" },
        { cost: 10, order: 1, party_number: 1, remaining_time: "00:18.366", type: "striker" },
        { cost: 30, order: 1, party_number: 2, remaining_time: "02:57.800", type: "striker" },
        { cost: 10, order: 1, party_number: 2, remaining_time: "02:55.733", type: "special" },
        { cost: 50, order: 4, party_number: 2, remaining_time: "02:51.267", type: "striker" },
        { cost: 40, order: 3, party_number: 2, remaining_time: "02:50.267", type: "striker" },
        { cost: 40, order: 1, party_number: 2, remaining_time: "02:49.733", type: "striker" }
      ],
      total_score: 39297123,
      url: "https://www.youtube.com/watch?v=OT93rwPOs4g",
      validation_errors: [
        "Party 1 metadata lists Kanna as a striker, but her skill usage indicates she is Special Kanna (20023). The party composition has been adjusted to reflect Special Kanna in the specials array."
      ]
    },
    analysis_type: "ai",
    version: 1,
    created_at: "2025-09-11T23:52:08+09:00",
    updated_at: "2025-09-11T23:52:08+09:00"
  }
]

export function findVideoById(id: number): VideoAnalysisData | undefined {
  return mockVideos.find(video => video.id === id)
}