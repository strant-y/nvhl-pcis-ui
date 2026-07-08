import { post } from "@/utils/http";
import type { ApiResult } from "@/types/api";
import type { PreventionPageVO, PreventionQuery } from "./types";

export function getPlatformPage(
  queryParams: PreventionQuery
): Promise<ApiResult<PageResult<PreventionPageVO[]>>> {
  return post("/prevention/getPlatformPage", queryParams);
}

