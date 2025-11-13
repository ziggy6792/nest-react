import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import { contract } from '../contracts/users.contract';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Implement(contract.users.list)
  list() {
    return implement(contract.users.list).handler(() => {
      return this.svc.findAll();
    });
  }

  @Implement(contract.users.byId)
  byId() {
    return implement(contract.users.byId).handler(({ input }) => {
      return this.svc.findOne(input.params.id);
    });
  }

  @Implement(contract.users.add)
  add() {
    return implement(contract.users.add).handler(({ input }) => {
      return this.svc.create({ name: input.body.name });
    });
  }
}

