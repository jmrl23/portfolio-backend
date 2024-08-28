import { Prisma, PrismaClient } from '@prisma/client';
import { CacheService } from '../cache/cacheService';
import { FilesService } from '../files/filesService';
import { FromSchema } from 'json-schema-to-ts';
import {
  projectCreateSchema,
  projectSchema,
  projectUpdateImagesSchema,
} from './projectsSchema';
import { Conflict } from 'http-errors';

type Project = FromSchema<typeof projectSchema>;

export class ProjectsService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly filesService: FilesService,
    private readonly prismaClient: PrismaClient,
  ) {}

  public async createProject(
    body: FromSchema<typeof projectCreateSchema>,
  ): Promise<Project> {
    const existingProject = await this.prismaClient.project.findUnique({
      where: { name: body.name },
      select: { id: true },
    });

    if (existingProject) throw new Conflict('Project already exists');

    const createdProject = await this.prismaClient.project.create({
      data: {
        name: body.name,
        description: body.description,
        repositoryUrl: body.repositoryUrl,
        previewUrl: body.previewUrl,
        topics: body.topics,
        images: {
          connect: body.images?.map((imageId) => ({ id: imageId })),
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        description: true,
        repositoryUrl: true,
        topics: true,
        images: {
          select: {
            id: true,
            createdAt: true,
            name: true,
            size: true,
            mimetype: true,
            url: true,
          },
        },
      },
    });

    return ProjectsService.serializeProject(createdProject);
  }

  public async getProjectsByPayload() {}

  public async updateProjectById(
    id: string,
    body: Omit<FromSchema<typeof projectUpdateImagesSchema>, 'id'>,
  ): Promise<Project> {
    const updatedProject = await this.prismaClient.project.update({
      where: { id },
      data: {
        images: {
          connect: body.add?.map((imageId) => ({ id: imageId })),
          disconnect: body.remove?.map((imageId) => ({ id: imageId })),
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        description: true,
        repositoryUrl: true,
        topics: true,
        images: {
          select: {
            id: true,
            createdAt: true,
            name: true,
            size: true,
            mimetype: true,
            url: true,
          },
        },
      },
    });

    return ProjectsService.serializeProject(updatedProject);
  }

  public async deleteProjectById() {}

  private static serializeProject(
    project: Prisma.ProjectGetPayload<{
      select: {
        id: true;
        createdAt: true;
        updatedAt: true;
        name: true;
        description: true;
        repositoryUrl: true;
        topics: true;
        images: {
          select: {
            id: true;
            createdAt: true;
            name: true;
            size: true;
            mimetype: true;
            url: true;
          };
        };
      };
    }>,
  ): Project {
    return {
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      images: project.images.map((image) => ({
        ...image,
        createdAt: image.createdAt.toISOString(),
      })),
    };
  }
}
