export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name?: string;
}


export interface NovelTagDto {
  novelId: number
  tagId: number;
}


export interface CreateNovelTagDto {
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