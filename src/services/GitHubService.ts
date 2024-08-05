import { GITHUB_PERSONAL_ACCESS_TOKEN } from '../lib/constant/env';
import CacheService from './CacheService';

interface Project {
  id: number;
  name: string;
  description: string;
  url: string;
  languages: string[];
}

export default class GitHubService {
  constructor(private readonly cacheService: CacheService) {}

  public async getProjects(): Promise<Project[]> {
    const cacheKey = `getProjects:[]`;
    const cachedData = await this.cacheService.get<Project[]>(cacheKey);
    if (cachedData !== undefined) return cachedData;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        query: `
        {
          user(login: "jmrl23") {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  id
                  name
                  description
                  url
                  languages(first: 10) {
                    nodes {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `,
      }),
    });
    const graphqlData = await response.json();
    const repos: Project[] = graphqlData.data.user.pinnedItems.nodes.map(
      (repo: Record<string, any>) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.url,
        languages: repo.languages.nodes.map(
          (language: Record<string, unknown>) => language.name,
        ),
      }),
    );

    await this.cacheService.set(cacheKey, repos);

    return repos;
  }
}
