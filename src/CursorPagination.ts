import type { ModelQueryBuilderContract, BaseModel } from '@ioc:Adonis/Lucid/Orm'
import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'

export type PaginationResult<TData extends any, TCursor extends any = number> = {
  data: TData[],
  after: TCursor | null
  before: TCursor | null
}

export function CursorPagination<TModel extends NormalizeConstructor<typeof BaseModel>>(superclass: TModel) {
  return class extends superclass {
    public static async paginateCursor(
      query: ModelQueryBuilderContract<typeof superclass>,
      cursor: number | null,
      limit: number,
      direction: 'after' | 'before'
    ): Promise<PaginationResult<any>> {
      let results: InstanceType<TModel>[];

      if (cursor) {
        if (direction === 'after') {
          query = query.where('id', '>', cursor).orderBy('id', 'asc')
        } else {
          query = query.where('id', '<', cursor).orderBy('id', 'desc')
        }
      } else {
        query.orderBy('id', 'asc')
      }

      results = await query.limit(limit + 1)

      if (direction === 'before') {
        results = results.reverse()
      }

      const hasMore = results.length > limit
      const paginatedResults = hasMore ? results.slice(0, limit) : results
      const afterCursor = hasMore ? results[limit - 1].$original['id'] : null
      const beforeCursor = paginatedResults.length > 0 ?paginatedResults[0].$original['id'] : null

      return {
        data: paginatedResults,
        after: direction === 'after' ? afterCursor : null,
        before: direction === 'before' ? beforeCursor : null,
      }
    }
  }
}
