
import {post,get} from "@/utils/http";

//获取省市区
export function getAddress(data: string) {
    return post('/getAddress',data);
  
  }