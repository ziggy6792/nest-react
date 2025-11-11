import { Controller } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { users } from '@contract/users.contract';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @TsRestHandler(users)
  handler(): ReturnType<typeof tsRestHandler<typeof users>> {
    return tsRestHandler(users, {
      list: async () => ({
        status: 200,
        body: await this.svc.findAll(),
      }),
      byId: async ({ params }) => ({
        status: 200,
        body: await this.svc.findOne(params.id),
      }),
      add: async ({ body }) => {
        return {
          status: 201 as const,
          body: await this.svc.create({ name: body.name }),
        };
      },
    });
  }
}

