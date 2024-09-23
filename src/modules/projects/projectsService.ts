import { SavedMultipartFile } from '@fastify/multipart';
import { Prisma, PrismaClient } from '@prisma/client';
import { Conflict, NotFound } from 'http-errors';
import { FromSchema } from 'json-schema-to-ts';
import ms from 'ms';
import { GITHUB_USERNAME } from '../../lib/constant/env';
import { CacheService } from '../cache/cacheService';
import { fileSchema } from '../files/filesSchema';
import { FilesService } from '../files/filesService';
import {
  projectCreateSchema,
  projectListPayloadSchema,
  projectSchema,
  projectUpdateImagesSchema,
  projectUpdateSchema,
} from './projectsSchema';

type Project = FromSchema<typeof projectSchema>;

type ProjectCreateBody = Omit<
  FromSchema<typeof projectCreateSchema>,
  'images'
> & {
  readonly images: SavedMultipartFile[];
};

type ProjectListPayload = FromSchema<typeof projectListPayloadSchema>;

type ProjectUpdateBody = Omit<FromSchema<typeof projectUpdateSchema>, 'id'>;

type ProjectUpdateImagesBody = Omit<
  FromSchema<typeof projectUpdateImagesSchema.properties.body>,
  'upload'
> & {
  readonly upload: SavedMultipartFile[];
};

export class ProjectsService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly prismaClient: PrismaClient,
    private readonly filesService: FilesService,
  ) {}

  public async createProject(body: ProjectCreateBody): Promise<Project> {
    const existingProject = await this.prismaClient.project.findUnique({
      where: { name: body.name },
      select: { id: true },
    });

    if (existingProject) throw new Conflict('Project already exists');

    if (GITHUB_USERNAME && !body.description) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(GITHUB_USERNAME)}/${encodeURIComponent(body.name)}`,
        );
        const data = await response.json();
        const description = data.description ?? null;
        body.description = description;
      } catch {
        // just try adding description from github if not present
      }
    }

    const images = await this.uploadImages(body.images);
    const createdProject = await this.prismaClient.project.create({
      data: {
        name: body.name,
        description: body.description,
        repositoryUrl: body.repositoryUrl,
        previewUrl: body.previewUrl,
        topics: body.topics,
        images: {
          connect: images.map((image) => ({ id: image.id })),
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

  public async getProjectsByPayload(
    payload: ProjectListPayload,
  ): Promise<Project[]> {
    const cacheKey = `ProjectsService:Projects:[ref:payload]:(${JSON.stringify([
      payload.createdAtFrom,
      payload.createdAtTo,
      payload.updatedAtFrom,
      payload.updatedAtTo,
      payload.skip,
      payload.take,
      payload.order,
      payload.id,
      payload.name,
      payload.description,
      payload.previewUrl,
      payload.repositoryUrl,
      `(${JSON.stringify(payload.topics)})`,
    ])})`;

    if (payload.revalidate === true) {
      await this.cacheService.del(cacheKey);
    }

    const cachedData = await this.cacheService.get<Project[]>(cacheKey);
    if (cachedData !== undefined) return cachedData;

    const projects = await this.prismaClient.project.findMany({
      where: {
        createdAt: {
          gte: payload.createdAtFrom,
          lte: payload.createdAtTo,
        },
        updatedAt: {
          gte: payload.updatedAtFrom,
          lte: payload.updatedAtTo,
        },
        id: payload.id,
        name: {
          startsWith: payload.name,
        },
        description: {
          startsWith: payload.description,
        },
        previewUrl: {
          startsWith: payload.description,
        },
        repositoryUrl: {
          startsWith: payload.repositoryUrl,
        },
        topics: payload.topics
          ? {
              hasSome: payload.topics,
            }
          : undefined,
      },
      skip: payload.skip,
      take: payload.take,
      orderBy: {
        createdAt: payload.order,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        description: true,
        repositoryUrl: true,
        previewUrl: true,
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    const projectList: Project[] = projects.map((project) =>
      ProjectsService.serializeProject(project),
    );
    await this.cacheService.set(cacheKey, projectList, ms('5m'));
    return projectList;
  }

  public async updateProjectById(
    id: string,
    body: ProjectUpdateBody,
  ): Promise<Project> {
    const updatedProject = await this.prismaClient.project.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        repositoryUrl: body.repositoryUrl,
        previewUrl: body.previewUrl,
        topics: body.topics,
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

  public async updateProjectImagesById(
    id: string,
    body: ProjectUpdateImagesBody,
  ): Promise<Project> {
    const images = await this.uploadImages(body.upload);
    const updatedProject = await this.prismaClient.project.update({
      where: { id },
      data: {
        images: {
          connect: images.map((image) => ({ id: image.id })),
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

    const imagesToRemove = updatedProject.images
      .map((image) => image.id)
      .filter((id) => body.remove?.includes(id));
    await Promise.all(
      imagesToRemove.map((fileId) => this.filesService.deleteFileById(fileId)),
    );

    for (const imageId of imagesToRemove) {
      const idx = updatedProject.images.findIndex(
        (image) => image.id === imageId,
      );
      if (idx > -1) {
        updatedProject.images.splice(idx, 1);
      }
    }

    return ProjectsService.serializeProject(updatedProject);
  }

  public async deleteProjectById(id: string): Promise<Project> {
    const existingProject = await this.prismaClient.project.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existingProject) throw new NotFound('Project not found');

    const project = await this.prismaClient.project.delete({
      where: {
        id,
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

    const imageIds = project.images.map((image) => image.id);
    await Promise.all(
      imageIds.map((id) => this.filesService.deleteFileById(id)),
    );
    return ProjectsService.serializeProject(project);
  }

  public static serializeProject(
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
      images: project.images.map((image) => FilesService.serializeFile(image)),
    };
  }

  public async uploadImages(
    files: SavedMultipartFile[],
  ): Promise<FromSchema<typeof fileSchema>[]> {
    const imageFiles = files.filter((file) =>
      file.mimetype.startsWith('image'),
    );
    const uploadedImageFiles = await Promise.allSettled(
      imageFiles.map((image) => this.filesService.uploadFile(image)),
    );
    const images = uploadedImageFiles
      .filter((response) => response.status === 'fulfilled')
      .map((response) => response.value);
    return images;
  }
}
