import { PrismaClient } from '@prisma/client';
import { CacheService } from '../cache/cacheService';
import { FilesService } from '../files/filesService';
import { FromSchema } from 'json-schema-to-ts';
import { projectCreateSchema, projectSchema } from './projectsSchema';
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
    const project: Project = {
      ...createdProject,
      createdAt: createdProject.createdAt.toISOString(),
      updatedAt: createdProject.updatedAt.toISOString(),
      images: createdProject.images.map((image) => ({
        ...image,
        createdAt: image.createdAt.toISOString(),
      })),
    };

    return project;
  }

  public async getProjectsByPayload() {}

  public async updateProjectById() {}

  public async deleteProjectById() {}
}
