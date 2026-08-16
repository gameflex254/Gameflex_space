export {
  GAMEFLEX_BUCKETS,
  GAMEFLEX_BUCKET_LIST,
  GAMEFLEX_BUCKET_REGISTRY,
  getBucketConfig,
  isGameflexBucket,
} from "@/storage/buckets";

export const STORAGE_BUCKETS = {
  STATUS_MEDIA: "status-media",
  AVATARS: "avatars",
  TOURNAMENT_IMAGES: "tournament-images",
  FLEX: "flex",
  MESSAGES: "messages",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
