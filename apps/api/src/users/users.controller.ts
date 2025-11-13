import { Controller } from "@nestjs/common";
import { Implement, implement, populateContractRouterPaths } from "@orpc/nest";
import { usersContract } from "../contracts/users.contract";
import { UsersService } from "./users.service";
import { InferInsertModel } from "drizzle-orm";
import { users } from "src/server/db/schema";

const contract = populateContractRouterPaths(usersContract);

type NewUser = InferInsertModel<typeof users>;

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
      return this.svc.create(input.body);
    });
  }
}
