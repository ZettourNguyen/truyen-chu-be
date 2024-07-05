import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateNovelTagDto, CreateTagDto, DeleteNovelTagDto, NovelTagDto, UpdateTagDto } from './dto/tag.dto';
import {capitalizeWords, replaceMultipleSpacesAndTrim} from '../../utils/word';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService,
  ) { }

  async getTagName(id: number) {
    const tagName = await this.prisma.tag.findUnique({
      where: {
        id
      }
    })
    if (!tagName) {
      throw new NotFoundException(`Not found ${id} tag`)
    }
    return tagName.name
  }

  async validateTagName(name: string) {
    const tagName = await this.prisma.tag.findFirst({
      where: {
        name: name,
      },
    });
    console.log(tagName)

    if (tagName) {
      throw new ForbiddenException(`Tag with name '${name}' already exists.`);
    }
  }
  // create tag
  async create(createTagDto: CreateTagDto) {
    const inputName = replaceMultipleSpacesAndTrim(createTagDto.name)  //
    await this.validateTagName(inputName); 

    const name = capitalizeWords(inputName)
    return this.prisma.tag.create({
      data: {
        name: name,
      },
    });
  }


  async findAll() {
    return this.prisma.tag.findMany();
  }

  async findOne(name: string) {
    return this.prisma.tag.findFirst({
      where: { name: name },
    });
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    return this.prisma.tag.update({
      where: { id },
      data: updateTagDto,
    });
  }

  async remove(id: number) {
    return this.prisma.tag.delete({
      where: { id },
    });
  }

  // =============================== TagName service ==================================
  // =============================== TagName service ==================================
  // =============================== TagName service ==================================


  // lay tat ca cac tag cua novelId
  async getAllNovelTagByNovelId(novelId: number){
    const listTag = this.prisma.novelTag.findMany({
      where:{
        novelId: novelId
      }
    })
    if (listTag=== null) {
      throw new NotFoundException(`Không có tag nào trong novel ${novelId} này`)
    }
    return listTag
  }

  // lay tat ca cac novel cua tagId
  async getAllNovelTagByTagId(tagId: number){
    const listNovel = this.prisma.novelTag.findMany({
      where:{
        novelId: tagId
      }
    })
    if (listNovel=== null) {
      throw new NotFoundException(`Không có novel chứa tag ${tagId} này`)
    }
    return listNovel
  }


  // ktra ton tai novel-tag
  async validateNovelTag(novelId, tagId) {
    const novelTag = await this.prisma.novelTag.findUnique({
      where: {
        tagId_novelId:{
          novelId: novelId,
          tagId: tagId,
        }
      },
    });
    return !!novelTag
  }

  // create novel-tag
  async createNovelTag(data: CreateNovelTagDto) {
    const tagName = await this.getTagName(data.tagId) // ktra tag existed và lấy tag

    // ktra da co trong db chua | co => loi
    const novelTag = this.validateNovelTag(data.novelId, data.tagId)
    if (novelTag) {
      throw new BadRequestException(`Da ton tai ${tagName} trong novel`)
    }
    // luu novel-tag
    const saveNovelTag = await this.prisma.novelTag.create({
      data: {
        novelId: data.novelId,
        tagId: data.tagId,
      },
    });
    if (!saveNovelTag) {
      throw new InternalServerErrorException(`Tao novelTag co van de, xin thu lai`)
    }
    return saveNovelTag
  }
  
  // delete novel-tag
  async deleteNovelTag(data: DeleteNovelTagDto) {
    const tagName = await this.getTagName(data.tagId) // ktra tag existed và lấy tag name

    // ktra da co trong db chua | chua co => loi
    const novelTag = this.validateNovelTag(data.novelId, data.tagId)
    if (!novelTag) {
      throw new BadRequestException(`Chua ton tai ${tagName} trong novel`)
    }

    // Xoa novel-tag
    const delNovelTag = await this.prisma.novelTag.delete({
      where: {
        tagId_novelId: {
          novelId: data.novelId,
          tagId: data.tagId,
        },
      },
    });
    // if (delNovelTag > 0) {
    //   console.log(`Deleted ${delNovelTag} novel tag(s) successfully.`);
    // } else {
    //   console.log(`No novel tag deleted.`);
    // }
    return delNovelTag
  }










}
