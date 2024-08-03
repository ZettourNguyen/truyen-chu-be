export interface CreateTagDto {
  userId: number
  name: string;
}

export interface UpdateTagDto {
  userId: string
  name: string;
}


export interface NovelTagDto {
  novelId: number
  tagId: number;
}



// export interface UpdateNovelTagDto {
//   novelId: number
//   tagId: number;
// }
export interface DeleteNovelTagDto {
  novelId: number
  tagId: number;
}