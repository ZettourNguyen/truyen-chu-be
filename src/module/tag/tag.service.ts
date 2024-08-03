import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateTagDto, DeleteNovelTagDto, NovelTagDto, UpdateTagDto } from './dto/tag.dto';
import {capitalizeWords, formatString, replaceMultipleSpacesAndTrim} from '../../utils/word';
import { RoleService } from '../role/role.service';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService,
    private readonly roleService: RoleService
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

    if (tagName) {
      throw new ForbiddenException(`Tên thẻ '${name}' đã tồn tại.`);
    }
  }
  // create tag
  async create(createTagDto: CreateTagDto) {
    await this.roleService.checkPermission(createTagDto.userId, "Tag")
    const inputName = replaceMultipleSpacesAndTrim((createTagDto.name))  //
    const name = capitalizeWords(inputName)
    await this.validateTagName(inputName); 

    return this.prisma.tag.create({
      data: {
        name: name,
      },
    });
  }


  async findAll() {
    return this.prisma.tag.findMany({
      orderBy:{
        name: 'asc'
      }
    });
  }

  async findOne(name: string) {
    return this.prisma.tag.findFirst({
      where: { name: name },
    });
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    await this.roleService.checkPermission(+updateTagDto.userId, "Tag")
    const inputName = replaceMultipleSpacesAndTrim((updateTagDto.name))  //
    const name = capitalizeWords(inputName)
    await this.validateTagName(inputName); 

    return this.prisma.tag.update({
      where: { id },
      data: {
        name: updateTagDto.name
      },
    });
  }

  async remove(userId: number, tagId: number) {
    await this.roleService.checkPermission(userId, "Tag")
    return this.prisma.tag.delete({
      where: { id: tagId },
    });
  }

  // =============================== TagName service ==================================
  // =============================== TagName service ==================================
  // =============================== TagName service ==================================

  // Lấy danh sách tagId và tagName theo novelId
  async getTagByNovelId(novelId: number) {
    const arrTags = await this.getAllTagIdByNovelId(novelId);
    const tagIds = arrTags.map(tag => tag.tagId);
    const tags = await this.prisma.tag.findMany({
      where: {
        id: { in: tagIds },
      },
    });
    if (!tags || tags.length === 0) {
      throw new NotFoundException(`Không có tag nào trong novel ${novelId} này`);
    }
    return tags;
  }

  // Lấy danh sách của novelId
  async getAllTagIdByNovelId(novelId: number){
    const arrTags = await this.prisma.novelTag.findMany({
      where:{
        novelId: novelId
      },
      select:{
        tagId:true
      }
    })
    if (!arrTags) {
      throw new NotFoundException(`Không có tag nào trong novel ${novelId} này`)
    }
    return arrTags
  }

  // Lấy danh sách novel cua tagId
  async getAllNovelIdByTagId(tagId: number){
    const arrNovels = await this.prisma.novelTag.findMany({
      where:{
        tagId: tagId
      },
      select:{
        novelId:true
      }
    })
    if (!arrNovels) {
      throw new NotFoundException(`Không có novel chứa tag ${tagId} này`)
    }
    return arrNovels
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
    return novelTag
  }

  // create novel-tag
  async createNovelTag( tagId: number, novelId: number, prisma: PrismaService) {
    const tagName = await this.getTagName(tagId) // ktra tag existed và lấy tag

    // ktra da co trong db chua | co => loi
    const novelTag = await this.validateNovelTag(novelId, tagId)
    if (novelTag) {
      throw new BadRequestException(`Da ton tai ${tagName} trong novel`)
    }
    // luu novel-tag
    const saveNovelTag = await prisma.novelTag.create({
      data: {
        novelId: novelId,
        tagId: tagId,
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
    return delNovelTag
  }










}
